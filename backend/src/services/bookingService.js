const Booking = require("../models/Booking");
const Listing = require("../models/Listing");

// Helper function to check listing availability
const checkAvailability = async (listingId, checkIn, checkOut) => {
  const existingBooking = await Booking.findOne({
    listing: listingId,
    status: { $in: ["confirmed", "pending"] },
    $or: [
      {
        checkIn: { $lte: new Date(checkIn) },
        checkOut: { $gte: new Date(checkIn) },
      },
      {
        checkIn: { $lte: new Date(checkOut) },
        checkOut: { $gte: new Date(checkOut) },
      },
    ],
  });
  return !existingBooking;
};

const createBookingService = async (user, body) => {
  const { listingId, checkIn, checkOut, guests } = body;
  const listing = await Listing.findById(listingId);
  if (!listing) throw new Error("Listing not found");
  const isAvailable = await checkAvailability(listingId, checkIn, checkOut);
  if (!isAvailable) throw new Error("Listing is not available for these dates");
  if (guests > listing.maxGuests)
    throw new Error("Number of guests exceeds maximum allowed");
  const nights = Math.ceil(
    (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
  );
  const totalPrice =
    nights * listing.price.base +
    (listing.price.cleaningFee || 0) +
    (listing.price.serviceFee || 0);
  const booking = await Booking.create({
    listing: listingId,
    guest: user._id,
    host: listing.host,
    checkIn,
    checkOut,
    guests,
    totalPrice,
  });
  await Listing.findByIdAndUpdate(listingId, {
    $push: {
      availability: {
        startDate: checkIn,
        endDate: checkOut,
      },
    },
  });
  return booking;
};

const getUserBookingsService = async (user) => {
  return Booking.find({ guest: user._id })
    .populate("listing", "title images location price")
    .populate("host", "firstName lastName email avatar")
    .sort({ createdAt: -1 });
};

const getHostBookingsService = async (user) => {
  return Booking.find({ host: user._id })
    .populate("listing", "title images location price")
    .populate("guest", "firstName lastName email avatar")
    .sort({ createdAt: -1 });
};

const getBookingService = async (user, bookingId) => {
  const booking = await Booking.findById(bookingId)
    .populate("listing", "title images location price")
    .populate("host", "firstName lastName email avatar phoneNumber")
    .populate("guest", "firstName lastName email avatar phoneNumber");
  if (!booking) throw new Error("Booking not found");
  if (
    booking.guest._id.toString() !== user._id.toString() &&
    booking.host._id.toString() !== user._id.toString()
  ) {
    throw new Error("Not authorized to view this booking");
  }
  return booking;
};

const updateBookingStatusService = async (user, bookingId, status) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error("Booking not found");
  if (booking.host.toString() !== user._id.toString())
    throw new Error("Not authorized to update this booking");
  booking.status = status;
  await booking.save();
  if (status === "cancelled") {
    await Listing.findByIdAndUpdate(booking.listing, {
      $pull: {
        availability: {
          startDate: booking.checkIn,
          endDate: booking.checkOut,
        },
      },
    });
  }
  return booking;
};

const deleteBookingService = async (user, bookingId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error("Booking not found");
  const listing = await Listing.findById(booking.listing);
  if (!listing) throw new Error("Listing not found");
  if (listing.host.toString() !== user.id)
    throw new Error("Not authorized to delete this booking");
  if (booking.status === "confirmed") {
    await Listing.findByIdAndUpdate(booking.listing, {
      $pull: {
        availability: {
          startDate: booking.checkIn,
          endDate: booking.checkOut,
        },
      },
    });
  }
  await booking.deleteOne();
  return { message: "Booking deleted successfully" };
};

module.exports = {
  createBookingService,
  getUserBookingsService,
  getHostBookingsService,
  getBookingService,
  updateBookingStatusService,
  deleteBookingService,
};
