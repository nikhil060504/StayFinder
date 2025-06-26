const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 2000,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: {
      address: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
      },
      country: {
        type: String,
        required: true,
        trim: true,
      },
      coordinates: {
        lat: {
          type: Number,
          required: true,
        },
        lng: {
          type: Number,
          required: true,
        },
      },
    },
    price: {
      base: {
        type: Number,
        required: true,
        min: 0,
      },
      currency: {
        type: String,
        required: true,
        default: "USD",
      },
      cleaningFee: {
        type: Number,
        default: 0,
        min: 0,
      },
      serviceFee: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    images: [
      {
        type: String,
        required: true,
        validate: {
          validator: function (v) {
            return /^https?:\/\/.+/.test(v);
          },
          message: "Image URL must be a valid URL",
        },
      },
    ],
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
    propertyType: {
      type: String,
      enum: ["house", "apartment", "condo", "villa", "cabin", "studio"],
      required: true,
    },
    roomType: {
      type: String,
      enum: ["entire", "private", "shared"],
      required: true,
    },
    maxGuests: {
      type: Number,
      required: true,
      min: 1,
    },
    bedrooms: {
      type: Number,
      required: true,
      min: 0,
    },
    beds: {
      type: Number,
      required: true,
      min: 1,
    },
    bathrooms: {
      type: Number,
      required: true,
      min: 1,
    },
    availability: [
      {
        startDate: {
          type: Date,
          required: true,
        },
        endDate: {
          type: Date,
          required: true,
        },
      },
    ],
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for search functionality
listingSchema.index({
  "location.city": "text",
  "location.state": "text",
  "location.country": "text",
  title: "text",
  description: "text",
});

// Add compound indexes for common queries
listingSchema.index({ "location.city": 1, status: 1 });
listingSchema.index({ propertyType: 1, status: 1 });
listingSchema.index({ host: 1, status: 1 });

// Virtual for total price calculation
listingSchema.virtual("totalPrice").get(function () {
  return this.price.base + this.price.cleaningFee + this.price.serviceFee;
});

// Method to update average rating
listingSchema.methods.updateAverageRating = async function () {
  const Review = mongoose.model("Review");
  const result = await Review.aggregate([
    { $match: { listing: this._id, status: "approved" } },
    { $group: { _id: null, averageRating: { $avg: "$rating" } } },
  ]);

  this.averageRating = result[0]?.averageRating || 0;
  await this.save();
};

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
