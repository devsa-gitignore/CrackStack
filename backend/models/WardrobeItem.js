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
    enum: ['tshirt', 'shirt', 'jacket', 'kurta', 'dress'],
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
  }
}, {
  timestamps: true
});

const WardrobeItem = mongoose.model('WardrobeItem', wardrobeItemSchema);
export default WardrobeItem;
