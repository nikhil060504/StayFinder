const express = require("express");
const { check } = require("express-validator");
const assistantController = require("../controllers/assistantController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Validation middleware
const chatValidation = [
  check("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required")
    .isLength({ min: 1, max: 1000 })
    .withMessage("Message must be between 1 and 1000 characters"),
];

// Routes
// POST /api/assistant - Chat with the assistant (optional auth)
router.post("/", chatValidation, assistantController.chat);

// POST /api/assistant/auth - Chat with auth context (requires login)
router.post("/auth", protect, chatValidation, assistantController.chat);

module.exports = router;

