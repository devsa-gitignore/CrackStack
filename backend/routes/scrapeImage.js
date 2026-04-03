const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/scrape-image', async (req, res) => {
  try {
    const { productUrl } = req.body;
    
    if (!productUrl || !productUrl.startsWith('http')) {
      return res.status(400).json({ error: 'A valid http(s) URL is required' });
    }

    // Pretend to be a real browser so retail sites don't block us immediately
    const response = await axios.get(productUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      timeout: 8000
    });

    const html = response.data;

    console.log(`[SCRAPER] Processing URL: ${productUrl} (HTML Length: ${html.length})`);

    // Helper to extract content from meta tags more robustly
    const getMetaTag = (tag) => {
      // Matches both <meta property="..." content="..."> and <meta content="..." property="...">
      const regex1 = new RegExp(`<meta[^>]+(?:property|name)=["']${tag}["'][^>]+content=["']([^"']+)["']`, 'i');
      const regex2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${tag}["']`, 'i');
      const match = html.match(regex1) || html.match(regex2);
      return match ? match[1] : null;
    };

    const ogImage = getMetaTag('og:image');
    const twitterImage = getMetaTag('twitter:image');
    const schemaImage = getMetaTag('image'); // Generic <meta name="image">
    
    // Fallback logic for various retailers
    let imageUrl = ogImage || twitterImage || schemaImage;

    // Last resort fallback: check for common product image identifiers in the HTML
    if (!imageUrl) {
      console.log(`[SCRAPER] Meta tags failed, attempting generic img search...`);
      // Try finding images with titles like "product", "main", "primary" in their src or alt
      const genericImgMatch = html.match(/<img[^>]+src=["'](https:\/\/[^"']+(?:product|main|primary|large)[^"']+\.(?:jpg|jpeg|png|webp))["']/i) || 
                              html.match(/<img[^>]+src=["'](https:\/\/[^"']+\.(?:jpg|jpeg|png|webp))["']/i);
      imageUrl = genericImgMatch ? genericImgMatch[1] : null;
    }

    if (!imageUrl) {
      console.error(`[SCRAPER ERROR] Could not find any suitable image for: ${productUrl}`);
      return res.status(404).json({ error: 'Could not detect a main product image on that page. Please try another URL or upload manually.' });
    }

    // Fix relative URLs if any sneak through
    let finalUrl = imageUrl;
    if (finalUrl.startsWith('//')) {
      finalUrl = 'https:' + finalUrl;
    } else if (finalUrl.startsWith('/')) {
      try {
        const urlObj = new URL(productUrl);
        finalUrl = urlObj.origin + finalUrl;
      } catch (err) {
        console.error(`[SCRAPER ERROR] Failed to construct absolute URL from ${finalUrl}`);
      }
    }

    console.log(`[SCRAPER SUCCESS] Found image: ${finalUrl}`);
    res.json({ imageUrl: finalUrl });

  } catch (error) {
    console.error(`[SCRAPER FATAL ERROR] ${error.message} for URL: ${req.body.productUrl}`);
    if (error.response) {
      console.error(`[SCRAPER STATUS] ${error.response.status} - ${error.response.statusText}`);
    }
    res.status(500).json({ 
      error: 'Failed to scrape the website. It might be heavily protected or invalid.',
      details: error.message
    });
  }
});

module.exports = router;
