const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Groq } = require('groq-sdk');
const supabase = require('../config/supabase');

const router = express.Router();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Multer Setup
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 }
});

// POST /api/transcribe
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    console.log('File uploaded:', req.file.filename);

    // Groq Transcription
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: "whisper-large-v3-turbo",
      response_format: "text",
    });

    const transcribedText = transcription.text;

    // Save to Supabase
    const { data, error } = await supabase
      .from('transcriptions')        // Make sure table name is correct
      .insert({
        filename: req.file.filename,
        audio_url: `/uploads/${req.file.filename}`,
        transcription: transcribedText,
        file_size: req.file.size,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase Error:", error);
      throw error;
    }

    res.json({
      success: true,
      transcription: transcribedText,
      record: data
    });

  } catch (error) {
    console.error("Full Error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;