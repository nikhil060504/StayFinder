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

// Test image URL (replace with one of your actual image URLs)
const TEST_IMAGE_URL = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800';

// Test Cloudinary upload
const testUpload = async () => {
  try {
    console.log('Testing Cloudinary upload...');
    
    // Upload directly from URL
    const result = await cloudinary.uploader.upload(TEST_IMAGE_URL, {
      folder: 'stayfinder/test',
      resource_type: 'auto'
    });
    
    console.log('Upload successful!');
    console.log('Public ID:', result.public_id);
    console.log('Secure URL:', result.secure_url);
    
    // Clean up (delete the test image)
    await cloudinary.uploader.destroy(result.public_id);
    console.log('Test image deleted from Cloudinary');
    
  } catch (error) {
    console.error('Test upload failed:', error);
  }
};

// Run the test
testUpload().then(() => process.exit(0));
