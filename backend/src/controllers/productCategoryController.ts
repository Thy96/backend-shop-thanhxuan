import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { slugify } from "../utils/slugify";
import ProductCategoryModel from '../models/productCategoryModel';
import ProductModel from '../models/productModel';

export const getAll = async (req: Request, res: Response) => {
  try {
    const categories = await ProductCategoryModel.find()
      .sort({ createdAt: -1 })
      .lean();;
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
    const category = await ProductCategoryModel.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Không tìm thấy category" });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server khi lấy category" });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Vui lòng nhập tên category" });
    }

    const cleanName = name.trim();
    const slug = slugify(cleanName);

    const existing = await ProductCategoryModel.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: "Category đã tồn tại" });
    }

    const category = await ProductCategoryModel.create({
      name: cleanName,
      slug,
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
    const { name } = req.body;

    const category = await ProductCategoryModel.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy category" });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Vui lòng nhập tên category" });
    }

    const cleanName = name.trim();
    const newSlug = slugify(cleanName);

    const existing = await ProductCategoryModel.findOne({
      slug: newSlug,
      _id: { $ne: req.params.id }
    });

    if (existing) {
      return res.status(400).json({ message: "Category đã tồn tại" });
    }

    category.name = cleanName;
    category.slug = newSlug;

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

    const category = await ProductCategoryModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy category" });
    }

    // Check xem có note nào đang dùng category này không
    const productCount = await ProductModel.countDocuments({ categoryId });
    if (productCount > 0) {
      return res.status(400).json({
        message: "Không thể xoá vì vẫn còn product đang sử dụng category này",
      });
    }

    await category.deleteOne();

    res.json({ message: "Xoá category thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server khi xoá category" });
  }
};