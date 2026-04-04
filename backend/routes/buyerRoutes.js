import express from 'express';
import {
  registerBuyer,
  loginBuyer,
  getAllProducts,
  requestProduct
} from '../controllers/buyerController.js';

const router = express.Router();

router.post('/buyer/register', registerBuyer);
router.post('/buyer/login', loginBuyer);
router.get('/buyer/products', getAllProducts);
router.post('/buyer/request', requestProduct);

export default router;
