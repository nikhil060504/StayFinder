const { validationResult } = require("express-validator");
const {
  createListingService,
  getListingsService,
  getListingService,
  updateListingService,
  deleteListingService,
  getHostListingsService,
} = require("../services/listingService");

// @desc    Create a new listing
// @route   POST /api/listings
// @access  Private (Host only)
const createListing = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const listing = await createListingService(req.user, req.body);
    res.status(201).json(listing);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all listings with filters
// @route   GET /api/listings
// @access  Public
const getListings = async (req, res) => {
  try {
    const result = await getListingsService(req.query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get single listing
// @route   GET /api/listings/:id
// @access  Public
const getListing = async (req, res) => {
  try {
    const listing = await getListingService(req.params.id);
    res.json(listing);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// @desc    Update listing
// @route   PUT /api/listings/:id
// @access  Private (Host only)
const updateListing = async (req, res) => {
  try {
    const listing = await updateListingService(
      req.user,
      req.params.id,
      req.body
    );
    res.json(listing);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete listing
// @route   DELETE /api/listings/:id
// @access  Private (Host only)
const deleteListing = async (req, res) => {
  try {
    const result = await deleteListingService(req.user, req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get host's listings
// @route   GET /api/listings/host/my-listings
// @access  Private (Host only)
const getHostListings = async (req, res) => {
  try {
    const listings = await getHostListingsService(req.user);
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createListing,
  getListings,
  getListing,
  updateListing,
  deleteListing,
  getHostListings,
};
