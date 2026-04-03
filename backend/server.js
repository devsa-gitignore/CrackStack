const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Allows massive Base64 Image Strings

// AI Feature Routes
app.use('/api', require('./routes/findSimilar'));
app.use('/api', require('./routes/styleSuggest'));
app.use('/api', require('./routes/trendAnalysis'));

app.use('/api', require('./routes/scrapeImage'));
app.use('/api', require('./routes/removeBg'));
// app.use('/api', require('./routes/classify'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Node.js Backend running on http://localhost:${PORT}`);
  console.log('Available AI Endpoints:');
  console.log(' - POST /api/find-similar');
  console.log(' - POST /api/style-suggest');
  console.log(' - POST /api/trend-analysis');
});
