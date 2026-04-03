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

    // We use a regular expression to intelligently hunt for the "og:image" meta tag.
    // Almost every major modern shopping site uses this exact tag to show the main product picture on WhatsApp/iMessage previews.
    const ogImageMatch = html.match(/<meta\s+(?:property|name)=["']og:image["']\s+content=["'](.*?)["']/i);
    
    // Fallback: look for twitter:image if og:image fails
    const twitterImageMatch = html.match(/<meta\s+(?:property|name)=["']twitter:image["']\s+content=["'](.*?)["']/i);

    // Fallback 2: grab the very first massive image tag we can find loosely
    const genericImgMatch = html.match(/<img[^>]+src=["'](https:\/\/[^"']+)["']/i);

    const imageUrl = (ogImageMatch && ogImageMatch[1]) || 
                     (twitterImageMatch && twitterImageMatch[1]) || 
                     (genericImgMatch && genericImgMatch[1]);

    if (!imageUrl) {
      return res.status(404).json({ error: 'Could not detect a main product image on that page' });
    }

    // Fix relative URLs if any sneak through
    let finalUrl = imageUrl;
    if (finalUrl.startsWith('//')) {
      finalUrl = 'https:' + finalUrl;
    }

    res.json({ imageUrl: finalUrl });

  } catch (error) {
    console.error('Scrape Image Error:', error.message);
    res.status(500).json({ error: 'Failed to scrape the website. It might be heavily protected or invalid.' });
  }
});

module.exports = router;
