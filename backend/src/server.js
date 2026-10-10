import dns from 'dns';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import apiRouter from './routes/index.js';
import { checkAndSeedDatabase } from './services/seedService.js';

// Setup custom DNS fallback for MongoDB Atlas SRV lookups on Windows
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore if custom DNS is not permitted
}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const MONGODB_URI =  'mongodb://127.0.0.1:27017/surpluslinkk';

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Start Server immediately
app.listen(PORT, () => {
  console.log(`[SurplusLink] Server listening on http://localhost:${PORT}`);
});

// Connect to Database
async function connectDB() {
  try {
    console.log(`[SurplusLink] Connecting to MongoDB: ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log('[SurplusLink] Connected to MongoDB Atlas successfully.');

    // Seed initial data if state is empty
    await checkAndSeedDatabase();
  } catch (error) {
    console.error('[SurplusLink] Database connection notice:', error.message);
  }
}

connectDB();
