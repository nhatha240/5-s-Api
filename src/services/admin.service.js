const httpStatus = require('http-status');
const { Admins } = require('../models');
const ApiError = require('../utils/ApiError');
/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<Admins>}
 */
const getAdminByEmail = async (email) => {
  return Admins.findOne({ email }).exec();
};

const createAdmin = async (body) => {
  if (await Admins.isEmailTaken(body.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return Admins.create(body);
};

const getAdminById = async (adminId) => {
  return Admins.findOne({ _id: adminId }).exec();
};

const updateAdminById = async (adminId, updateBody) => {
  const user = await getAdminById(adminId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await Admins.isEmailTaken(updateBody.email, adminId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

const getAdmins = async (filter, options) => {
  return Admins.paginate(filter, options);
};

const queryAdminId = async (adminId) => {
  return Admins.findOne({ _id: adminId })
    .populate({
      type: 'shops',
      options: {
        limit: 10,
        sort: { createdAt: -1 },
      },
    })
    .exec();
};

const removeAdmin = async (adminId) => {
  const user = await getAdminById(adminId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
};

const updateAdmin = async (adminId, updateBody) => {
  const user = await getAdminById(adminId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await Admins.isEmailTaken(updateBody.email, adminId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
}
module.exports = {
  getAdminByEmail,
  createAdmin,
  getAdminById,
  updateAdminById,
  getAdmins,
  queryAdminId,
  removeAdmin,
  updateAdmin,
};
