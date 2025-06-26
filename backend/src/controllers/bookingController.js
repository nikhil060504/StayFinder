const { validationResult } = require("express-validator");
const {
  createBookingService,
  getUserBookingsService,
  getHostBookingsService,
  getBookingService,
  updateBookingStatusService,
  deleteBookingService,
} = require("../services/bookingService");

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const booking = await createBookingService(req.user, req.body);
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user's bookings
// @route   GET /api/bookings
// @access  Private
const getUserBookings = async (req, res) => {
  try {
    const bookings = await getUserBookingsService(req.user);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get host's bookings
// @route   GET /api/bookings/host
// @access  Private (Host only)
const getHostBookings = async (req, res) => {
  try {
    const bookings = await getHostBookingsService(req.user);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
const getBooking = async (req, res) => {
  try {
    const booking = await getBookingService(req.user, req.params.id);
    res.json(booking);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private
const updateBookingStatus = async (req, res) => {
  try {
    const booking = await updateBookingStatusService(
      req.user,
      req.params.id,
      req.body.status
    );
    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private
const deleteBooking = async (req, res) => {
  try {
    const result = await deleteBookingService(req.user, req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getHostBookings,
  getBooking,
  updateBookingStatus,
  deleteBooking,
};
