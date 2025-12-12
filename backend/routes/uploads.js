const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Pouze obrázkové soubory jsou povoleny'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Upload profile photo
router.post('/profile-photo', upload.single('profilePhoto'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Žádný soubor nebyl nahrán' });
    }

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'ID uživatele je povinné' });
    }

    // Process image with Sharp
    const processedFilename = `profile-${userId}-${Date.now()}.webp`;
    const processedPath = path.join('uploads/processed/', processedFilename);

    // Create processed directory if it doesn't exist
    if (!fs.existsSync('uploads/processed/')) {
      fs.mkdirSync('uploads/processed/', { recursive: true });
    }

    await sharp(req.file.path)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 80 })
      .toFile(processedPath);

    // Delete original file
    fs.unlinkSync(req.file.path);

    // Return file information
    res.json({
      message: 'Profilová fotka úspěšně nahrána',
      file: {
        originalName: req.file.originalname,
        filename: processedFilename,
        path: `/uploads/processed/${processedFilename}`,
        size: fs.statSync(processedPath).size,
        mimetype: 'image/webp'
      }
    });

  } catch (error) {
    console.error('Error uploading profile photo:', error);
    
    // Clean up uploaded file if processing failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Chyba při nahrávání fotky' });
  }
});

// Upload multiple service photos
router.post('/service-photos', upload.array('servicePhotos', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Žádné soubory nebyly nahrány' });
    }

    const { serviceId } = req.body;
    if (!serviceId) {
      return res.status(400).json({ error: 'ID služby je povinné' });
    }

    const processedFiles = [];

    // Process each uploaded file
    for (const file of req.files) {
      const processedFilename = `service-${serviceId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.webp`;
      const processedPath = path.join('uploads/processed/', processedFilename);

      await sharp(file.path)
        .resize(800, 600, {
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality: 85 })
        .toFile(processedPath);

      // Delete original file
      fs.unlinkSync(file.path);

      processedFiles.push({
        originalName: file.originalname,
        filename: processedFilename,
        path: `/uploads/processed/${processedFilename}`,
        size: fs.statSync(processedPath).size,
        mimetype: 'image/webp'
      });
    }

    res.json({
      message: `${processedFiles.length} fotografií úspěšně nahráno`,
      files: processedFiles
    });

  } catch (error) {
    console.error('Error uploading service photos:', error);
    
    // Clean up uploaded files if processing failed
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(500).json({ error: 'Chyba při nahrávání fotografií' });
  }
});

// Delete uploaded file
router.delete('/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join('uploads/processed/', filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: 'Soubor úspěšně smazán' });
    } else {
      res.status(404).json({ error: 'Soubor nenalezen' });
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Chyba při mazání souboru' });
  }
});

// Serve static files (in production, this would be handled by nginx/CDN)
router.use('/processed', express.static('uploads/processed'));

module.exports = router;