const axios = require("axios");
const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

const mongoURI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/stayfinder";

const connectTestDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      family: 4,
    });
    console.log("✅ Connected to MongoDB for testing");
  } catch (err) {
    console.error("❌ Could not connect to MongoDB:", err.message);
    process.exit(1);
  }
};

const API_URL = "http://127.0.0.1:5000/api";
let authToken;
let hostToken;
let testListingId;
let testBookingId;

// Test user data
const testUser = {
  email: "test@example.com",
  password: "password123",
  firstName: "Test",
  lastName: "User",
  phoneNumber: "1234567890",
};

const testHost = {
  email: "host@example.com",
  password: "password123",
  firstName: "Test",
  lastName: "Host",
  phoneNumber: "0987654321",
  role: "host", // Explicitly set role as host
};

// Test listing data
const testListing = {
  title: "Beautiful Beach House",
  description: "Amazing beach house with ocean view",
  location: {
    address: "123 Beach Road",
    city: "Miami",
    state: "Florida",
    country: "USA",
    coordinates: {
      lat: 25.7617,
      lng: -80.1918,
    },
  },
  price: {
    base: 200,
    currency: "USD",
    cleaningFee: 50,
    serviceFee: 20,
  },
  images: ["https://example.com/image1.jpg"],
  amenities: ["wifi", "pool", "kitchen"],
  propertyType: "house",
  roomType: "entire",
  maxGuests: 6,
  bedrooms: 3,
  beds: 4,
  bathrooms: 2,
};

// Test booking data
const testBooking = {
  checkIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  checkOut: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
  guests: 2,
};

// Helper function to make authenticated requests
const makeAuthRequest = async (method, url, data = null, token = authToken) => {
  try {
    const config = {
      method,
      url: `${API_URL}${url}`,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
    if (data) config.data = data;
    return await axios(config);
  } catch (error) {
    console.error(
      `Error in ${method} ${url}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

// Helper function to update user role
const updateUserRole = async (userId, role) => {
  try {
    await User.findByIdAndUpdate(userId, { role });
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};

// Test suite
const runTests = async () => {
  try {
    await connectTestDB();
    console.log("Starting API tests...\n");

    // Clean up any existing test users
    console.log("Cleaning up existing test data...");
    await User.deleteMany({
      email: { $in: [testUser.email, testHost.email] },
    });
    console.log("✅ Existing test data cleaned up\n");

    // 1. Auth Tests
    console.log("Testing Auth Endpoints...");

    // Register user
    console.log("Testing user registration...");
    const registerRes = await axios.post(`${API_URL}/auth/register`, testUser);
    authToken = registerRes.data.token;
    console.log("✅ User registration successful");

    // Register host
    console.log("Testing host registration...");
    const hostRes = await axios.post(`${API_URL}/auth/register`, testHost);
    hostToken = hostRes.data.token;
    console.log("✅ Host registration successful");

    // Update host role in database (in case it wasn't set during registration)
    await updateUserRole(hostRes.data._id, "host");
    console.log("✅ Host role updated in database");

    // Login
    console.log("Testing login...");
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password,
    });
    console.log("✅ Login successful");

    // Get current user
    console.log("Testing get current user...");
    await makeAuthRequest("get", "/auth/me");
    console.log("✅ Get current user successful");

    // 2. Listing Tests
    console.log("\nTesting Listing Endpoints...");

    // Create listing
    console.log("Testing create listing...");
    const createListingRes = await makeAuthRequest(
      "post",
      "/listings",
      testListing,
      hostToken
    );
    testListingId = createListingRes.data._id;
    console.log("✅ Create listing successful");

    // Get all listings
    console.log("Testing get all listings...");
    await makeAuthRequest("get", "/listings");
    console.log("✅ Get all listings successful");

    // Get single listing
    console.log("Testing get single listing...");
    await makeAuthRequest("get", `/listings/${testListingId}`);
    console.log("✅ Get single listing successful");

    // Update listing
    console.log("Testing update listing...");
    await makeAuthRequest(
      "put",
      `/listings/${testListingId}`,
      {
        title: "Updated Beach House",
      },
      hostToken
    );
    console.log("✅ Update listing successful");

    // 3. Booking Tests
    console.log("\nTesting Booking Endpoints...");

    // Create booking
    console.log("Testing create booking...");
    const createBookingRes = await makeAuthRequest("post", "/bookings", {
      ...testBooking,
      listingId: testListingId,
    });
    testBookingId = createBookingRes.data._id;
    console.log("✅ Create booking successful");

    // Get user bookings
    console.log("Testing get user bookings...");
    await makeAuthRequest("get", "/bookings/my-bookings");
    console.log("✅ Get user bookings successful");

    // Get host bookings
    console.log("Testing get host bookings...");
    await makeAuthRequest("get", "/bookings/host/bookings", null, hostToken);
    console.log("✅ Get host bookings successful");

    // Get single booking
    console.log("Testing get single booking...");
    await makeAuthRequest("get", `/bookings/${testBookingId}`);
    console.log("✅ Get single booking successful");

    // Update booking status
    console.log("Testing update booking status...");
    await makeAuthRequest(
      "put",
      `/bookings/${testBookingId}/status`,
      {
        status: "confirmed",
      },
      hostToken
    );
    console.log("✅ Update booking status successful");

    // 4. Cleanup
    console.log("\nCleaning up test data...");

    // Delete booking
    await makeAuthRequest(
      "delete",
      `/bookings/${testBookingId}`,
      null,
      hostToken
    );
    console.log("✅ Booking deleted");

    // Delete listing
    await makeAuthRequest(
      "delete",
      `/listings/${testListingId}`,
      null,
      hostToken
    );
    console.log("✅ Listing deleted");

    // Delete test users
    await User.deleteMany({ email: { $in: [testUser.email, testHost.email] } });
    console.log("✅ Test users deleted");

    console.log("\n🎉 All tests completed successfully!");
  } catch (error) {
    console.error("\n❌ Test failed:", error.response?.data || error.message);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
  }
};

// Run tests
runTests();
