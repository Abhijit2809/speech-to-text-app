const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { Groq } = require('groq-sdk');

const router = express.Router();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Completely permissive upload
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 25 * 1024 * 1024 }
});

router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    console.log('✅ File received:', req.file.filename);

    // Try transcription
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: "whisper-large-v3-turbo",
      response_format: "text",
    });

    const transcribedText = transcription.text;

    res.json({
      success: true,
      message: "🎉 Transcription Successful!",
      transcription: transcribedText,
      filename: req.file.filename
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;