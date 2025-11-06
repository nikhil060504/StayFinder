const mongoose = require("mongoose");

const hostVerificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending_review", "approved", "rejected"],
      default: "pending_review",
    },
    // Step 1: Personal Information
    personalInfo: {
      firstName: String,
      lastName: String,
      phoneNumber: String,
    },
    // Step 2: Documents
    documents: {
      aadharNumber: String,
      aadharFile: String, // Cloudinary URL
      panNumber: String,
      panFile: String, // Cloudinary URL
    },
    // Step 3: Bank Details
    bankDetails: {
      accountNumber: String,
      ifscCode: String,
      accountHolderName: String,
    },
    // Step 4: Location Verification
    locationVerification: {
      address: String,
      city: String,
      state: String,
      country: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
      safetyScore: Number,
    },
    // Admin Review
    adminNotes: String,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: Date,
    rejectionReason: String,
    rejectedAt: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HostVerification", hostVerificationSchema);

