import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import mongoose from 'mongoose';

// Routes
import findSimilarRoutes from './routes/findSimilar.js';
import styleSuggestRoutes from './routes/styleSuggest.js';
import trendAnalysisRoutes from './routes/trendAnalysis.js';
import scrapeImageRoutes from './routes/scrapeImage.js';
import removeBgRoutes from './routes/removeBg.js';
import wardrobeRoutes from './routes/wardrobeRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(morgan('dev'));

// Routing
app.use('/api', findSimilarRoutes);
app.use('/api', styleSuggestRoutes);
app.use('/api', trendAnalysisRoutes);
app.use('/api', scrapeImageRoutes);
app.use('/api', removeBgRoutes);
app.use('/api', wardrobeRoutes);

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crackstack';
mongoose.connect(MONGODB_URI)
  .then(() => console.log(' Connected to MongoDB'))
  .catch(err => console.error('MongoDB Connection Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Node.js Backend running on http://localhost:${PORT}`);
  console.log('Available AI & Wardrobe Endpoints:');
  console.log(' - POST /api/find-similar');
  console.log(' - POST /api/style-suggest');
  console.log(' - POST /api/trend-analysis');
  console.log(' - POST /api/wardrobe (Smart Wardrobe Save)');
  console.log(' - GET  /api/wardrobe (List All Items)');
  console.log(' - GET  /api/wardrobe/complete/:id (Outfit Completion)');
});
