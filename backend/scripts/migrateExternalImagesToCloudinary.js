require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const axios = require('axios');

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
    return require('../src/models/Listing');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Download image from URL
const downloadImage = async (url) => {
  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'arraybuffer'
    });
    return response.data;
  } catch (error) {
    console.error(`Error downloading image from ${url}:`, error.message);
    return null;
  }
};

// Upload image to Cloudinary
const uploadToCloudinary = async (imageBuffer) => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'stayfinder/listings',
          resource_type: 'auto'
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      // Convert buffer to stream and pipe to Cloudinary
      const { Readable } = require('stream');
      const stream = new Readable();
      stream.push(imageBuffer);
      stream.push(null);
      stream.pipe(uploadStream);
    });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return null;
  }
};

// Main migration function
const migrateImages = async () => {
  const Listing = await connectDB();
  
  try {
    // Find all listings with images that are not from Cloudinary
    const listings = await Listing.find({
      'images.0': { $exists: true },
      'images': {
        $not: {
          $all: [
            { $elemMatch: { url: /cloudinary\.com/ } }
          ]
        }
      }
    }).lean();

    if (!listings || listings.length === 0) {
      console.log('No listings with non-Cloudinary images found');
      return;
    }

    console.log(`Found ${listings.length} listings with non-Cloudinary images`);
    
    let processed = 0;
    let updated = 0;
    let totalImagesProcessed = 0;
    let totalImagesUploaded = 0;
    
    for (const listing of listings) {
      processed++;
      console.log(`\nProcessing listing ${processed}/${listings.length} (ID: ${listing._id})`);
      
      const newImages = [];
      let needsUpdate = false;
      
      for (const img of listing.images) {
        totalImagesProcessed++;
        
        // Skip if already a Cloudinary URL
        if (img.url && img.url.includes('cloudinary.com')) {
          console.log(`  ✓ Already using Cloudinary: ${img.url.substring(0, 50)}...`);
          newImages.push(img);
          continue;
        }
        
        // Process external URL
        if (img.url && (img.url.startsWith('http://') || img.url.startsWith('https://'))) {
          console.log(`  Downloading: ${img.url}`);
          const imageBuffer = await downloadImage(img.url);
          
          if (imageBuffer) {
            console.log(`  Uploading to Cloudinary...`);
            const result = await uploadToCloudinary(imageBuffer);
            
            if (result) {
              const cloudinaryImage = {
                url: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                width: result.width,
                height: result.height
              };
              
              newImages.push(cloudinaryImage);
              needsUpdate = true;
              totalImagesUploaded++;
              console.log(`  ✓ Uploaded to: ${cloudinaryImage.url.substring(0, 50)}...`);
              continue;
            }
          }
        }
        
        // If we get here, keep the original image
        console.log('  ✗ Failed to process, keeping original');
        newImages.push(img);
      }
      
      // Update the listing if any images were uploaded to Cloudinary
      if (needsUpdate) {
        await Listing.updateOne(
          { _id: listing._id },
          { $set: { images: newImages } }
        );
        updated++;
        console.log(`  ✓ Updated listing ${listing._id}`);
      }
    }
    
    console.log(`\nMigration complete!`);
    console.log(`- Processed: ${listings.length} listings`);
    console.log(`- Updated: ${updated} listings`);
    console.log(`- Total images processed: ${totalImagesProcessed}`);
    console.log(`- Total images uploaded to Cloudinary: ${totalImagesUploaded}`);
    
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

// Run the migration
migrateImages();
