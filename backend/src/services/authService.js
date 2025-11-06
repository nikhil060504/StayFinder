const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const registerService = async (body) => {
  const {
    email,
    password,
    firstName,
    lastName,
    phoneNumber,
    role = "user",
  } = body;

  console.log("Starting registration for email:", email);

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    console.log("Registration failed: User already exists with email:", email);
    throw new Error("User already exists");
  }

  console.log("Creating new user...");

  // Create the user (password will be hashed by the pre-save hook)
  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    phoneNumber,
    role,
  });

  console.log("User created successfully:", user.email);

  // Generate JWT token
  const token = generateToken(user._id);

  return {
    _id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    phoneNumber: user.phoneNumber,
    isVerified: user.isVerified,
    token,
  };
};

const loginService = async (body) => {
  const { email, password } = body;
  console.log("Login attempt for email:", email);

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    console.log("User not found with email:", email);
    throw new Error("Invalid credentials");
  }

  console.log("Found user:", user.email);
  console.log("Comparing password...");

  const isMatch = await user.comparePassword(password);
  console.log("Password match result:", isMatch);

  if (!isMatch) {
    console.log("Invalid password for user:", email);
    throw new Error("Invalid credentials");
  }

  const token = generateToken(user._id);
  console.log("Login successful for user:", email);

  return {
    _id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    phoneNumber: user.phoneNumber,
    isVerified: user.isVerified,
    token,
  };
};

const getCurrentUserService = async (user) => {
  return User.findById(user._id).select("-password");
};

const updateProfileService = async (user, body) => {
  const { firstName, lastName, phoneNumber } = body;
  const foundUser = await User.findById(user._id);
  if (!foundUser) throw new Error("User not found");
  foundUser.firstName = firstName || foundUser.firstName;
  foundUser.lastName = lastName || foundUser.lastName;
  foundUser.phoneNumber = phoneNumber || foundUser.phoneNumber;
  const updatedUser = await foundUser.save();
  return {
    _id: updatedUser._id,
    email: updatedUser.email,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    role: updatedUser.role,
    phoneNumber: updatedUser.phoneNumber,
  };
};

const becomeHostService = async (user) => {
  const foundUser = await User.findById(user._id);
  if (!foundUser) throw new Error("User not found");
  if (foundUser.role === "host") throw new Error("User is already a host");
  foundUser.role = "host";
  const updatedUser = await foundUser.save();
  return {
    _id: updatedUser._id,
    email: updatedUser.email,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    role: updatedUser.role,
    phoneNumber: updatedUser.phoneNumber,
  };
};

const updateHostPaymentDetailsService = async (user, paymentDetails) => {
  const foundUser = await User.findById(user._id);
  if (!foundUser) throw new Error("User not found");
  if (foundUser.role !== "host") throw new Error("User is not a host");

  const { accountNumber, panCard, bankName, ifscCode, accountHolderName } =
    paymentDetails;

  // Validate required fields
  if (
    !accountNumber ||
    !panCard ||
    !bankName ||
    !ifscCode ||
    !accountHolderName
  ) {
    throw new Error("All payment details are required");
  }

  // Validate PAN format (Indian PAN: 10 characters, alphanumeric)
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panCard)) {
    throw new Error(
      "Invalid PAN format. PAN should be 10 characters (e.g., AAAAA1234A)"
    );
  }

  // Validate account number (basic validation)
  if (accountNumber.length < 9 || accountNumber.length > 18) {
    throw new Error("Invalid account number. Should be between 9-18 digits");
  }

  // Validate IFSC code format
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) {
    throw new Error(
      "Invalid IFSC code format. Should be 11 characters (e.g., SBIN0001234)"
    );
  }

  foundUser.hostPaymentDetails = {
    accountNumber,
    panCard: panCard.toUpperCase(),
    bankName,
    ifscCode: ifscCode.toUpperCase(),
    accountHolderName,
    isVerified: false, // Will be verified by admin
  };

  const updatedUser = await foundUser.save();
  return {
    _id: updatedUser._id,
    email: updatedUser.email,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    role: updatedUser.role,
    hostPaymentDetails: updatedUser.hostPaymentDetails,
  };
};

module.exports = {
  registerService,
  loginService,
  getCurrentUserService,
  updateProfileService,
  becomeHostService,
  updateHostPaymentDetailsService,
};
