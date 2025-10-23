const Listing = require("../models/Listing");

const { uploadImage } = require('../utils/cloudinary');

const createListingService = async (user, body) => {
  try {
    const { images, ...listingData } = body;
    
    // Process images (upload base64 or use existing URLs)
    const uploadedImages = [];
    for (const image of images) {
      // If it's a base64 image, upload it to Cloudinary
      if (typeof image === 'string' && (image.startsWith('data:image') || image.startsWith('blob:'))) {
        try {
          const result = await uploadImage(image);
          uploadedImages.push({
            url: result.url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height
          });
        } catch (error) {
          console.error('Error uploading image to Cloudinary:', error);
          throw new Error('Failed to upload one or more images');
        }
      } 
      // If it's already a URL, use it directly
      else if (typeof image === 'string' && (image.startsWith('http://') || image.startsWith('https://'))) {
        uploadedImages.push({
          url: image,
          publicId: `manual_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          format: image.split('.').pop().split('?')[0] || 'jpg',
          width: 1200, // Default dimensions
          height: 800
        });
      }
    }

    // Create listing with image URLs
    const newListing = new Listing({
      ...listingData,
      images: uploadedImages,
      host: user._id,
      status: 'active'
    });

    await newListing.save();
    return newListing;
  } catch (error) {
    console.error('Error in createListingService:', error);
    throw new Error(error.message || 'Failed to create listing');
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

  const listings = await Listing.find(dbQuery)
    .populate("host", "firstName lastName email avatar")
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });
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
