import express from 'express';
import {
  registerVendor,
  loginVendor,
  uploadProduct,
  getVendorProducts,
  getVendorNotifications
} from '../controllers/vendorController.js';

const router = express.Router();

router.post('/vendor/register', registerVendor);
router.post('/vendor/login', loginVendor);
router.post('/vendor/product', uploadProduct);
router.get('/vendor/:vendorId/products', getVendorProducts);
router.get('/vendor/:vendorId/notifications', getVendorNotifications);

export default router;
