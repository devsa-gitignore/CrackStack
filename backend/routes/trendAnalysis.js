import express from 'express';
import Groq from 'groq-sdk';
const router = express.Router();

router.post('/trend-analysis', async (req, res) => {
  try {
    const { garmentDescription, currentYear = 2025, image } = req.body;
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      console.log('[trendAnalysis] Using Mock Results (No Groq Key)');
      return res.json({
        design_language: "Minimalist Core",
        trend_match: `Perfectly aligns with ${currentYear} Quiet Luxury`,
        style_icon: "Jacob Elordi",
        trending_now: ["Earthy Tones", "Relaxed Fits", "Hidden Logos"]
      });
    }

    const groq = new Groq({ apiKey: GROQ_API_KEY });

    const prompt = `You are a fashion trend forecasting API.
I am providing an image of a garment. Please physically inspect its design, texture, brand logos, color gradients, and fit.

Provide a strict JSON response mapping this garment to ${currentYear} fashion trends with:
- "design_language": The core aesthetic category (e.g. minimalist streetwear, vintage core)
- "trend_match": A brief sentence on how its specific physical traits matches ${currentYear} styles.
- "style_icon": A celebrity known for wearing this specific visual aesthetic.
- "trending_now": An array of 3 related micro-trends happening right now in fashion.

Return ONLY valid JSON. Start with { and end with }. Do not add markdown backticks.
Valid JSON example: 
{"design_language":"...", "trend_match":"...", "style_icon":"...", "trending_now":["...","...","..."]}`;

    const messages = [
      { 
        role: "user", 
        content: [
          { type: "text", text: prompt }
        ] 
      }
    ];

    if (image) {
      messages[0].content.push({ type: "image_url", image_url: { url: image } });
    }

    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: "meta-llama/llama-4-scout-17b-16e-instruct", // Used per user request
      temperature: 0.7,
      max_tokens: 800,
    });

    let aiText = chatCompletion.choices[0].message.content.trim();

    try {
      const jsonStart = aiText.indexOf('{');
      const jsonEnd = aiText.lastIndexOf('}') + 1;
      if(jsonStart !== -1 && jsonEnd !== -1) {
        aiText = aiText.substring(jsonStart, jsonEnd);
      }
      res.json(JSON.parse(aiText));
    } catch (e) {
      console.error('JSON Parse fail on Llama reply:', aiText);
      res.status(500).json({ error: 'AI failed to format JSON' });
    }

  } catch (error) {
    console.error('Trend Analysis error:', error.message);
    res.status(500).json({ error: 'Failed to generate trend analysis' });
  }
});

export default router;
