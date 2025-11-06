const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create payment order
const createPaymentOrder = async (amount, bookingId) => {
  try {
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: "INR",
      receipt: `booking_${bookingId}`,
    };

    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    throw new Error(`Error creating payment order: ${error.message}`);
  }
};

// Verify payment signature
const verifyPaymentSignature = (
  orderId,
  paymentId,
  signature
) => {
  try {
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    return expectedSignature === signature;
  } catch (error) {
    throw new Error(`Error verifying payment signature: ${error.message}`);
  }
};

// Refund payment
const refundPayment = async (paymentId, amount) => {
  try {
    const refund = await razorpay.payments.refund(paymentId, {
      amount: Math.round(amount * 100),
    });
    return refund;
  } catch (error) {
    throw new Error(`Error refunding payment: ${error.message}`);
  }
};

// Get payment details
const getPaymentDetails = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    throw new Error(`Error fetching payment details: ${error.message}`);
  }
};

module.exports = {
  createPaymentOrder,
  verifyPaymentSignature,
  refundPayment,
  getPaymentDetails,
};

