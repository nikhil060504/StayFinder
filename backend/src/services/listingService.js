const Listing = require("../models/Listing");

const createListingService = async (user, body) => {
  const listingData = { ...body, host: user._id };
  return Listing.create(listingData);
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
