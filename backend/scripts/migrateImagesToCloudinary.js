require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

// Import the model after mongoose connection is established
let Listing;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dwjnqydpl',
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...');
    
    // Import the model after connection
    Listing = require('../src/models/Listing');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Upload image to Cloudinary
const uploadToCloudinary = async (imageUrl) => {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'stayfinder/listings',
      resource_type: 'auto'
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return null;
  }
};

// Main migration function
const migrateImages = async () => {
  try {
    await connectDB();
    
    // Find all listings with images
    const listings = await Listing.find({ 'images.0': { $exists: true } }).lean();
    if (!listings || !listings.length) {
      console.log('No listings with images found');
      return;
    }
    console.log(`Found ${listings.length} listings with images to process`);
    
    let processed = 0;
    let updated = 0;
    
    for (const listing of listings) {
      processed++;
      console.log(`\nProcessing listing ${processed}/${listings.length} (ID: ${listing._id})`);
      
      const newImages = [];
      let needsUpdate = false;
      
      for (const img of listing.images) {
        // If image is already a Cloudinary URL, keep it
        if (img.url && img.url.includes('cloudinary.com')) {
          console.log(`  ✓ Already using Cloudinary: ${img.url.substring(0, 50)}...`);
          newImages.push(img);
          continue;
        }
        
        // If image is a URL, upload it to Cloudinary
        if (img.url && (img.url.startsWith('http://') || img.url.startsWith('https://'))) {
          console.log(`  Uploading: ${img.url}`);
          const cloudinaryImage = await uploadToCloudinary(img.url);
          
          if (cloudinaryImage) {
            newImages.push(cloudinaryImage);
            needsUpdate = true;
            console.log(`  ✓ Uploaded to: ${cloudinaryImage.url.substring(0, 50)}...`);
          } else {
            // Keep the original if upload fails
            newImages.push(img);
            console.log('  ✗ Failed to upload, keeping original');
          }
        } else if (img.url) {
          // Handle base64 or other formats if needed
          console.log('  Skipping non-URL image');
          newImages.push(img);
        }
      }
      
      // Update the listing if any images were uploaded to Cloudinary
      if (needsUpdate) {
        listing.images = newImages;
        await listing.save();
        updated++;
        console.log(`  ✓ Updated listing ${listing._id}`);
      }
    }
    
    console.log(`\nMigration complete!`);
    console.log(`- Processed: ${processed} listings`);
    console.log(`- Updated: ${updated} listings`);
    
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

// Run the migration
migrateImages();
