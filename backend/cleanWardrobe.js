/**
 * CLEANUP SCRIPT — Removes redundant test pajamas
 * 
 * Run with:   node cleanWardrobe.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import WardrobeItem from './models/WardrobeItem.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crackstack';

const cleanup = async () => {
  try {
    console.log('[Cleanup] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);

    // ── Keep the "Seed" items, delete the "User-added" pajamas ──
    const result = await WardrobeItem.deleteMany({
      clothType: 'pajama',
      source: { $ne: 'seed' }  // $ne means "not equal to"
    });

    console.log(`[Cleanup] Deleted ${result.deletedCount} redundant pajamas.`);
    
    // Check if we also want to clean up other test items (optional)
    const result2 = await WardrobeItem.find({ source: { $ne: 'seed' } }).countDocuments();
    console.log(`[Cleanup] Remaining user-added items in total: ${result2}`);

    await mongoose.disconnect();
    console.log('[Cleanup] Done.');
    process.exit(0);
  } catch (error) {
    console.error('[Cleanup] ERROR:', error.message);
    process.exit(1);
  }
};

cleanup();
