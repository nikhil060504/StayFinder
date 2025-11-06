const axios = require("axios");

// Calculate carbon footprint for a property
const calculateCarbonFootprint = async (propertyData) => {
  try {
    // Estimate based on property characteristics
    // This is a simplified calculation
    // In production, you might use an external API like ClimatIQ

    let baseEmissions = 5; // kg CO2e per night

    // Adjust based on property type
    const propertyTypeMultiplier = {
      apartment: 0.8,
      house: 1.2,
      villa: 1.5,
      cottage: 0.9,
      studio: 0.6,
    };

    const multiplier =
      propertyTypeMultiplier[propertyData.propertyType] || 1;
    baseEmissions *= multiplier;

    // Adjust based on amenities
    if (propertyData.amenities) {
      if (propertyData.amenities.includes("pool")) baseEmissions += 2;
      if (propertyData.amenities.includes("hot_tub")) baseEmissions += 1.5;
      if (propertyData.amenities.includes("gym")) baseEmissions += 1;
      if (propertyData.amenities.includes("ac")) baseEmissions += 1;
    }

    // Adjust based on max guests
    if (propertyData.maxGuests) {
      baseEmissions += propertyData.maxGuests * 0.5;
    }

    return {
      value: Math.round(baseEmissions * 100) / 100,
      unit: "kg CO2e/night",
      category: "accommodation",
    };
  } catch (error) {
    console.error("Error calculating carbon footprint:", error);
    // Return default value on error
    return {
      value: 5,
      unit: "kg CO2e/night",
      category: "accommodation",
    };
  }
};

// Get carbon footprint for multiple properties
const getCarbonFootprintBatch = async (properties) => {
  try {
    const results = await Promise.all(
      properties.map((property) => calculateCarbonFootprint(property))
    );
    return results;
  } catch (error) {
    console.error("Error calculating batch carbon footprint:", error);
    return properties.map(() => ({
      value: 5,
      unit: "kg CO2e/night",
      category: "accommodation",
    }));
  }
};

module.exports = {
  calculateCarbonFootprint,
  getCarbonFootprintBatch,
};

