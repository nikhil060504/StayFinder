const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const registerService = async (body) => {
  const { email, password, firstName, lastName, phoneNumber } = body;
  const userExists = await User.findOne({ email });
  if (userExists) throw new Error("User already exists");
  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    phoneNumber,
  });
  const token = generateToken(user._id);
  return {
    _id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    phoneNumber: user.phoneNumber,
    token,
  };
};

const loginService = async (body) => {
  const { email, password } = body;
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid credentials");
  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new Error("Invalid credentials");
  const token = generateToken(user._id);
  return {
    _id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    phoneNumber: user.phoneNumber,
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

module.exports = {
  registerService,
  loginService,
  getCurrentUserService,
  updateProfileService,
  becomeHostService,
};
