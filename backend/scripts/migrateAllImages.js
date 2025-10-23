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

// Connect to MongoDB and get the Listing model
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

// Upload image to Cloudinary
const uploadToCloudinary = async (imageUrl) => {
  try {
    console.log(`  Uploading: ${imageUrl}`);
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'stayfinder/listings',
      resource_type: 'auto'
    });
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format || 'jpg',
      width: result.width || 1200,
      height: result.height || 800
    };
  } catch (error) {
    console.error(`  Error uploading: ${error.message}`);
    return null;
  }
};

// Process a single listing
const processListing = async (Listing, listing) => {
  console.log(`\nProcessing listing: ${listing.title} (${listing._id})`);
  
  const newImages = [];
  let updated = false;
  
  for (let i = 0; i < listing.images.length; i++) {
    const img = listing.images[i];
    
    // Skip if already processed or invalid
    if (!img || typeof img !== 'string') {
      console.log(`  [${i}] Skipping: Invalid image format`);
      newImages.push(img);
      continue;
    }
    
    // Skip if already a Cloudinary URL
    if (img.includes('cloudinary.com')) {
      console.log(`  [${i}] Already using Cloudinary: ${img.substring(0, 50)}...`);
      newImages.push(img);
      continue;
    }
    
    // Process the image URL
    const cloudinaryImage = await uploadToCloudinary(img);
    
    if (cloudinaryImage) {
      console.log(`  [${i}] Uploaded to: ${cloudinaryImage.url.substring(0, 50)}...`);
      newImages.push(cloudinaryImage);
      updated = true;
    } else {
      console.log(`  [${i}] Failed to upload, keeping original`);
      newImages.push(img);
    }
  }
  
  // Update the listing if any images were uploaded to Cloudinary
  if (updated) {
    await Listing.updateOne(
      { _id: listing._id },
      { $set: { images: newImages } }
    );
    console.log('  ✅ Updated listing with new image URLs');
    return true;
  }
  
  console.log('  ℹ️ No changes were needed');
  return false;
};

// Main migration function
const migrateAllImages = async () => {
  const Listing = await connectDB();
  
  try {
    // Find all listings with images
    const listings = await Listing.find({
      'images.0': { $exists: true }
    });

    if (!listings || listings.length === 0) {
      console.log('No listings with images found');
      return;
    }

    console.log(`\nFound ${listings.length} listings with images to process`);
    
    let processed = 0;
    let updated = 0;
    
    for (const listing of listings) {
      processed++;
      console.log(`\n[${processed}/${listings.length}] Processing listing: ${listing.title}`);
      
      try {
        const wasUpdated = await processListing(Listing, listing);
        if (wasUpdated) updated++;
      } catch (error) {
        console.error(`  ❌ Error processing listing: ${error.message}`);
      }
    }
    
    console.log(`\nMigration complete!`);
    console.log(`- Processed: ${processed} listings`);
    console.log(`- Updated: ${updated} listings`);
    
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Run the migration
migrateAllImages();
