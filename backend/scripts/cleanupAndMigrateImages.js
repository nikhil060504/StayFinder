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

// Check if a string is a valid URL
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Clean up image data
const cleanImageData = (img) => {
  // If it's already an object with a URL, return it
  if (img && typeof img === 'object' && img.url) {
    return img;
  }
  
  // If it's a string URL, convert to object
  if (typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'))) {
    return {
      url: img,
      publicId: `manual_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      format: img.split('.').pop().split('?')[0] || 'jpg',
      width: 1200,
      height: 800
    };
  }
  
  // If it's an object but malformed, try to fix it
  if (img && typeof img === 'object') {
    const fixedImg = {
      url: img.url || '',
      publicId: img.publicId || `fixed_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      format: img.format || 'jpg',
      width: img.width || 1200,
      height: img.height || 800
    };
    
    // If we have a valid URL, return the fixed object
    if (isValidUrl(fixedImg.url)) {
      return fixedImg;
    }
  }
  
  // If we get here, the image data is invalid
  return null;
};

// Upload image to Cloudinary
const uploadToCloudinary = async (imageUrl) => {
  try {
    if (!isValidUrl(imageUrl)) {
      console.log('  Invalid URL, skipping upload');
      return null;
    }
    
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
  console.log(`\nProcessing listing: ${listing.title || 'Untitled'} (${listing._id})`);
  
  const newImages = [];
  let needsUpdate = false;
  
  // First, clean up the image data
  const cleanedImages = [];
  for (const img of listing.images) {
    const cleanedImg = cleanImageData(img);
    if (cleanedImg) {
      cleanedImages.push(cleanedImg);
    }
  }
  
  // Check if we need to update the listing with cleaned data
  if (JSON.stringify(cleanedImages) !== JSON.stringify(listing.images)) {
    needsUpdate = true;
    console.log('  ✅ Cleaned up image data');
  }
  
  // Process each image
  for (let i = 0; i < cleanedImages.length; i++) {
    const img = cleanedImages[i];
    
    // Skip if already a Cloudinary URL
    if (img.url && img.url.includes('cloudinary.com')) {
      console.log(`  [${i}] Already using Cloudinary: ${img.url.substring(0, 50)}...`);
      newImages.push(img);
      continue;
    }
    
    // Process the image URL
    const cloudinaryImage = await uploadToCloudinary(img.url);
    
    if (cloudinaryImage) {
      console.log(`  [${i}] Uploaded to: ${cloudinaryImage.url.substring(0, 50)}...`);
      newImages.push(cloudinaryImage);
      needsUpdate = true;
    } else {
      console.log(`  [${i}] Failed to upload, keeping original`);
      newImages.push(img);
    }
  }
  
  // Update the listing if needed
  if (needsUpdate) {
    await Listing.updateOne(
      { _id: listing._id },
      { $set: { images: newImages } }
    );
    console.log('  ✅ Updated listing with cleaned/uploaded images');
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
      console.log(`\n[${processed}/${listings.length}] Processing listing...`);
      
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
