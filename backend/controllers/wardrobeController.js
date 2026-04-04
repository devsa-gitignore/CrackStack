import WardrobeItem from '../models/WardrobeItem.js';
import Product from '../models/Product.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import { getAISuggestions } from '../utils/groqSuggest.js';
import mongoose from 'mongoose';

// Helper: map cloth type to occasion category
const categorizeCloth = (clothType) => {
  switch (clothType.toLowerCase()) {
    case 'kurta':   return 'festive';
    case 'jacket':  return 'college';
    default:        return 'casual';
  }
};

// ─── SYNONYM MAP ─────────────────────────────────────────────────────────────
// Maps each clothType to ALL words Groq might use to refer to it.
// This is the core of the smart matching logic.
const CLOTH_SYNONYMS = {
  tshirt:  ['tshirt', 't-shirt', 'tee', 'crew neck', 'graphic tee', 'polo'],
  shirt:   ['shirt', 'button-down', 'button down', 'oxford shirt', 'linen shirt', 'formal shirt', 'casual shirt'],
  jacket:  ['jacket', 'blazer', 'coat', 'layer', 'bomber', 'denim jacket', 'leather jacket', 'outerwear'],
  kurta:   ['kurta', 'kurti', 'kurtha', 'ethnic top', 'indian top', 'sherwani'],
  dress:   ['dress', 'gown', 'frock', 'maxi', 'midi', 'sundress', 'bodycon'],
  jeans:   ['jeans', 'denim', 'denims', 'denim pants', 'blue jeans', 'skinny jeans', 'straight jeans'],
  pants:   ['pants', 'trousers', 'chinos', 'slacks', 'formal pants', 'khaki', 'linen pants', 'palazzos'],
  pajama:  ['pajama', 'pyjama', 'churidar', 'churidaar', 'salwar', 'dhoti', 'pyjamas', 'bottom', 'ethnic bottom', 'traditional bottom', 'white bottom'],
  hoodie:  ['hoodie', 'sweatshirt', 'pullover', 'hooded sweatshirt', 'fleece'],
  skirt:   ['skirt', 'mini skirt', 'maxi skirt', 'pleated skirt', 'flared skirt']
};

// Helper: get all synonyms for a given clothType
const getSynonyms = (clothType) => CLOTH_SYNONYMS[clothType.toLowerCase()] || [clothType.toLowerCase()];

// Helper: check if a suggestion text matches an item using its synonym set
// Skips the base item's own type so an item doesn't match itself
// Only matches by clothType synonyms — NOT by color (colors cause false positives)
const suggestionMatchesItem = (suggestion, item, baseClothType) => {
  if (!suggestion) return false;
  if (item.clothType.toLowerCase() === baseClothType.toLowerCase()) return false;

  const s = suggestion.toLowerCase();
  const synonyms = getSynonyms(item.clothType);

  const matched = synonyms.some(syn => s.includes(syn));
  if (matched) {
    console.log(`[Match] "${suggestion}" → clothType "${item.clothType}" via synonym`);
  }
  return matched;
};



/**
 * Background job: calls Groq after the item is saved,
 * then updates it so the save() is never blocked by the AI call.
 */
const enrichWithAI = async (itemId, imageUrl, clothType, colors) => {
  try {
    console.log(`[AI Enrichment] Starting for ${clothType} (${itemId})...`);
    const suggestions = await getAISuggestions(imageUrl, clothType, colors);
    await WardrobeItem.findByIdAndUpdate(itemId, { styleSuggestions: suggestions });
    console.log(`[AI Enrichment] Done for ${itemId} — vibe: "${suggestions.vibe}"`);
  } catch (err) {
    console.warn(`[AI Enrichment] Failed for ${itemId}:`, err.message);
  }
};

// ─── CREATE ──────────────────────────────────────────────────────────────────
export const createWardrobeItem = async (req, res) => {
  try {
    const { imageUrl, images, clothType, colors, productLinks } = req.body;

    if (!imageUrl && (!images || images.length === 0)) {
      return res.status(400).json({ error: 'imageUrl or images array is required' });
    }

    // Upload base64 image to Cloudinary if needed
    let finalizedImageUrl = imageUrl;
    if (imageUrl && imageUrl.startsWith('data:image')) {
      finalizedImageUrl = await uploadToCloudinary(imageUrl);
    }
    
    // Upload multiple images if provided in combinations
    let finalizedImages = [];
    if (images && images.length > 0) {
      for (const img of images) {
        if (img.startsWith('data:image')) {
          finalizedImages.push(await uploadToCloudinary(img));
        } else {
          finalizedImages.push(img);
        }
      }
    }

    const category = categorizeCloth(clothType);

    // ✅ Save immediately — no AI blocking the DB write
    const newItem = new WardrobeItem({
      userId: 'demo-user',
      imageUrl: finalizedImageUrl,
      images: finalizedImages,
      clothType,
      colors: colors || [],
      category,
      productLinks: productLinks || [],
      styleSuggestions: {}   // will be filled in the background
    });

    await newItem.save();

    // ✅ Return the response RIGHT AWAY to the client
    res.status(201).json({
      ...newItem.toObject(),
      _aiStatus: 'AI suggestions are being generated in the background. Call /complete in a few seconds.'
    });

    // 🔄 Run AI in background WITHOUT awaiting (non-blocking)
    const primaryImageForAI = finalizedImageUrl || (finalizedImages.length > 0 ? finalizedImages[0] : null);
    if (primaryImageForAI) {
      enrichWithAI(newItem._id, primaryImageForAI, clothType, colors || []);
    }

  } catch (error) {
    console.error('Error creating wardrobe item:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// ─── GET ALL ─────────────────────────────────────────────────────────────────
export const getAllWardrobeItems = async (req, res) => {
  try {
    const items = await WardrobeItem.find({ userId: 'demo-user' }).sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching wardrobe items:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── GET BY CATEGORY ─────────────────────────────────────────────────────────
export const getWardrobeByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const items = await WardrobeItem
      .find({ userId: 'demo-user', category })
      .sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching items by category:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── DELETE ──────────────────────────────────────────────────────────────────
export const deleteWardrobeItem = async (req, res) => {
  try {
    const deleted = await WardrobeItem.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Item not found' });
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── UPDATE CATEGORY ─────────────────────────────────────────────────────────
export const updateWardrobeCategory = async (req, res) => {
  try {
    const { category } = req.body;
    if (!['casual', 'college', 'wedding', 'festive'].includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }
    const updated = await WardrobeItem.findByIdAndUpdate(req.params.id, { category }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Item not found' });
    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── COMPLETE OUTFIT ─────────────────────────────────────────────────────────
export const completeOutfit = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid item ID format' });
    }

    const baseItem = await WardrobeItem.findById(id);
    if (!baseItem) return res.status(404).json({ error: 'Wardrobe item not found' });

    const { styleSuggestions, clothType: baseType } = baseItem;

    // AI hasn't finished yet — tell the client to retry
    if (!styleSuggestions || !styleSuggestions.pairWith || styleSuggestions.pairWith.length === 0) {
      return res.status(200).json({
        baseItem,
        fromWardrobe: [],
        aiSuggestions: [],
        footwear: styleSuggestions?.footwear || null,
        message: 'AI suggestions are still being generated. Wait 5 seconds and try again.'
      });
    }

    // Exclude the base item from the matching pool
    const allItems = await WardrobeItem.find({ userId: 'demo-user' });
    const pool = allItems.filter(item => item._id.toString() !== baseItem._id.toString());

    // Fetch vendor clothes (Product model) to see what can be bought
    const vendorProducts = await Product.find({});

    const fromWardrobe = [];
    const fromVendors = [];
    const aiSuggestions = [];

    // Only match against pairWith (NOT styleTip — it causes false positives)
    for (const suggestion of styleSuggestions.pairWith) {
      if (!suggestion) continue;

      // Find ALL matching items for this suggestion in both models
      const matches = pool.filter(item => suggestionMatchesItem(suggestion, item, baseType));
      const vMatches = vendorProducts.filter(item => suggestionMatchesItem(suggestion, item, baseType));

      let foundMatch = false;

      if (matches.length > 0) {
        foundMatch = true;
        for (const match of matches) {
          // Convert to object so we can add virtual fields for the UI
          const matchObj = match.toObject();
          
          // 🔍 ADD TRANSPARENCY FIELDS
          matchObj._matchReason = `Matched via: "${suggestion}"`;
          matchObj._isHardcodedDemo = match.source === 'seed';

          const alreadyAdded = fromWardrobe.some(m => m._id.toString() === matchObj._id.toString());
          if (!alreadyAdded) {
            fromWardrobe.push(matchObj);
          }
        }
      }
      
      if (vMatches.length > 0) {
        foundMatch = true;
        for (const match of vMatches) {
          const matchObj = match.toObject();
          matchObj._matchReason = `Matched vendor product via: "${suggestion}"`;
          
          const alreadyAdded = fromVendors.some(m => m._id.toString() === matchObj._id.toString());
          if (!alreadyAdded) {
            fromVendors.push(matchObj);
          }
        }
      }

      if (!foundMatch) {
         aiSuggestions.push(suggestion);
      }
    }

    // 🔝 SORT & LIMIT: Prioritize seeded items and cap at 3 total
    fromWardrobe.sort((a, b) => {
      if (a.source === 'seed' && b.source !== 'seed') return -1;
      if (a.source !== 'seed' && b.source === 'seed') return 1;
      return 0;
    });

    const limitedWardrobe = fromWardrobe.slice(0, 3);
    const limitedVendors = fromVendors.slice(0, 5); // top 5 vendor recommendations

    res.status(200).json({
      baseItem,
      _matchingInfo: {
        totalMatchesFound: fromWardrobe.length + fromVendors.length,
        showingTop: limitedWardrobe.length,
        status: (limitedWardrobe.length > 0 || fromVendors.length > 0) ? "Top matches identified" : "No matches"
      },
      fromWardrobe: limitedWardrobe,
      fromVendors: limitedVendors,
      aiSuggestions,
      footwear: styleSuggestions.footwear || null
    });

  } catch (error) {
    console.error('Error completing outfit:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
