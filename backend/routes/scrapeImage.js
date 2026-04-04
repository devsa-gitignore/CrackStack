const express = require('express');
const axios = require('axios');
const router = express.Router();

/**
 * TAVILY POWERED IMAGE SCRAPER
 * Replaces unreliable Cheerio scraping with Google-tier search capability.
 */
router.post('/scrape-image', async (req, res) => {
  const { productUrl } = req.body;
  
  if (!productUrl) {
    return res.status(400).json({ error: 'Please provide a valid retail URL.' });
  }

  try {
    const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
    if (!TAVILY_API_KEY) {
      throw new Error('Missing TAVILY_API_KEY in .env');
    }

    console.log(`[TAVILY] Extracting image from: ${productUrl}`);

    // High-performance search with image extraction enabled
    const response = await axios.post('https://api.tavily.com/search', {
      api_key: TAVILY_API_KEY,
      query: `product photo/image for ${productUrl}`,
      max_results: 1,
      include_images: true,
      search_depth: 'advanced'
    });

    const images = response.data.images || [];
    
    if (images.length === 0) {
      // Fallback: If Tavily fails, notify the user to upload manually
      return res.status(404).json({ 
        error: 'Tavily could not find a high-quality product image for this link. Retailer protections might be too high. Please upload a screenshot manually.',
        imageUrl: null
      });
    }

    // Success! Return the top-scored image
    res.json({ imageUrl: images[0] });

  } catch (error) {
    console.error(`[TAVILY SCRAPE ERROR] ${error.message}`);
    res.status(500).json({ error: 'Search-based extraction failed. Check your Tavily credits.' });
  }
});

module.exports = router;
