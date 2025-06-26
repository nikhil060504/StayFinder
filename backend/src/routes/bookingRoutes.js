const express = require("express");
const { check, body } = require("express-validator");
const {
  createBooking,
  getUserBookings,
  getHostBookings,
  getBooking,
  updateBookingStatus,
  deleteBooking,
} = require("../controllers/bookingController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// All routes are protected
router.use(protect);

// Validation middleware
const bookingValidation = [
  body("listingId").isMongoId().withMessage("Invalid listing ID"),
  body("checkIn").isISO8601().withMessage("Invalid check-in date"),
  body("checkOut").isISO8601().withMessage("Invalid check-out date"),
  body("guests")
    .isInt({ min: 1 })
    .withMessage("Number of guests must be at least 1"),
];

const statusValidation = [
  body("status")
    .isIn(["pending", "confirmed", "cancelled", "completed"])
    .withMessage("Invalid booking status"),
];

// Guest routes
router.post("/", bookingValidation, createBooking);
router.get("/my-bookings", getUserBookings);
router.get("/:id", getBooking);

// Host routes
router.get("/host/bookings", authorize("host", "admin"), getHostBookings);
router.put(
  "/:id/status",
  authorize("host", "admin"),
  statusValidation,
  updateBookingStatus
);
router.delete("/:id", authorize("host", "admin"), deleteBooking);

module.exports = router;
