require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

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
    return require('../src/models/Listing');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Upload image to Cloudinary from URL
const uploadImageToCloudinary = async (imageUrl) => {
  try {
    console.log(`Uploading: ${imageUrl}`);
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
    console.error(`Error uploading to Cloudinary: ${error.message}`);
    return null;
  }
};

// Main migration function
const migrateImages = async () => {
  const Listing = await connectDB();
  
  try {
    // Find one listing with images that's not from Cloudinary
    const listing = await Listing.findOne({
      'images.0': { $exists: true },
      'images.url': { $not: /cloudinary\.com/ }
    });

    if (!listing) {
      console.log('No listings with non-Cloudinary images found');
      return;
    }

    console.log(`\nProcessing listing: ${listing.title} (${listing._id})`);
    
    const newImages = [];
    let updated = false;
    
    for (let i = 0; i < listing.images.length; i++) {
      const img = listing.images[i];
      
      // Skip if already a Cloudinary URL
      if (img.url && img.url.includes('cloudinary.com')) {
        console.log(`  [${i}] Already using Cloudinary: ${img.url.substring(0, 50)}...`);
        newImages.push(img);
        continue;
      }
      
      // Process external URL
      if (img.url && (img.url.startsWith('http://') || img.url.startsWith('https://'))) {
        const cloudinaryImage = await uploadImageToCloudinary(img.url);
        
        if (cloudinaryImage) {
          console.log(`  [${i}] Uploaded to: ${cloudinaryImage.url.substring(0, 50)}...`);
          newImages.push(cloudinaryImage);
          updated = true;
        } else {
          console.log(`  [${i}] Failed to upload, keeping original`);
          newImages.push(img);
        }
      } else {
        console.log(`  [${i}] Invalid image format, skipping`);
        newImages.push(img);
      }
    }
    
    // Update the listing if any images were uploaded to Cloudinary
    if (updated) {
      listing.images = newImages;
      await listing.save();
      console.log('\n✅ Successfully updated listing with Cloudinary URLs');
    } else {
      console.log('\nℹ️ No changes were made to the listing');
    }
    
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Run the migration
migrateImages();
