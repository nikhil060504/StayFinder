const {
  createOrUpdateVerification,
  getVerificationStatus,
  getPendingVerifications,
  getVerificationById,
  approveVerification,
  rejectVerification,
} = require("../services/hostVerificationService");

// Submit verification step
exports.submitStep = async (req, res) => {
  try {
    const { stepNumber } = req.params;
    const userId = req.user.id;

    const verification = await createOrUpdateVerification(
      userId,
      req.body,
      parseInt(stepNumber)
    );

    res.status(200).json({
      success: true,
      message: `Step ${stepNumber} submitted successfully`,
      verification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get verification status
exports.getStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const status = await getVerificationStatus(userId);

    res.status(200).json({
      success: true,
      ...status,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all pending verifications (admin only)
exports.getPending = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can view pending verifications",
      });
    }

    const verifications = await getPendingVerifications();

    res.status(200).json({
      success: true,
      count: verifications.length,
      verifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get verification details
exports.getDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can view verification details",
      });
    }

    const verification = await getVerificationById(id);

    res.status(200).json({
      success: true,
      verification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Approve verification
exports.approve = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can approve verifications",
      });
    }

    const verification = await approveVerification(id, req.user.id, notes);

    res.status(200).json({
      success: true,
      message: "Verification approved successfully",
      verification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Reject verification
exports.reject = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can reject verifications",
      });
    }

    const verification = await rejectVerification(
      id,
      req.user.id,
      rejectionReason
    );

    res.status(200).json({
      success: true,
      message: "Verification rejected successfully",
      verification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

