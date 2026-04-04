import express from 'express';
import axios from 'axios';
import FormData from 'form-data';
const router = express.Router();

router.post('/remove-bg', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image base64 is required' });
    }

    const apiKey = process.env.REMOVE_BG_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'REMOVE_BG_API_KEY is not configured in .env' });
    }

    // Convert base64 data URL to a pure buffer
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const formData = new FormData();
    formData.append('size', 'auto');
    formData.append('image_file', imageBuffer, { filename: 'upload.jpg' });

    // Hit the Remove.bg API
    const response = await axios({
      method: 'post',
      url: 'https://api.remove.bg/v1.0/removebg',
      data: formData,
      responseType: 'arraybuffer',
      headers: {
        ...formData.getHeaders(),
        'X-Api-Key': apiKey,
      },
    });

    // Return the transparent image back as base64 to the frontend
    const transparentBase64 = Buffer.from(response.data, 'binary').toString('base64');
    res.json({ result: `data:image/png;base64,${transparentBase64}` });

  } catch (error) {
    console.error('RemoveBg Error:', error.response ? error.response.data.toString() : error.message);
    res.status(500).json({ error: 'Failed to process background removal', details: error.message });
  }
});

export default router;
