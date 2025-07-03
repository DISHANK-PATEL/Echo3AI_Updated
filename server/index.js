const express = require('express');
const multer = require('multer');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const FormData = require('form-data');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const podcastSchema = new mongoose.Schema({
  title: String,
  creator: String,
  guest: String,
  genre: String,
  description: String,
  thumbnail: String,
  ipfsHash: String,
  isLive: { type: Boolean, default: false },
  isNew: { type: Boolean, default: true },
  duration: { type: String, default: '00:00' },
  listeners: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});
const Podcast = mongoose.model('Podcast', podcastSchema);

// Upload and pin file to IPFS, then save podcast metadata
app.post('/api/upload', upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
  try {
    // Upload main file to IPFS
    const data = new FormData();
    const videoFile = req.files['file'] ? req.files['file'][0] : null;
    if (!videoFile) return res.status(400).json({ error: 'No video file uploaded' });
    data.append('file', fs.createReadStream(videoFile.path));
    const pinataRes = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      data,
      {
        maxBodyLength: 'Infinity',
        headers: {
          ...data.getHeaders(),
          pinata_api_key: process.env.PINATA_API_KEY,
          pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
        },
      }
    );
    fs.unlinkSync(videoFile.path);
    const ipfsHash = pinataRes.data.IpfsHash;

    // Upload thumbnail to IPFS if present
    let thumbnailHash = '';
    if (req.files['thumbnail'] && req.files['thumbnail'][0]) {
      const thumbData = new FormData();
      thumbData.append('file', fs.createReadStream(req.files['thumbnail'][0].path));
      const thumbRes = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        thumbData,
        {
          maxBodyLength: 'Infinity',
          headers: {
            ...thumbData.getHeaders(),
            pinata_api_key: process.env.PINATA_API_KEY,
            pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
          },
        }
      );
      fs.unlinkSync(req.files['thumbnail'][0].path);
      thumbnailHash = thumbRes.data.IpfsHash;
    }

    // Save podcast metadata and IPFS hashes
    const { title, creator, guest, genre, description } = req.body;
    const podcast = new Podcast({
      title,
      creator,
      guest,
      genre,
      description,
      thumbnail: thumbnailHash ? `https://gateway.pinata.cloud/ipfs/${thumbnailHash}` : '',
      ipfsHash,
      isLive: false,
      isNew: true,
      duration: '00:00',
      listeners: 0,
    });
    await podcast.save();

    res.json({ ipfsHash, thumbnailHash, podcast });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all podcasts
app.get('/api/podcasts', async (req, res) => {
  try {
    const podcasts = await Podcast.find().sort({ createdAt: -1 });
    res.json(podcasts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5001, () => console.log('Server running on port 5001')); 