const mongoose = require('mongoose');
require('dotenv').config();

async function clearPodcastData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/echo3ai');
    console.log('✅ Connected to MongoDB');

    // Clear all podcast collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    for (const collection of collections) {
      if (collection.name === 'podcasts') {
        await mongoose.connection.db.collection('podcasts').deleteMany({});
        console.log('🗑️  Cleared podcasts collection');
      }
    }

    console.log('✅ Database cleared successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  }
}

clearPodcastData(); 