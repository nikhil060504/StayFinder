const axios = require("axios");

// Check location safety score
const checkLocationSafety = async (latitude, longitude) => {
  try {
    // This is a placeholder implementation
    // In production, you would use a real safety API
    // For now, we'll return a mock safety score

    // You could integrate with services like:
    // - Google Safe Browsing API
    // - Crime data APIs
    // - Local safety databases

    // Mock implementation
    const safetyScore = Math.random() * 100; // 0-100 score

    return {
      safetyScore: Math.round(safetyScore),
      isSafe: safetyScore > 50,
      message:
        safetyScore > 50
          ? "Location appears to be safe"
          : "Location may have safety concerns",
    };
  } catch (error) {
    console.error("Error checking location safety:", error);
    // Return default safe score on error
    return {
      safetyScore: 75,
      isSafe: true,
      message: "Unable to verify safety, but location is allowed",
    };
  }
};

// Verify address format
const verifyAddressFormat = async (address, city, state, country) => {
  try {
    // Validate address components
    if (!address || !city || !state || !country) {
      return {
        isValid: false,
        message: "All address fields are required",
      };
    }

    // Check for minimum length
    if (address.length < 5 || city.length < 2) {
      return {
        isValid: false,
        message: "Address and city must be longer",
      };
    }

    return {
      isValid: true,
      message: "Address format is valid",
    };
  } catch (error) {
    console.error("Error verifying address:", error);
    return {
      isValid: false,
      message: "Error verifying address",
    };
  }
};

// Geocode address to coordinates
const geocodeAddress = async (address, city, state, country) => {
  try {
    // Format address for geocoding
    const fullAddress = `${address}, ${city}, ${state}, ${country}`;

    // Use Google Maps Geocoding API
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json",
      {
        params: {
          address: fullAddress,
          key: process.env.GOOGLE_MAPS_API_KEY,
        },
      }
    );

    if (response.data.results.length === 0) {
      return {
        success: false,
        message: "Address not found",
      };
    }

    const location = response.data.results[0].geometry.location;

    return {
      success: true,
      coordinates: {
        lat: location.lat,
        lng: location.lng,
      },
      formattedAddress: response.data.results[0].formatted_address,
    };
  } catch (error) {
    console.error("Error geocoding address:", error);
    return {
      success: false,
      message: "Error geocoding address",
    };
  }
};

module.exports = {
  checkLocationSafety,
  verifyAddressFormat,
  geocodeAddress,
};

