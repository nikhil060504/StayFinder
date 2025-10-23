const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true
});

/**
 * Uploads an image to Cloudinary
 * @param {String} image - Base64 image string
 * @returns {Promise<Object>} - Cloudinary upload result
 */
const uploadImage = async (image) => {
  try {
    // Remove the data:image/...;base64, prefix if present
    const base64Image = image.includes('base64,') 
      ? image.split('base64,')[1] 
      : image;

    const result = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${base64Image}`, 
      {
        upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || 'stayfinder_uploads',
        resource_type: 'auto'
      }
    );
    
    return {
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

/**
 * Deletes an image from Cloudinary
 * @param {String} publicId - The public ID of the image to delete
 * @returns {Promise<Object>} - Cloudinary deletion result
 */
const deleteImage = async (publicId) => {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Failed to delete image from Cloudinary');
  }
};

module.exports = {
  uploadImage,
  deleteImage
};
