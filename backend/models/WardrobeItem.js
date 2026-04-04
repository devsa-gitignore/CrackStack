import mongoose from 'mongoose';

const wardrobeItemSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: "demo-user",
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  clothType: {
    type: String,
    enum: ['tshirt', 'shirt', 'jacket', 'kurta', 'dress', 'jeans', 'pants', 'pajama', 'hoodie', 'skirt'],
    required: true
  },
  colors: {
    type: [String],
    default: []
  },
  category: {
    type: String,
    enum: ['casual', 'college', 'wedding', 'festive'],
    required: true
  },
  productLinks: {
    type: [String],
    default: []
  },
  styleSuggestions: {
    vibe:        { type: String,   default: '' },
    pairWith:    { type: [String], default: [] },
    footwear:    { type: String,   default: '' },
    occasion:    { type: String,   default: '' },
    styleTip:    { type: String,   default: '' },
    searchQuery: { type: String,   default: '' },
    trends:      { type: [String], default: [] }
  },
  source: {
    type: String,
    enum: ['user', 'seed'],
    default: 'user'
  }
}, {
  timestamps: true
});

const WardrobeItem = mongoose.model('WardrobeItem', wardrobeItemSchema);
export default WardrobeItem;
