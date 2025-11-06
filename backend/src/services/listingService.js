const Listing = require("../models/Listing");

const { uploadImage } = require("../utils/cloudinary");
const { calculateCarbonFootprint } = require("./carbonService");
const {
  verifyLocationCoordinates,
  checkLocationSafety,
} = require("./locationSafetyService");

const createListingService = async (user, body) => {
  try {
    const { images, ...listingData } = body;

    // Verify location safety before creating listing
    if (listingData.location) {
      let latitude, longitude;

      // Check if coordinates are already provided (from frontend)
      if (
        listingData.location.coordinates &&
        listingData.location.coordinates.lat &&
        listingData.location.coordinates.lng
      ) {
        console.log("📍 Using provided coordinates for listing:", {
          lat: listingData.location.coordinates.lat,
          lng: listingData.location.coordinates.lng,
        });
        latitude = listingData.location.coordinates.lat;
        longitude = listingData.location.coordinates.lng;
      }
      // Check if using manual coordinates (alternative format)
      else if (
        listingData.location.useManualCoordinates &&
        listingData.location.manualLatitude &&
        listingData.location.manualLongitude
      ) {
        console.log("📍 Using manual coordinates for listing:", {
          lat: listingData.location.manualLatitude,
          lng: listingData.location.manualLongitude,
        });
        latitude = listingData.location.manualLatitude;
        longitude = listingData.location.manualLongitude;
      } else {
        // Verify location coordinates using address
        const { address, city, state } = listingData.location;

        const coordsResult = await verifyLocationCoordinates(
          address,
          city,
          state,
          listingData.location.zipCode || ""
        );

        if (!coordsResult.success) {
          throw new Error(
            `Location verification failed: ${coordsResult.error}`
          );
        }

        latitude = coordsResult.latitude;
        longitude = coordsResult.longitude;
      }

      // Check location safety
      const safetyResult = await checkLocationSafety(latitude, longitude);

      if (!safetyResult.success) {
        throw new Error(`Safety check failed: ${safetyResult.error}`);
      }

      // If location is unsafe, reject the listing
      if (safetyResult.safetyStatus === "unsafe") {
        throw new Error(
          `This location is not safe for hosting. Safety Score: ${safetyResult.safetyScore}/100. ${safetyResult.safetyDetails}`
        );
      }

      // Add verified coordinates and safety info to listing
      listingData.location.coordinates = {
        lat: latitude,
        lng: longitude,
      };
      listingData.safetyScore = safetyResult.safetyScore;
      listingData.safetyStatus = safetyResult.safetyStatus;
      listingData.safetyDetails = safetyResult.safetyDetails;
    }

    // Process images (upload base64 or use existing URLs)
    const uploadedImages = [];
    for (const image of images) {
      // If it's a base64 image, upload it to Cloudinary
      if (
        typeof image === "string" &&
        (image.startsWith("data:image") || image.startsWith("blob:"))
      ) {
        try {
          const result = await uploadImage(image);
          uploadedImages.push({
            url: result.url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
          });
        } catch (error) {
          console.error("Error uploading image to Cloudinary:", error);
          throw new Error("Failed to upload one or more images");
        }
      }
      // If it's already a URL, use it directly
      else if (
        typeof image === "string" &&
        (image.startsWith("http://") || image.startsWith("https://"))
      ) {
        uploadedImages.push({
          url: image,
          publicId: `manual_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          format: image.split(".").pop().split("?")[0] || "jpg",
          width: 1200, // Default dimensions
          height: 800,
        });
      }
    }

    // Create listing with image URLs
    const newListing = new Listing({
      ...listingData,
      images: uploadedImages,
      host: user._id,
      status: "active",
    });

    await newListing.save();

    // Calculate carbon footprint
    try {
      const carbonData = await calculateCarbonFootprint(newListing);
      newListing.carbonFootprint = carbonData;
      await newListing.save();
    } catch (error) {
      console.error("Error calculating carbon footprint:", error);
      // Continue without carbon footprint if calculation fails
    }

    return newListing;
  } catch (error) {
    console.error("Error in createListingService:", error);
    throw new Error(error.message || "Failed to create listing");
  }
};

const getListingsService = async (query) => {
  const {
    location,
    checkIn,
    checkOut,
    guests,
    minPrice,
    maxPrice,
    propertyType,
    page = 1,
    limit = 10,
  } = query;
  // Only return active listings
  const dbQuery = { status: "active" };
  if (location) {
    dbQuery.$or = [
      { "location.city": { $regex: location, $options: "i" } },
      { "location.state": { $regex: location, $options: "i" } },
      { "location.country": { $regex: location, $options: "i" } },
    ];
  }
  if (minPrice || maxPrice) {
    dbQuery["price.base"] = {};
    if (minPrice) dbQuery["price.base"].$gte = Number(minPrice);
    if (maxPrice) dbQuery["price.base"].$lte = Number(maxPrice);
  }
  if (propertyType) dbQuery.propertyType = propertyType;
  if (checkIn && checkOut) {
    dbQuery.availability = {
      $elemMatch: {
        startDate: { $lte: new Date(checkIn) },
        endDate: { $gte: new Date(checkOut) },
      },
    };
  }
  if (guests) dbQuery.maxGuests = { $gte: Number(guests) };

  // Debug log for the final MongoDB query
  console.log("Listings Query:", JSON.stringify(dbQuery, null, 2));

  let listings = await Listing.find(dbQuery)
    .populate("host", "firstName lastName email avatar")
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  // Filter out properties with active bookings
  const Booking = require("../models/Booking");
  const now = new Date();

  listings = await Promise.all(
    listings.map(async (listing) => {
      // Check if property has any active bookings (confirmed or pending status, and checkout date is in future)
      const activeBooking = await Booking.findOne({
        listing: listing._id,
        status: { $in: ["confirmed", "pending"] },
        checkOut: { $gt: now }, // Booking hasn't ended yet
      });

      // Return listing only if no active booking exists
      return activeBooking ? null : listing;
    })
  );

  // Remove null values (booked properties)
  listings = listings.filter((listing) => listing !== null);

  const total = await Listing.countDocuments(dbQuery);
  return {
    listings,
    currentPage: Number(page),
    totalPages: Math.ceil(total / limit),
    totalListings: total,
  };
};

const getListingService = async (id) => {
  const listing = await Listing.findById(id)
    .populate("host", "firstName lastName email avatar phoneNumber")
    .populate("reviews");
  if (!listing) throw new Error("Listing not found");
  return listing;
};

const updateListingService = async (user, id, body) => {
  const listing = await Listing.findById(id);
  if (!listing) throw new Error("Listing not found");
  if (listing.host.toString() !== user._id.toString())
    throw new Error("Not authorized to update this listing");
  return Listing.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true,
  });
};

const deleteListingService = async (user, id) => {
  const listing = await Listing.findById(id);
  if (!listing) throw new Error("Listing not found");
  if (listing.host.toString() !== user._id.toString())
    throw new Error("Not authorized to delete this listing");
  await listing.deleteOne();
  return { message: "Listing removed" };
};

const getHostListingsService = async (user) => {
  return Listing.find({ host: user._id }).sort({ createdAt: -1 });
};

module.exports = {
  createListingService,
  getListingsService,
  getListingService,
  updateListingService,
  deleteListingService,
  getHostListingsService,
};
