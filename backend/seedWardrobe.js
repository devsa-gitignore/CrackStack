/**
 * SEED SCRIPT — Hardcoded Kurta + 2 Pajamas
 * 
 * Run with:   node seedWardrobe.js
 * 
 * This inserts 3 items into the database:
 *   1. A Kurta with hardcoded styleSuggestions that mention "pajama"
 *   2. Two Pajamas that the /complete endpoint will match
 * 
 * All items have source: 'seed' so you can identify them in the DB.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import WardrobeItem from './models/WardrobeItem.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crackstack';

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('[Seed] Connected.');

    // ── Step 1: Remove any previously seeded items (clean re-run) ──
    const deleted = await WardrobeItem.deleteMany({ source: 'seed' });
    console.log(`[Seed] Cleared ${deleted.deletedCount} old seeded items.`);

    // ── Step 2: Insert the two Pajamas FIRST ──
    const pajama1 = await WardrobeItem.create({
      userId: 'demo-user',
      imageUrl: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQRudl_Rd0L_QzFV9QkS2s-tXmIibmFkSNF8zWB56486mIvQBNo-dqUssspk8LMar7tIp7fP8cj5uhB4HiyhRe5G5z4588TyVZABgfMmT-p9QPM8Fub0wy7AA',
      clothType: 'pajama',
      colors: ['white'],
      category: 'festive',
      productLinks: [],
      source: 'seed',
      styleSuggestions: {
        vibe: 'Traditional ethnic bottom wear',
        pairWith: ['festive kurta', 'sherwani'],
        footwear: 'mojari or ethnic sandals',
        occasion: 'Festive celebrations, puja, and weddings',
        styleTip: 'Pair with a matching or contrasting kurta for a complete ethnic look.',
        searchQuery: 'white cotton churidar pajama men',
        trends: ['Ethnic Minimalism', 'Traditional Revival']
      }
    });
    console.log(`[Seed] Pajama 1 saved: ${pajama1._id}`);

    const pajama2 = await WardrobeItem.create({
      userId: 'demo-user',
      imageUrl: 'https://m.media-amazon.com/images/I/61Rex4i7Y7L.jpg',
      clothType: 'pajama',
      colors: ['cream'],
      category: 'festive',
      productLinks: [],
      source: 'seed',
      styleSuggestions: {
        vibe: 'Elegant ethnic bottom wear',
        pairWith: ['silk kurta', 'embroidered kurta'],
        footwear: 'kolhapuri chappals',
        occasion: 'Weddings, engagements, and festive dinners',
        styleTip: 'Go for a slim-fit version for a modern silhouette.',
        searchQuery: 'cream silk churidar pajama',
        trends: ['Indo-Western Fusion', 'Festive Chic']
      }
    });
    console.log(`[Seed] Pajama 2 saved: ${pajama2._id}`);

    // ── Step 3: Insert the Kurta with HARDCODED suggestions that mention "pajama" ──
    const kurta = await WardrobeItem.create({
      userId: 'demo-user',
      imageUrl: 'https://www.sudarshansaree.com/cdn/shop/products/ETW1539-1674.jpg?v=1679647570',
      clothType: 'kurta',
      colors: ['maroon', 'gold'],
      category: 'festive',
      productLinks: [],
      source: 'seed',
      styleSuggestions: {
        vibe: 'Royal festive elegance',
        pairWith: [
          'white churidar pajama for a classic festive look',
          'cream cotton pajama for a softer contrast'
        ],
        footwear: 'gold mojari or ethnic juttis',
        occasion: 'Weddings, Diwali celebrations, and festive gatherings',
        styleTip: 'Layer with an embroidered Nehru jacket for a regal finish.',
        searchQuery: 'maroon gold embroidered festive kurta men',
        trends: ['Royal Ethnic', 'Festive Maximalism']
      }
    });
    console.log(`[Seed] Kurta saved: ${kurta._id}`);

    // ── Summary ──
    console.log('\n========================================');
    console.log('SEED COMPLETE! Here are your IDs:');
    console.log('========================================');
    console.log(`Kurta ID:   ${kurta._id}`);
    console.log(`Pajama 1:   ${pajama1._id}`);
    console.log(`Pajama 2:   ${pajama2._id}`);
    console.log('========================================');
    console.log(`\nTest with: GET http://localhost:5000/api/wardrobe/complete/${kurta._id}`);
    console.log('Both pajamas should appear in "fromWardrobe"!\n');

    await mongoose.disconnect();
    console.log('[Seed] Done. MongoDB disconnected.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] ERROR:', error.message);
    process.exit(1);
  }
};

seedData();
