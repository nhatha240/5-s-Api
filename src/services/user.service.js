const httpStatus = require('http-status');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return User.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<void>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id).lean();
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (user, updateBody) => {
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, user.id))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

/**
 * thóng kê user theo tuần tháng
 */

const createdLastTimeCount = async (time) => {
  // Lượng người dùng vào web
  const user = await User.countDocuments({
    createdAt: { $gte: time },
  });
  // Số lượng product thêm vào giỏ hàng
  // Số lượng đơn hàng
  // Số lượng người dùng đăng ký
  return user;
};

const lastLoginLastTimeCount = async (time) => {
  const user = await User.countDocuments({
    lastLogin: { $gte: time },
  });
  return user;
};

const createdTotal = async (now, startOfCurrentMonth, startOfLastMonth, endOfLastMonth) => {
  try {
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfCurrentMonth, $lt: now },
    });

    // Số lượng người dùng mới trong tháng trước
    const newUsersLastMonth = await User.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonth },
    });

    // Số lượng người dùng đăng nhập trong tháng này
    const loginsThisMonth = await User.countDocuments({
      lastLogin: { $gte: startOfCurrentMonth, $lt: now },
    });

    // Số lượng người dùng đăng nhập trong tháng trước
    const loginsLastMonth = await User.countDocuments({
      lastLogin: { $gte: startOfLastMonth, $lt: startOfCurrentMonth },
    });
    const newUserPercentageChange =
      newUsersLastMonth === 0 ? 100 : ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100;
    const loginUserPercentageChange =
      loginsLastMonth === 0 ? 100 : ((loginsThisMonth - loginsLastMonth) / loginsLastMonth) * 100;
    return {
      newUsersThisMonth,
      loginsThisMonth,
      newUserPercentageChange,
      loginUserPercentageChange,
    };
  } catch (err) {
    console.error('Lỗi:', err);
  }
};
const updateUserByUserId = async (userId, updateBody) => {
  const user = await User.findOne({ _id: userId});
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  if (updateBody.password == '' || updateBody.password == null || updateBody.password == undefined || updateBody.password.length <= 8) {
    delete updateBody.password;
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
}
module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  createdLastTimeCount,
  lastLoginLastTimeCount,
  createdTotal,
  updateUserByUserId,
};
