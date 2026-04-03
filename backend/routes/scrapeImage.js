const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();

router.post('/scrape-image', async (req, res) => {
  const { productUrl } = req.body;
  try {
    if (!productUrl || !productUrl.startsWith('http')) {
      return res.status(400).json({ error: 'A valid http(s) URL is required' });
    }

    console.log(`[SCRAPER] Cheerio Fetching: ${productUrl}`);

    const response = await axios.get(productUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);

    // 1. Check OpenGraph image (og:image)
    let imageUrl = $('meta[property="og:image"]').attr('content') || 
                   $('meta[name="og:image"]').attr('content');

    // 2. Check Twitter image (twitter:image)
    if (!imageUrl) {
      imageUrl = $('meta[name="twitter:image"]').attr('content') || 
                 $('meta[property="twitter:image"]').attr('content');
    }

    // 3. Check for specific high-res product image markers
    if (!imageUrl) {
      imageUrl = $('link[rel="image_src"]').attr('href') ||
                 $('meta[itemprop="image"]').attr('content');
    }

    // 4. Fallback: Find the first image with "product" or "main" in its name/alt
    if (!imageUrl) {
      console.log('[SCRAPER] Primary meta-tags missing, scanning img tags...');
      const fallbackImg = $('img[src*="product"], img[src*="main"], img[alt*="product"], img[alt*="main"]').first().attr('src');
      if (fallbackImg) imageUrl = fallbackImg;
    }

    // 5. Final fallback: just take the first high-res looking image
    if (!imageUrl) {
      const firstImg = $('img').filter((i, el) => {
        const src = $(el).attr('src') || '';
        return src.includes('https://') && !src.includes('pixel') && !src.includes('icon');
      }).first().attr('src');
      imageUrl = firstImg;
    }

    if (!imageUrl) {
      console.error(`[SCRAPER] No image found for: ${productUrl}`);
      return res.status(404).json({ error: 'No product image detected. Please upload manually.' });
    }

    // Resolve relative URLs to absolute
    let finalUrl = imageUrl;
    if (finalUrl.startsWith('//')) {
      finalUrl = 'https:' + finalUrl;
    } else if (finalUrl.startsWith('/')) {
      const urlObj = new URL(productUrl);
      finalUrl = urlObj.origin + finalUrl;
    }

    console.log(`[SCRAPER SUCCESS] Extracted: ${finalUrl}`);
    res.json({ imageUrl: finalUrl });

  } catch (error) {
    console.error(`[SCRAPER ERROR] ${error.message} (Status: ${error.response?.status || 'N/A'}) - URL: ${productUrl}`);
    res.status(500).json({ error: 'Failed to access the store URL. It might be blocking automated access.' });
  }
});

module.exports = router;
