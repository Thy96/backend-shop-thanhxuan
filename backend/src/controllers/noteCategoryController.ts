import { Request, Response } from 'express';
import mongoose from "mongoose";
import { slugify } from "../utils/slugify";
import NoteCategoryModel from '../models/noteCategoryModel';
import NoteModel from '../models/noteModel';

// Kiểm tra potentialDescendantId có phải là con cháu của ancestorId không
async function isDescendantOf(potentialDescendantId: string, ancestorId: string): Promise<boolean> {
  const visited = new Set<string>();
  let current = await NoteCategoryModel.findById(potentialDescendantId).lean();
  while (current) {
    if (!current.parentId) return false;
    const parentStr = current.parentId.toString();
    if (parentStr === ancestorId) return true;
    if (visited.has(parentStr)) return false;
    visited.add(parentStr);
    current = await NoteCategoryModel.findById(current.parentId).lean();
  }
  return false;
}

export const getAll = async (req: Request, res: Response) => {
  try {
    const categories = await NoteCategoryModel.find()
      .populate('parentId', 'name slug')
      .sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server khi lấy category" });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const category = await NoteCategoryModel.findById(req.params.id)
      .populate('parentId', 'name slug');
    if (!category)
      return res.status(404).json({ message: "Không tìm thấy category" });

    res.json(category);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server khi lấy category" });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, parentId } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Vui lòng nhập tên category" });
    }

    const cleanName = name.trim();
    const slug = slugify(cleanName);

    const existing = await NoteCategoryModel.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: "Category đã tồn tại" });
    }

    let resolvedParentId: mongoose.Types.ObjectId | null = null;
    if (parentId && parentId.trim()) {
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        return res.status(400).json({ message: "parentId không hợp lệ" });
      }
      const parent = await NoteCategoryModel.findById(parentId);
      if (!parent) {
        return res.status(400).json({ message: "Danh mục cha không tồn tại" });
      }
      resolvedParentId = parent._id as mongoose.Types.ObjectId;
    }

    const category = await NoteCategoryModel.create({
      name: cleanName,
      slug,
      parentId: resolvedParentId,
    });

    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server khi tạo category" });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const { name, parentId } = req.body;

    const category = await NoteCategoryModel.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy category" });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Vui lòng nhập tên category" });
    }

    const cleanName = name.trim();
    const newSlug = slugify(cleanName);

    const existing = await NoteCategoryModel.findOne({
      slug: newSlug,
      _id: { $ne: req.params.id }
    });

    if (existing) {
      return res.status(400).json({ message: "Tên category đã tồn tại" });
    }

    // Xử lý parentId
    let resolvedParentId: mongoose.Types.ObjectId | null = category.parentId ?? null;
    if (parentId !== undefined) {
      if (!parentId || !parentId.trim()) {
        resolvedParentId = null;
      } else {
        if (!mongoose.Types.ObjectId.isValid(parentId)) {
          return res.status(400).json({ message: "parentId không hợp lệ" });
        }
        if (parentId === req.params.id) {
          return res.status(400).json({ message: "Danh mục không thể là cha của chính nó" });
        }
        const descendant = await isDescendantOf(parentId, req.params.id);
        if (descendant) {
          return res.status(400).json({ message: "Không thể đặt danh mục con làm danh mục cha" });
        }
        const parent = await NoteCategoryModel.findById(parentId);
        if (!parent) {
          return res.status(400).json({ message: "Danh mục cha không tồn tại" });
        }
        resolvedParentId = parent._id as mongoose.Types.ObjectId;
      }
    }

    category.name = cleanName;
    category.slug = newSlug;
    category.parentId = resolvedParentId;

    await category.save();

    res.json(category);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server khi cập nhật category" });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const categoryId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const category = await NoteCategoryModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy category" });
    }

    const childCount = await NoteCategoryModel.countDocuments({ parentId: categoryId });
    if (childCount > 0) {
      return res.status(400).json({
        message: "Không thể xoá vì vẫn còn danh mục con bên trong",
      });
    }

    const noteCount = await NoteModel.countDocuments({ categoryId });
    if (noteCount > 0) {
      return res.status(400).json({
        message: "Không thể xoá vì vẫn còn note đang sử dụng category này",
      });
    }

    await category.deleteOne();

    res.json({ message: "Xoá category thành công" });

  } catch (err) {
    res.status(500).json({ message: "Lỗi server khi xoá category" });
  }
};
