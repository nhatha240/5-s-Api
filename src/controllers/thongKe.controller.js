const catchAsync = require('../utils/catchAsync');
const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const { cartService, userService, orderService } = require('../services');

const bieuDo = catchAsync(async (req, res) => {
  // Thống kê theo tuần tháng

  // Lượng người dùng vào web
  let time;
  const queryTime = req.query.time;

  if (!queryTime || queryTime === 'week') {
    time = new Date();
    time.setDate(time.getDate() - 7);
  } else if (queryTime === 'month') {
    time = new Date();
    time.setMonth(time.getMonth() - 1);
  } else {
    return res.status(400).send('Invalid query time. Use "week" or "month".');
  }
  try {
    const createdLastTimeCount = await userService.createdLastTimeCount(time);
    // Số lượng product thêm vào giỏ hàng
    const cart = await cartService.thongKeProduct(time);
    // Số lượng đơn hàng
    const order = await orderService.thongKeOrder(time);
    // Số lượng người dùng đăng ký
    const lastLoginLastTimeCount = await userService.lastLoginLastTimeCount(time);

    res.send({
      createdLastTimeCount,
      cart,
      order,
      lastLoginLastTimeCount,
    });
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
});

const bayNgay = catchAsync(async (req, res) => {
  const time = new Date();
  time.setDate(time.getDate() - 7);
  try {
    const createdLastTimeCount = await userService.createdLastTimeCount(time);
    // Số lượng product thêm vào giỏ hàng
    const cart = await cartService.thongKeProduct(time);
    // Số lượng đơn hàng
    const order = await orderService.thongKeOrder(time);
    // Số lượng người dùng đăng ký
    const lastLoginLastTimeCount = await userService.lastLoginLastTimeCount(time);

    res.send({
      createdLastTimeCount,
      cart,
      order,
      lastLoginLastTimeCount,
    });
  } catch (error) {
    console.log(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
});

const total = catchAsync(async (req, res) => {
  // Thống kê tổng
  try {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const { currentMonthAmount, lastMonthAmount, percentageChange } = await orderService.totalMonth(
      now,
      startOfCurrentMonth,
      startOfLastMonth,
      endOfLastMonth,
    );

    const { newUsersThisMonth, loginsThisMonth, newUserPercentageChange, loginUserPercentageChange } =
      await userService.createdTotal(now, startOfCurrentMonth, startOfLastMonth, endOfLastMonth);

    const { ordersThisMonth, ordersLastMonth, orderPercentageChange } = await orderService.getMonthlyOrderStatsAndCompare(
      now,
      startOfCurrentMonth,
      startOfLastMonth,
      endOfLastMonth,
    );
    res.send({
      currentMonthAmount: currentMonthAmount,
      percentageChange: percentageChange,
      newUsersThisMonth: newUsersThisMonth,
      newUserPercentageChange: newUserPercentageChange,
      loginsThisMonth: loginsThisMonth,
      loginUserPercentageChange: loginUserPercentageChange,
      ordersThisMonth: ordersThisMonth,
      orderPercentageChange: orderPercentageChange,
    });
  } catch (error) {
    console.log(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
});

module.exports = {
  bieuDo,
  bayNgay,
  total,
};
