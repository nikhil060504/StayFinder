const express = require("express");
const {
  createReview,
  getListingReviews,
  getHostReviews,
  getGuestReviews,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Create review (requires auth)
router.post("/", protect, createReview);

// Get reviews for listing (public)
router.get("/listing/:listingId", getListingReviews);

// Get reviews for host (requires auth)
router.get("/host", protect, getHostReviews);

// Get reviews by guest (requires auth)
router.get("/guest", protect, getGuestReviews);

// Update review (requires auth)
router.put("/:reviewId", protect, updateReview);

// Delete review (requires auth)
router.delete("/:reviewId", protect, deleteReview);

module.exports = router;

