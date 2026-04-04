import Groq from 'groq-sdk';

// Footwear keywords to extract footwear suggestion from pairings
const FOOTWEAR_KEYWORDS = ['sneakers', 'shoes', 'boots', 'sandals', 'loafers', 'oxford', 'heels', 'flats', 'slip-on'];

/**
 * Checks if a pairing string is footwear-related
 */
const isFootwearSuggestion = (pairing) => {
  return FOOTWEAR_KEYWORDS.some(kw => pairing.toLowerCase().includes(kw));
};

/**
 * Calls Groq (Llama Vision) with the garment image + cloth info
 * and returns a mapped styleSuggestions object ready to store in DB.
 *
 * @param {string} imageUrl  - Cloudinary URL or base64 data URL
 * @param {string} clothType - e.g. 'tshirt', 'jacket'
 * @param {string[]} colors  - e.g. ['navy', 'white']
 * @returns {Object} styleSuggestions ready for DB
 */
export const getAISuggestions = async (imageUrl, clothType, colors = []) => {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  // Graceful fallback when no API key is configured
  if (!GROQ_API_KEY) {
    console.warn('[groqSuggest] No GROQ_API_KEY — returning mock suggestions');
    return {
      vibe: 'casual',
      pairWith: ['light wash denim jeans', 'white sneakers'],
      footwear: 'white sneakers',
      occasion: 'Casual outings and weekend hangouts',
      styleTip: 'Roll sleeves slightly for a relaxed, effortless look.',
      searchQuery: `${colors.join(' ')} ${clothType} trendy`,
      trends: ['Minimalist Chic', 'Everyday Casual']
    };
  }

  const groq = new Groq({ apiKey: GROQ_API_KEY });

  const prompt = `You are an expert personal stylist AI analyzing a garment.

The garment details:
- Type: ${clothType}
- Colors: ${colors.join(', ') || 'unknown'}

Look at the garment image carefully (texture, fit, pattern, color).

Return ONLY valid JSON with these exact keys (no markdown, no extra text):
{
  "outfit_pairings": ["<specific pairing 1>", "<specific pairing 2>"],
  "occasion": "<best occasions to wear this>",
  "style_tip": "<one actionable tip>",
  "search_query": "<specific shopping search query for similar items>",
  "trends": ["<trend 1>", "<trend 2>"]
}`;

  const messages = [
    {
      role: 'user',
      content: [{ type: 'text', text: prompt }]
    }
  ];

  // Attach image — works for both base64 and Cloudinary URLs
  if (imageUrl) {
    messages[0].content.push({ type: 'image_url', image_url: { url: imageUrl } });
  }

  const completion = await groq.chat.completions.create({
    messages,
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    temperature: 0.7,
    max_tokens: 600
  });

  let raw = completion.choices[0].message.content.trim();

  // Clean up potential markdown JSON blocks
  if (raw.startsWith('```')) {
    raw = raw.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
  }

  // Strip any accidental text before/after JSON
  const jsonStart = raw.indexOf('{');
  const jsonEnd = raw.lastIndexOf('}') + 1;
  const parsed = JSON.parse(raw.substring(jsonStart, jsonEnd));

  const outfitPairings = parsed.outfit_pairings || [];

  // Separate footwear from clothing pairings
  const footwearEntry = outfitPairings.find(isFootwearSuggestion) || '';
  const pairWith = outfitPairings.filter(p => !isFootwearSuggestion(p));

  return {
    vibe: parsed.occasion?.split('.')[0] || '',   // short vibe from first sentence of occasion
    pairWith,
    footwear: footwearEntry,
    occasion: parsed.occasion || '',
    styleTip: parsed.style_tip || '',
    searchQuery: parsed.search_query || '',
    trends: parsed.trends || []
  };
};
