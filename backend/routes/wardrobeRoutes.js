import express from 'express';
import {
  createWardrobeItem,
  getAllWardrobeItems,
  getWardrobeByCategory,
  deleteWardrobeItem,
  updateWardrobeCategory
} from '../controllers/wardrobeController.js';

const router = express.Router();

/**
 * @route   POST /api/wardrobe
 * @desc    Save AR try-on outfits (with Cloudinary upload and auto-categorization)
 */
router.post('/wardrobe', createWardrobeItem);

/**
 * @route   GET /api/wardrobe
 * @desc    Retrieve all wardrobe items (sorted by newest)
 */
router.get('/wardrobe', getAllWardrobeItems);

/**
 * @route   GET /api/wardrobe/category/:category
 * @desc    Retrieve wardrobe items by category filter
 */
router.get('/wardrobe/category/:category', getWardrobeByCategory);

/**
 * @route   DELETE /api/wardrobe/:id
 * @desc    Delete a wardrobe item from DB
 */
router.delete('/wardrobe/:id', deleteWardrobeItem);

/**
 * @route   PATCH /api/wardrobe/:id
 * @desc    Update category manually
 */
router.patch('/wardrobe/:id', updateWardrobeCategory);

export default router;
