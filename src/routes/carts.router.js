import { Router } from 'express';
import {
    postCart, getCartProducts, postCartProduct,
    deleteCartProduct, putCart, putCartProductQty, deleteAllCartProducts
} from '../controllers/carts.controller.js';
import { requireAuth, requireRole } from '../middlewares/authz.js';
import { purchase } from '../controllers/carts.controller.js';
import { ensureDb } from '../db/mongo.js';

const router = Router();
router.use(ensureDb);

router.post('/', requireAuth, requireRole('user'), postCart);
router.get('/:cid', requireAuth, getCartProducts);
router.post('/:cid/product/:pid', requireAuth, requireRole('user'), postCartProduct);

router.delete('/:cid/products/:pid', requireAuth, requireRole('user'), deleteCartProduct);
router.put('/:cid', requireAuth, requireRole('user'), putCart);
router.put('/:cid/products/:pid', requireAuth, requireRole('user'), putCartProductQty);
router.delete('/:cid', requireAuth, requireRole('user'), deleteAllCartProducts);
router.post('/:cid/purchase', requireAuth, requireRole('user'), purchase);


export default router;
