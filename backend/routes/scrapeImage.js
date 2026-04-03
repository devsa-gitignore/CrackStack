const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();

router.post('/scrape-image', async (req, res) => {
  const { productUrl } = req.body;
  try {
    // WEB SCRAPING CURRENTLY DISABLED - NOT WORKING RELIABLY ON AMAZON
    return res.status(200).json({ 
      error: 'URL scraping is currently disabled. Please download the product image and upload it manually.',
      imageUrl: null
    });
  } catch (error) {
    console.error(`[SCRAPER ERROR] ${error.message} (Status: ${error.response?.status || 'N/A'}) - URL: ${productUrl}`);
    res.status(500).json({ error: 'Failed to access the store URL. It might be blocking automated access.' });
  }
});

module.exports = router;

