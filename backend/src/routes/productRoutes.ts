import express from "express";
import { getAll, postProduct, getProductById, updateProduct, getTrashProducts, forceDeleteProduct, moveProductToTrash, restoreProduct, getPublishProducts, getTrashProductCount } from "../controllers/productController";
import { upload } from "../lib/config/upload";
import { authenticate, authorize } from '../middlewares/auth';

const router = express.Router();

router.get('/', getAll);
router.get('/publish', getPublishProducts);
/* ====== TRASH ====== */
router.get('/trash/count', getTrashProductCount);
router.get('/trash', getTrashProducts);

router.post('/', authenticate, authorize('admin', 'editor'), upload.fields([
  { name: 'images', maxCount: 3 }
]), postProduct);
router.put('/:id', authenticate, authorize('admin', 'editor'), upload.fields([
  { name: 'images', maxCount: 3 }
]), updateProduct);

/* ====== PUBLISH ====== */
// router.patch('/:id/publish', authenticate, authorize('admin', 'editor'), publishProduct);

// router.patch('/:id/unpublish', authenticate, authorize('admin', 'editor'), unpublishProduct);

/* ====== SOFT DELETE ====== */
router.patch('/:id/trash', authenticate, authorize('admin', 'editor'), moveProductToTrash
);

router.patch('/:id/restore', authenticate, authorize('admin', 'editor'), restoreProduct
);

/* ====== FORCE DELETE ====== */
router.delete('/:id/force', authenticate, authorize('admin', 'editor'), forceDeleteProduct);

router.get('/:id', getProductById);

export default router;
