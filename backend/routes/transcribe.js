const express = require('express');
const multer = require('multer');
const path = require('path');
const supabase = require('../config/supabase');

const router = express.Router();

// Configure Multer for audio file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp3|wav|m4a|ogg|webm|mpeg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('❌ Only audio files are allowed! (mp3, wav, m4a, ogg, webm)'));
  }
});

// POST /api/transcribe - Upload audio and save to database
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No audio file uploaded' 
      });
    }

    // Insert record into Supabase
    const { data, error } = await supabase
      .from('transcriptions')
      .insert({
        filename: req.file.filename,
        audio_url: `/uploads/${req.file.filename}`,
        transcription: null,           // Will be updated later after transcription
        file_size: req.file.size,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }

    res.status(201).json({
      success: true,
      message: 'Audio file uploaded successfully',
      record: data,
      filePath: req.file.path,
      filename: req.file.filename
    });

  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload file'
    });
  }
});

// GET /api/transcribe - Get all transcriptions (for history)
router.get('/transcribe', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('transcriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      transcriptions: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;