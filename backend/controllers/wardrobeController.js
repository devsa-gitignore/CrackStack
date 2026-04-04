import WardrobeItem from '../models/WardrobeItem.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

// Helper function for categorization logic
const categorizeCloth = (clothType) => {
  switch (clothType.toLowerCase()) {
    case 'kurta':
      return 'festive';
    case 'jacket':
      return 'college';
    default:
      return 'casual';
  }
};

// Create a new wardrobe item
export const createWardrobeItem = async (req, res) => {
  try {
    const { imageUrl, clothType, colors, productLinks } = req.body;

    if (!imageUrl || !clothType) {
      return res.status(400).json({ error: "imageUrl and clothType are required" });
    }

    // If imageUrl is a base64 string, upload it. If it's already a secure URL from Cloudinary (e.g. from direct upload), we use it.
    let finalizedImageUrl = imageUrl;
    if (imageUrl.startsWith('data:image')) {
      finalizedImageUrl = await uploadToCloudinary(imageUrl);
    }

    const category = categorizeCloth(clothType);

    const newItem = new WardrobeItem({
      userId: "demo-user", // No authentication, use default
      imageUrl: finalizedImageUrl,
      clothType,
      colors: colors || [],
      category,
      productLinks: productLinks || []
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating wardrobe item:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// Get all wardrobe items (sorted by newest)
export const getAllWardrobeItems = async (req, res) => {
  try {
    const items = await WardrobeItem.find({ userId: "demo-user" }).sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching wardrobe items:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get wardrobe items by category
export const getWardrobeByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const items = await WardrobeItem.find({ userId: "demo-user", category }).sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching items by category:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a wardrobe item
export const deleteWardrobeItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await WardrobeItem.findByIdAndDelete(id);
    if (!deletedItem) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update wardrobe item category manually (optional)
export const updateWardrobeCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category } = req.body;
    
    if (!['casual', 'college', 'wedding', 'festive'].includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const updatedItem = await WardrobeItem.findByIdAndUpdate(
      id, 
      { category }, 
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.status(200).json(updatedItem);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
