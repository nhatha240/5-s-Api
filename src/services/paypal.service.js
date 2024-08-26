// Compare this snippet from src/services/paypal.service.js:
const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_BASE_URL } = require('../config/config');
const ApiError = require('../utils/ApiError');
const { Payment } = require('../models');
async function generateAccessToken() {
  // To base64 encode your client id and secret using NodeJs
  const BASE64_ENCODED_CLIENT_ID_AND_SECRET = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

  const request = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${BASE64_ENCODED_CLIENT_ID_AND_SECRET}`,
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      response_type: 'id_token',
      intent: 'sdk_init',
    }),
  });
  const json = await request.json();
  return json.access_token;
}

async function handleResponse(response) {
  try {
    const jsonResponse = await response.json();
    return {
      jsonResponse,
      httpStatusCode: response.status,
    };
  } catch (err) {
    console.error(err);
    const errorMessage = await response.text();
    throw new ApiError(errorMessage);
  }
}
const PayPalPaymentCreate = async (order) => {
  return {
    intent: 'CAPTURE',
    purchase_units: [{ reference_id: order.id, amount: { currency_code: 'USD', value: order.totalAmount } }],
    payment_source: {
      paypal: {
        experience_context: {
          payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
          brand_name: 'Win yourself Inc',
          locale: 'en-US',
          landing_page: 'LOGIN',
          user_action: 'PAY_NOW',
          return_url: 'http://127.0.0.1:3001/user/payment/success',
          cancel_url: 'http://127.0.0.1:3001/user/payment/continue-shopping',
        },
      },
    },
  };

  // {
  //   intent: 'CAPTURE',
  //   redirect_urls: {
  //     return_url: 'http://127.0.0.1:3001/v1/user/payment/return', // Replace with your return URL
  //     cancel_url: 'http://127.0.0.1:3001/v1user/payment/cancel', // Replace with your cancel URL
  //   },
  //   transactions: [
  //     {
  //       item_list: {
  //         items: order.products.map((product) => ({
  //           name: product.idProduct,
  //           price: product.priceTotal,
  //           currency: 'USD',
  //           quantity: product.quantity,
  //         })),
  //       },
  //       amount: {
  //         currency: 'USD',
  //         total: order.totalAmount,
  //       },
  //       description: 'Your order description',
  //     },
  //   ],
  // };
};

const createOrder = async (cart) => {
  const accessToken = await generateAccessToken();
  const url = `${PAYPAL_BASE_URL}/v2/checkout/orders`;
  const payload = await PayPalPaymentCreate(cart);
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      // Uncomment one of these to force an error for negative testing (in sandbox mode only).
      // Documentation: https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
      // "PayPal-Mock-Response": '{"mock_application_codes": "MISSING_REQUIRED_PARAMETER"}'
      // "PayPal-Mock-Response": '{"mock_application_codes": "PERMISSION_DENIED"}'
      // "PayPal-Mock-Response": '{"mock_application_codes": "INTERNAL_SERVER_ERROR"}'
    },
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};

const captureOrder = async (order) => {
  const accessToken = await generateAccessToken();
  const url = `${PAYPAL_BASE_URL}/v2/checkout/orders/${order}/capture`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    method: 'POST',
  });
  return handleResponse(response);
};

const createPayment = async (transactionId, status, amount, orderId, method = 'PayPal') => {
  return Payment.create({
    transactionId,
    status,
    amount,
    orderId,
    method,
  });
};
const updatePayment = async (transactionId, status) => {
  const payment = await Payment.findOne({ transactionId });
  if (!payment) {
    throw new ApiError(404, 'Payment not found');
  }
  payment.status = status;
  await payment.save();
  return payment.orderId;
};

const getPaymentById = async (transactionId) => {
  const payments = await Payment.findOne({ transactionId });
  return payments;
};
module.exports = { createOrder, captureOrder, createPayment, updatePayment, getPaymentById };
