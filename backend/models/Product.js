import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  vendorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Vendor', 
    required: true 
  },
  productName: { type: String, required: true },
  clothType: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  productLink: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
