const express = require("express");
const { check } = require("express-validator");
const {
  submitStep,
  getStatus,
  getPending,
  getDetails,
  approve,
  reject,
} = require("../controllers/hostVerificationController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(protect);

// Submit verification step
router.post(
  "/step/:stepNumber",
  [
    check("stepNumber").isIn(["1", "2", "3", "4"]).withMessage("Invalid step"),
  ],
  submitStep
);

// Get verification status
router.get("/status", getStatus);

// Get all pending verifications (admin only)
router.get("/pending", getPending);

// Get verification details (admin only)
router.get("/:id", getDetails);

// Approve verification (admin only)
router.put("/:id/approve", approve);

// Reject verification (admin only)
router.put("/:id/reject", reject);

module.exports = router;

