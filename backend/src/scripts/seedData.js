require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Listing = require("../models/Listing");
const connectDB = require("../config/db");
const { calculateCarbonFootprint } = require("../services/carbonService");

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log("Clearing existing data...");
    await User.deleteMany({});
    await Listing.deleteMany({});

    // Create sample users
    console.log("Creating sample users...");

    // Use plain password - the User model will hash it in the pre-save hook
    const users = await User.create([
      {
        email: "john.host@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Host",
        phoneNumber: "+1234567890",
        role: "host",
      },
      {
        email: "jane.host@example.com",
        password: "password123",
        firstName: "Jane",
        lastName: "Host",
        phoneNumber: "+1234567891",
        role: "host",
      },
      {
        email: "mike.host@example.com",
        password: "password123",
        firstName: "Mike",
        lastName: "Host",
        phoneNumber: "+1234567892",
        role: "host",
      },
      {
        email: "user@example.com",
        password: "password123",
        firstName: "Test",
        lastName: "User",
        phoneNumber: "+1234567893",
        role: "user",
      },
    ]);

    console.log("Created users:", users.length);

    // Create sample listings
    console.log("Creating sample listings...");

    const sampleListings = [
      {
        title: "Luxury Beachfront Villa in Miami",
        description:
          "Experience the ultimate luxury in this stunning beachfront villa. Wake up to breathtaking ocean views, enjoy private beach access, and relax in the infinity pool. Perfect for families or groups looking for an unforgettable vacation.",
        host: users[0]._id,
        location: {
          address: "123 Ocean Drive",
          city: "Miami",
          state: "Florida",
          country: "USA",
          coordinates: { lat: 25.7617, lng: -80.1918 },
        },
        price: {
          base: 450,
          currency: "USD",
          cleaningFee: 100,
          serviceFee: 50,
        },
        images: [
          {
            url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
            publicId: "miami_villa_1",
            format: "jpg",
          },
          {
            url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
            publicId: "miami_villa_2",
            format: "jpg",
          },
          {
            url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
            publicId: "miami_villa_3",
            format: "jpg",
          },
        ],
        amenities: [
          "wifi",
          "pool",
          "kitchen",
          "parking",
          "beach-access",
          "air-conditioning",
        ],
        propertyType: "villa",
        roomType: "entire",
        maxGuests: 8,
        bedrooms: 4,
        beds: 5,
        bathrooms: 3,
        averageRating: 4.8,
        status: "active",
        availability: [
          {
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          },
        ],
      },
      {
        title: "Cozy Downtown Apartment in New York",
        description:
          "Stay in the heart of Manhattan in this modern, fully-equipped apartment. Walking distance to Times Square, Central Park, and world-class restaurants. Perfect for business travelers or tourists.",
        host: users[1]._id,
        location: {
          address: "456 Broadway",
          city: "New York",
          state: "New York",
          country: "USA",
          coordinates: { lat: 40.7589, lng: -73.9851 },
        },
        price: {
          base: 200,
          currency: "USD",
          cleaningFee: 50,
          serviceFee: 25,
        },
        images: [
          {
            url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
            publicId: "ny_apartment_1",
            format: "jpg",
          },
          {
            url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
            publicId: "ny_apartment_2",
            format: "jpg",
          },
          {
            url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
            publicId: "ny_apartment_3",
            format: "jpg",
          },
        ],
        amenities: [
          "wifi",
          "kitchen",
          "elevator",
          "air-conditioning",
          "heating",
        ],
        propertyType: "apartment",
        roomType: "entire",
        maxGuests: 4,
        bedrooms: 2,
        beds: 2,
        bathrooms: 2,
        averageRating: 4.5,
        status: "active",
        availability: [
          {
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          },
        ],
      },
      {
        title: "Mountain Cabin Retreat in Colorado",
        description:
          "Escape to this charming mountain cabin surrounded by pristine wilderness. Perfect for hiking, skiing, and enjoying nature. Features a cozy fireplace, hot tub, and stunning mountain views.",
        host: users[2]._id,
        location: {
          address: "789 Mountain View Road",
          city: "Aspen",
          state: "Colorado",
          country: "USA",
          coordinates: { lat: 39.1911, lng: -106.8175 },
        },
        price: {
          base: 300,
          currency: "USD",
          cleaningFee: 75,
          serviceFee: 35,
        },
        images: [
          {
            url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
            publicId: "aspen_cabin_1",
            format: "jpg",
          },
          {
            url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
            publicId: "aspen_cabin_2",
            format: "jpg",
          },
          {
            url: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800",
            publicId: "aspen_cabin_3",
            format: "jpg",
          },
        ],
        amenities: [
          "wifi",
          "fireplace",
          "hot-tub",
          "kitchen",
          "parking",
          "heating",
        ],
        propertyType: "cabin",
        roomType: "entire",
        maxGuests: 6,
        bedrooms: 3,
        beds: 4,
        bathrooms: 2,
        averageRating: 4.9,
        status: "active",
        availability: [
          {
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          },
        ],
      },
      {
        title: "Modern Studio in San Francisco",
        description:
          "Stylish studio apartment in the heart of San Francisco. Close to tech companies, great restaurants, and public transportation. Perfect for solo travelers or couples.",
        host: users[0]._id,
        location: {
          address: "321 Market Street",
          city: "San Francisco",
          state: "California",
          country: "USA",
          coordinates: { lat: 37.7749, lng: -122.4194 },
        },
        price: {
          base: 150,
          currency: "USD",
          cleaningFee: 30,
          serviceFee: 20,
        },
        images: [
          {
            url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
            publicId: "sf_studio_1",
            format: "jpg",
          },
          {
            url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
            publicId: "sf_studio_2",
            format: "jpg",
          },
        ],
        amenities: ["wifi", "kitchen", "air-conditioning", "elevator"],
        propertyType: "studio",
        roomType: "entire",
        maxGuests: 2,
        bedrooms: 0,
        beds: 1,
        bathrooms: 1,
        averageRating: 4.3,
        status: "active",
        availability: [
          {
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          },
        ],
      },
      {
        title: "Historic House in Charleston",
        description:
          "Stay in this beautifully restored historic home in Charleston's French Quarter. Experience Southern charm with modern amenities. Walking distance to historic sites and amazing restaurants.",
        host: users[1]._id,
        location: {
          address: "654 King Street",
          city: "Charleston",
          state: "South Carolina",
          country: "USA",
          coordinates: { lat: 32.7765, lng: -79.9311 },
        },
        price: {
          base: 250,
          currency: "USD",
          cleaningFee: 60,
          serviceFee: 30,
        },
        images: [
          {
            url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
            publicId: "charleston_house_1",
            format: "jpg",
          },
          {
            url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
            publicId: "charleston_house_2",
            format: "jpg",
          },
        ],
        amenities: ["wifi", "kitchen", "parking", "air-conditioning", "garden"],
        propertyType: "house",
        roomType: "entire",
        maxGuests: 6,
        bedrooms: 3,
        beds: 3,
        bathrooms: 2,
        averageRating: 4.7,
        status: "active",
        availability: [
          {
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          },
        ],
      },
      {
        title: "Luxury Condo in Los Angeles",
        description:
          "Modern luxury condo with stunning city views. Located in downtown LA with easy access to entertainment, dining, and business districts. Features high-end amenities and rooftop pool.",
        host: users[2]._id,
        location: {
          address: "987 Wilshire Boulevard",
          city: "Los Angeles",
          state: "California",
          country: "USA",
          coordinates: { lat: 34.0522, lng: -118.2437 },
        },
        price: {
          base: 350,
          currency: "USD",
          cleaningFee: 80,
          serviceFee: 40,
        },
        images: [
          {
            url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
            publicId: "la_condo_1",
            format: "jpg",
          },
          {
            url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800",
            publicId: "la_condo_2",
            format: "jpg",
          },
        ],
        amenities: [
          "wifi",
          "pool",
          "gym",
          "kitchen",
          "parking",
          "air-conditioning",
          "elevator",
        ],
        propertyType: "condo",
        roomType: "entire",
        maxGuests: 4,
        bedrooms: 2,
        beds: 2,
        bathrooms: 2,
        averageRating: 4.6,
        availability: [
          {
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          },
        ],
      },
    ];

    const listings = await Listing.create(sampleListings);
    console.log("Created listings:", listings.length);

    // Calculate carbon footprint for each listing
    console.log("Calculating carbon footprint for listings...");
    for (const listing of listings) {
      try {
        const carbonData = await calculateCarbonFootprint(listing);
        listing.carbonFootprint = carbonData;
        await listing.save();
        console.log(`✅ Carbon footprint calculated for: ${listing.title}`);
      } catch (error) {
        console.error(
          `⚠️ Error calculating carbon for ${listing.title}:`,
          error.message
        );
      }
    }

    console.log("✅ Seed data created successfully!");
    console.log(
      `Created ${users.length} users and ${listings.length} listings`
    );
  } catch (error) {
    console.error("❌ Error seeding data:", error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Run the seed function
seedData();
