require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...');

    // Import the Listing model
    const Listing = require('../src/models/Listing');

    // Get one listing with images
    const listing = await Listing.findOne({ 'images.0': { $exists: true } }).lean();
    
    if (!listing) {
      console.log('No listings with images found');
      process.exit(0);
    }

    console.log('Listing ID:', listing._id);
    console.log('Title:', listing.title);
    console.log('Number of images:', listing.images ? listing.images.length : 0);
    
    // Show first image details
    if (listing.images && listing.images.length > 0) {
      console.log('\nFirst image details:');
      console.log(JSON.stringify(listing.images[0], null, 2));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
})();
