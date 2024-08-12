const httpStatus = require('http-status');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { orderService, paypalService } = require('../services');
const pick = require('../utils/pick');
const Stripe = require('stripe');
const env = require('../config/config');
const stripe = Stripe(env.stripe_secret_key);

const addOrder = catchAsync(async (req, res) => {
  const { products } = req.body;
  let { address, phone } = req.body;
  const userId = req.user._id;
  if (!userId || !products || products.length === 0) {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Invalid request data' });
  }
  if (!address || !phone) {
    address = req.user.address;
    phone = req.user.phone;
  }
  const order = await orderService.createOrder(userId, products, address, phone);
  const { jsonResponse, httpStatusCode } = await paypalService.createOrder(order);
  paypalService.createPayment(jsonResponse.id, jsonResponse.status, order.totalAmount, order.id);
  res.status(httpStatusCode).json(jsonResponse);
});

const orderCapture = catchAsync(async (req, res) => {
  try {
    const { orderID } = req.params;
    const { jsonResponse, httpStatusCode } = await paypalService.captureOrder(orderID);
    const { orderId } = await paypalService.updatePayment(orderID, jsonResponse.status);
    const order = await orderService.getOrderById(orderId);
    order.status = 'success';
    await order.save();
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error('Failed to create order:', error);
    res.status(500).json({ error: 'Failed to capture order.' });
  }
});

const cancelOrder = catchAsync(async (req, res) => {
  const result = await orderService.cancelOrder(req.user._id, req.body.paymentId);
  res.send(result);
});

const getOrders = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['status']);
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'cursor']);

  const result = await orderService.getOrderByUser(req.user.id, filter, options);
  res.send(result);
});

const getOrder = catchAsync(async (req, res) => {
  const order = await orderService.getOrderById(req.user.id,req.params.orderId);
  if (!order) {
    console.log('Order not found', order);
    res.status(httpStatus.NOT_FOUND).json({ message: 'Order not found' });
  }
  res.send(order);
});

const webhookPayment = catchAsync(async (req, res) => {
  const endpointSecret = 'whsec_ae07bb077a33e2f10e340969384f62ef8e85226f8e12309f0bd1b7973cd3aa24';
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log(event);
  } catch (err) {
    console.log(req.body);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object;
      // Then define and call a function to handle the event payment_intent.succeeded
      break;
    case 'subscription_schedule.canceled':
      const subscriptionScheduleCanceled = event.data.object;
      // Then define and call a function to handle the event subscription_schedule.canceled
      break;
    case 'invoice.upcoming':
      const invoiceUpcoming = event.data.object;
      // Then define and call a function to handle the event invoice.upcoming
      break;
    case 'charge.captured':
      const chargeCaptured = event.data.object;
      // Then define and call a function to handle the event charge.captured
      break;
    case 'invoice.payment_succeeded':
      const invoicePaymentSucceeded = event.data.object;
      // Then define and call a function to handle the event invoice.payment_succeeded
      break;
    case 'payment_intent.payment_failed':
      const paymentIntentPaymentFailed = event.data.object;
      // Then define and call a function to handle the event payment_intent.payment_failed
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});

module.exports = {
  addOrder,
  getOrders,
  webhookPayment,
  cancelOrder,
  orderCapture,
  getOrder,
};
