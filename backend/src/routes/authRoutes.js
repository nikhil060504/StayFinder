const express = require("express");
const { check } = require("express-validator");
const {
  register,
  login,
  getCurrentUser,
  updateProfile,
  becomeHost,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Validation middleware
const registerValidation = [
  check("email", "Please include a valid email").isEmail(),
  check("password", "Password must be 6 or more characters").isLength({
    min: 6,
  }),
  check("firstName", "First name is required").not().isEmpty(),
  check("lastName", "Last name is required").not().isEmpty(),
];

const loginValidation = [
  check("email", "Please include a valid email").isEmail(),
  check("password", "Password is required").exists(),
];

// Routes
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.get("/me", protect, getCurrentUser);
router.put("/profile", protect, updateProfile);
router.put("/become-host", protect, becomeHost);

module.exports = router;
