import { Router } from "express";
import {
  getAll,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/noteCategoryController";
import { authenticate, authorize } from "../middlewares/auth";
import { upload } from "../lib/config/upload";

const router = Router();

// GET /api/categories
router.get("/", getAll);

// GET /api/categories/:id
router.get("/:id", getCategoryById);

// POST /api/categories
router.post("/", authenticate, authorize('admin'), upload.single("thumbnail"), createCategory);

// PUT /api/categories/:id
router.put("/:id", authenticate, authorize('admin'), upload.single("thumbnail"), updateCategory);

// DELETE /api/categories/:id
router.delete("/:id", deleteCategory);

export default router;
