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
      console.log("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    console.log(
      "Creating listing with data:",
      JSON.stringify(req.body, null, 2)
    );

    // Log the incoming request body for debugging
    console.log("Raw request body:", req.body);

    // Validate required fields
    if (
      !req.body.images ||
      !Array.isArray(req.body.images) ||
      req.body.images.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "At least one image is required" });
    }

    try {
      const listing = await createListingService(req.user, req.body);
      console.log("Listing created successfully:", listing._id);
      res.status(201).json(listing);
    } catch (error) {
      console.error("Error in createListingService:", error);
      res.status(400).json({
        message: error.message || "Failed to create listing",
        details: error.errors
          ? Object.values(error.errors).map((e) => e.message)
          : undefined,
      });
    }
  } catch (error) {
    console.error("Error creating listing:", error);
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

// @desc    Get host contact information for a listing
// @route   GET /api/listings/:id/host-contact
// @access  Public (but returns limited info)
const getHostContact = async (req, res) => {
  try {
    const Listing = require("../models/Listing");
    const listingWithHost = await Listing.findById(req.params.id).populate(
      "host",
      "firstName lastName phoneNumber email"
    );

    if (!listingWithHost) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (!listingWithHost.host) {
      return res.status(404).json({ message: "Host information not found" });
    }

    const hostInfo = {
      hostId: listingWithHost.host._id,
      firstName: listingWithHost.host.firstName,
      lastName: listingWithHost.host.lastName,
      phoneNumber: listingWithHost.host.phoneNumber,
      email: listingWithHost.host.email,
      listingTitle: listingWithHost.title,
      listingId: listingWithHost._id,
    };

    res.json(hostInfo);
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
  getHostContact,
};
