import express from 'express';
import axios from 'axios';
const router = express.Router();

/**
 * FEATURE 1: Similar Cloth Finder (Shop by Look)
 * 
 * Takes a garment description (e.g. "navy blue slim fit tshirt") and uses the
 * Tavily Search API to find real product links across the web.
 */
router.post('/find-similar', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
    
    // AI FALLBACK: If no API key is provided, return mock data so the demo never crashes
    if (!TAVILY_API_KEY) {
      console.log('[findSimilar] Using Mock Results (No Tavily Key)');
      return res.json({
        results: [
          { title: "Navy Blue Crew Neck T-Shirt", url: "https://www.myntra.com/tshirts/", content: "₹499. Classic fit.", score: 0.95 },
          { title: "Basic Blue Tee - Zara", url: "https://www.zara.com/in/", content: "₹990. Premium cotton.", score: 0.88 },
          { title: "Men's Solid Regular Fit H&M", url: "https://www2.hm.com/en_in/", content: "₹399. Sustainable material.", score: 0.85 }
        ]
      });
    }

    // Hit the Tavily Search API
    const response = await axios.post('https://api.tavily.com/search', {
      api_key: TAVILY_API_KEY,
      query: `${query} buy online India clothing`,
      max_results: 5,
      search_depth: 'basic',
      include_images: false // True uses more credits if image results are needed
    });

    res.json({ results: response.data.results });
  } catch (error) {
    console.error('Find Similar error:', error.message);
    res.status(500).json({ error: 'Failed to fetch similar products' });
  }
});

export default router;
