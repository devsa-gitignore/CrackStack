const express = require('express');
const Groq = require('groq-sdk');
const router = express.Router();

router.post('/style-suggest', async (req, res) => {
  try {
    const { styleProfile, currentCloth, image, targetOccasion } = req.body;
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    // AI FALLBACK: Return mock data if missing API Key
    if (!GROQ_API_KEY) {
      console.log('[styleSuggest] Using Mock Results (No Groq Key)');
      return res.json({
        outfit_pairings: ["Pair with light wash denim jeans and white sneakers", "Layer under a tan bomber jacket for evenings"],
        occasion: "Casual outings and weekend brunches",
        style_tip: "Roll the sleeves up slightly for a more relaxed, fitted look."
      });
    }

    const groq = new Groq({ apiKey: GROQ_API_KEY });
    
    // Create the AI Instruction Prompt
    const occasionPrompt = targetOccasion 
      ? `CRITICAL REQUIREMENT: The user is specifically dressing for: "${targetOccasion}". You MUST tailor all outfit suggestions strictly for this event. Do NOT suggest random occasions.` 
      : 'Provide the best occasions to wear this.';

    const prompt = `You are an expert personal stylist AI.
I am providing a photo of the exact garment the user is wearing. Pay deep attention to its physical texture, patterns, and precise color.

The user's established style profile based on session history is:
${JSON.stringify(styleProfile || {}, null, 2)}

(Note: Evaluate the user's complexion/skin tone hex color "${styleProfile?.complexion}" and body proportions (Torso/Shoulder ratio: ${styleProfile?.bodyProportions?.ratio}) carefully. Some colors and fits complement certain tones/ratios better.)

${occasionPrompt}

Provide a strict JSON response with no other text, containing:
1. "outfit_pairings": An array of 2 specific outfit suggestions incorporating the current cloth. They MUST complement the user's complexion and the requested occasion if provided.
2. "occasion": Best occasions to wear this (If the user specified "${targetOccasion || 'none'}", write exactly why it fits that specific occasion).
3. "style_tip": One actionable style upgrade tip tailored strictly to their complexion and proportion ratio.

Return ONLY valid JSON. Start with { and end with }. Do not add markdown backticks.
Valid JSON example: 
{"outfit_pairings":["...","..."], "occasion":"...", "style_tip":"..."}`;

    // Llama 3 Vision formatting
    const messages = [
      { 
        role: "user", 
        content: [
          { type: "text", text: prompt }
        ] 
      }
    ];

    // Read the base64 and append it so Llama 3.2 Vision can physically evaluate the image
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

    // Clean up JSON parsing (Vision models don't support JSON mode right now)
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
    console.error('Style Suggest error:', error.message);
    res.status(500).json({ error: 'Failed to generate style suggestions' });
  }
});

module.exports = router;
