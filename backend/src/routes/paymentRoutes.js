const express = require("express");
const {
  createPaymentOrder,
  verifyPayment,
  getPaymentDetails,
  refundBookingPayment,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// All payment routes require authentication
router.use(protect);

// Create payment order
router.post("/create-order", createPaymentOrder);

// Verify payment
router.post("/verify", verifyPayment);

// Get payment details
router.get("/:bookingId", getPaymentDetails);

// Refund payment
router.post("/refund", refundBookingPayment);

module.exports = router;

