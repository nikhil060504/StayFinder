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

    // Get all listings with images
    const listings = await Listing.find({ 'images.0': { $exists: true } }).limit(3);
    
    if (!listings || listings.length === 0) {
      console.log('No listings with images found');
      process.exit(0);
    }

    console.log(`\nFound ${listings.length} listings with images. Showing first 3:`);
    
    listings.forEach((listing, index) => {
      console.log(`\n--- Listing ${index + 1} ---`);
      console.log('ID:', listing._id);
      console.log('Title:', listing.title);
      console.log('Number of images:', listing.images ? listing.images.length : 0);
      
      if (listing.images && listing.images.length > 0) {
        console.log('\nImage details:');
        listing.images.forEach((img, imgIndex) => {
          console.log(`  [${imgIndex}] Type: ${typeof img}`);
          console.log(`     ${JSON.stringify(img).substring(0, 100)}...`);
        });
      }
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
})();
