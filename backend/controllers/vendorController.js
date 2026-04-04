import Vendor from '../models/Vendor.js';
import Product from '../models/Product.js';
import BuyRequest from '../models/BuyRequest.js';

export const registerVendor = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let vendor = await Vendor.findOne({ email });
    if (vendor) return res.status(400).json({ message: 'Vendor already exists' });

    vendor = new Vendor({ name, email, password });
    await vendor.save();
    res.status(201).json({ message: 'Vendor registered successfully', vendor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginVendor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const vendor = await Vendor.findOne({ email, password });
    if (!vendor) return res.status(400).json({ message: 'Invalid credentials' });
    
    res.status(200).json({ message: 'Login successful', vendor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadProduct = async (req, res) => {
  try {
    const { vendorId, productName, clothType, price, imageUrl, productLink } = req.body;
    const product = new Product({
      vendorId,
      productName,
      clothType,
      price,
      imageUrl,
      productLink
    });
    await product.save();
    res.status(201).json({ message: 'Product uploaded successfully', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getVendorProducts = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const products = await Product.find({ vendorId });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getVendorNotifications = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const requests = await BuyRequest.find({ vendorId })
      .populate('buyerId', 'name email')
      .populate('productId', 'productName imageUrl price productLink')
      .sort({ createdAt: -1 });
    
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
