const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Process uploaded image: optimize, resize if needed, create thumbnail
 * @param {string} inputPath - Path to original image
 * @param {string} thumbnailPath - Path where thumbnail should be saved
 * @param {object} options - Processing options
 * @returns {Promise<object>} - Image metadata (width, height, size)
 */
async function processImage(inputPath, thumbnailPath, options = {}) {
  try {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      thumbnailWidth = 300,
      thumbnailHeight = 300,
      quality = 85
    } = options;

    // Get original image metadata
    const metadata = await sharp(inputPath).metadata();

    // Process main image - resize if too large
    let imageSharp = sharp(inputPath);

    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      imageSharp = imageSharp.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Optimize and compress
    const processedBuffer = await imageSharp
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();

    // Write optimized image back
    await fs.promises.writeFile(inputPath, processedBuffer);

    // Get processed metadata
    const processedMetadata = await sharp(inputPath).metadata();

    // Create thumbnail
    await sharp(inputPath)
      .resize(thumbnailWidth, thumbnailHeight, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    return {
      width: processedMetadata.width,
      height: processedMetadata.height,
      size: processedBuffer.length,
      format: processedMetadata.format
    };
  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error('Chyba při zpracování obrázku');
  }
}

/**
 * Get image dimensions without processing
 * @param {string} imagePath - Path to image
 * @returns {Promise<object>} - Width and height
 */
async function getImageDimensions(imagePath) {
  try {
    const metadata = await sharp(imagePath).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format
    };
  } catch (error) {
    console.error('Get dimensions error:', error);
    return { width: null, height: null, format: null };
  }
}

/**
 * Create thumbnail for existing image
 * @param {string} inputPath - Path to original image
 * @param {string} outputPath - Path for thumbnail
 * @param {number} width - Thumbnail width
 * @param {number} height - Thumbnail height
 * @returns {Promise<void>}
 */
async function createThumbnail(inputPath, outputPath, width = 300, height = 300) {
  try {
    await sharp(inputPath)
      .resize(width, height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toFile(outputPath);
  } catch (error) {
    console.error('Create thumbnail error:', error);
    throw new Error('Chyba při vytváření náhledu');
  }
}

/**
 * Delete image and its thumbnail
 * @param {string} imagePath - Path to main image
 * @param {string} thumbnailPath - Path to thumbnail
 * @returns {Promise<void>}
 */
async function deleteImageFiles(imagePath, thumbnailPath) {
  try {
    if (imagePath && fs.existsSync(imagePath)) {
      await fs.promises.unlink(imagePath);
    }
    if (thumbnailPath && fs.existsSync(thumbnailPath)) {
      await fs.promises.unlink(thumbnailPath);
    }
  } catch (error) {
    console.error('Delete image files error:', error);
  }
}

module.exports = {
  processImage,
  getImageDimensions,
  createThumbnail,
  deleteImageFiles
};
