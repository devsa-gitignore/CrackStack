import Buyer from '../models/Buyer.js';
import Product from '../models/Product.js';
import BuyRequest from '../models/BuyRequest.js';
import Vendor from '../models/Vendor.js';
import { sendNotificationEmail } from '../utils/mailer.js';

export const registerBuyer = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let buyer = await Buyer.findOne({ email });
    if (buyer) return res.status(400).json({ message: 'Buyer already exists' });

    buyer = new Buyer({ name, email, password });
    await buyer.save();
    res.status(201).json({ message: 'Buyer registered successfully', buyer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginBuyer = async (req, res) => {
  try {
    const { email, password } = req.body;
    const buyer = await Buyer.findOne({ email, password });
    if (!buyer) return res.status(400).json({ message: 'Invalid credentials' });
    
    res.status(200).json({ message: 'Login successful', buyer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('vendorId', 'name email');
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const requestProduct = async (req, res) => {
  try {
    const { buyerId, productId } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const vendor = await Vendor.findById(product.vendorId);
    const buyer = await Buyer.findById(buyerId);

    const buyRequest = new BuyRequest({
      vendorId: product.vendorId,
      buyerId,
      productId
    });
    
    await buyRequest.save();

    if (vendor && buyer) {
      await sendNotificationEmail(
        vendor.email, 
        vendor.name, 
        buyer.name, 
        buyer.email, 
        product.productName
      );
    }

    res.status(201).json({ message: 'Buy request sent successfully to the vendor', buyRequest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
