const { validationResult } = require("express-validator");
const {
  registerService,
  loginService,
  getCurrentUserService,
  updateProfileService,
  becomeHostService,
  updateHostPaymentDetailsService,
} = require("../services/authService");

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const user = await registerService(req.body);

    // Set HttpOnly cookie with token (session cookie - expires when browser closes)
    const cookieOptions = {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production", // Only secure in production
    };

    res.cookie("token", user.token, cookieOptions);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { remember } = req.body;
    const user = await loginService(req.body);

    // Set HttpOnly cookie with token
    const cookieOptions = {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production", // Only secure in production
    };

    // If remember me is checked, set a 30-day cookie
    if (remember) {
      cookieOptions.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    }
    // Otherwise, it's a session cookie (expires when browser closes)

    res.cookie("token", user.token, cookieOptions);
    res.json(user);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = async (req, res) => {
  try {
    const user = await getCurrentUserService(req.user);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await updateProfileService(req.user, req.body);
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Upgrade user to host role
// @route   PUT /api/auth/become-host
// @access  Private
const becomeHost = async (req, res) => {
  try {
    const user = await becomeHostService(req.user);
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // Clear the token cookie
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update host payment details
// @route   PUT /api/auth/host-payment-details
// @access  Private
const updateHostPaymentDetails = async (req, res) => {
  try {
    const user = await updateHostPaymentDetailsService(req.user, req.body);
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  updateProfile,
  becomeHost,
  logout,
  updateHostPaymentDetails,
};
