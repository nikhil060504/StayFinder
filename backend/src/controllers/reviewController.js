const Review = require("../models/Review");
const Booking = require("../models/Booking");
const Listing = require("../models/Listing");

// Create review
exports.createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;
    const userId = req.user.id;

    // Validate booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if user is the guest
    if (booking.guest.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the guest can review this booking",
      });
    }

    // Check if booking is completed
    if (booking.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Can only review completed bookings",
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "Review already exists for this booking",
      });
    }

    // Create review
    const review = new Review({
      booking: bookingId,
      listing: booking.listing,
      guest: userId,
      host: booking.host,
      rating,
      comment,
    });

    await review.save();

    // Update listing average rating
    const reviews = await Review.find({ listing: booking.listing });
    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Listing.findByIdAndUpdate(booking.listing, {
      averageRating: avgRating,
      reviewCount: reviews.length,
    });

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get reviews for listing
exports.getListingReviews = async (req, res) => {
  try {
    const { listingId } = req.params;

    const reviews = await Review.find({ listing: listingId })
      .populate("guest", "firstName lastName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get reviews for host
exports.getHostReviews = async (req, res) => {
  try {
    const hostId = req.user.id;

    const reviews = await Review.find({ host: hostId })
      .populate("guest", "firstName lastName")
      .populate("listing", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get reviews by guest
exports.getGuestReviews = async (req, res) => {
  try {
    const guestId = req.user.id;

    const reviews = await Review.find({ guest: guestId })
      .populate("listing", "title")
      .populate("host", "firstName lastName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update review
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check if user is the reviewer
    if (review.guest.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own reviews",
      });
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    await review.save();

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check if user is the reviewer
    if (review.guest.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own reviews",
      });
    }

    await Review.findByIdAndDelete(reviewId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

