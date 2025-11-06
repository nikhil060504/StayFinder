const HostVerification = require("../models/HostVerification");
const User = require("../models/User");

// Create or update host verification
const createOrUpdateVerification = async (userId, stepData, stepNumber) => {
  try {
    let verification = await HostVerification.findOne({ user: userId });

    if (!verification) {
      verification = new HostVerification({ user: userId });
    }

    // Update based on step
    if (stepNumber === 1) {
      verification.personalInfo = stepData;
    } else if (stepNumber === 2) {
      verification.documents = stepData;
    } else if (stepNumber === 3) {
      verification.bankDetails = stepData;
    } else if (stepNumber === 4) {
      verification.locationVerification = stepData;
    }

    verification.updatedAt = new Date();
    await verification.save();

    return verification;
  } catch (error) {
    throw new Error(`Error updating verification: ${error.message}`);
  }
};

// Get verification status
const getVerificationStatus = async (userId) => {
  try {
    const verification = await HostVerification.findOne({ user: userId });

    if (!verification) {
      return { status: "not_started" };
    }

    return {
      status: verification.status,
      verification,
    };
  } catch (error) {
    throw new Error(`Error getting verification status: ${error.message}`);
  }
};

// Get all pending verifications (for admin)
const getPendingVerifications = async () => {
  try {
    const verifications = await HostVerification.find({
      status: "pending_review",
    })
      .populate("user", "firstName lastName email phoneNumber")
      .sort({ createdAt: -1 });

    return verifications;
  } catch (error) {
    throw new Error(`Error getting pending verifications: ${error.message}`);
  }
};

// Get verification details by ID
const getVerificationById = async (verificationId) => {
  try {
    const verification = await HostVerification.findById(verificationId).populate(
      "user",
      "firstName lastName email phoneNumber"
    );

    if (!verification) {
      throw new Error("Verification not found");
    }

    return verification;
  } catch (error) {
    throw new Error(`Error getting verification: ${error.message}`);
  }
};

// Approve verification
const approveVerification = async (verificationId, adminId, notes = "") => {
  try {
    const verification = await HostVerification.findById(verificationId);

    if (!verification) {
      throw new Error("Verification not found");
    }

    verification.status = "approved";
    verification.approvedBy = adminId;
    verification.approvedAt = new Date();
    verification.adminNotes = notes;
    await verification.save();

    // Update user role to host
    await User.findByIdAndUpdate(verification.user, {
      role: "host",
      isVerified: true,
    });

    return verification;
  } catch (error) {
    throw new Error(`Error approving verification: ${error.message}`);
  }
};

// Reject verification
const rejectVerification = async (
  verificationId,
  adminId,
  rejectionReason
) => {
  try {
    const verification = await HostVerification.findById(verificationId);

    if (!verification) {
      throw new Error("Verification not found");
    }

    verification.status = "rejected";
    verification.approvedBy = adminId;
    verification.rejectionReason = rejectionReason;
    verification.rejectedAt = new Date();
    await verification.save();

    return verification;
  } catch (error) {
    throw new Error(`Error rejecting verification: ${error.message}`);
  }
};

module.exports = {
  createOrUpdateVerification,
  getVerificationStatus,
  getPendingVerifications,
  getVerificationById,
  approveVerification,
  rejectVerification,
};

