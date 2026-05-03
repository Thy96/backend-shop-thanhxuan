import mongoose from 'mongoose';
import ProductModel from '../models/productModel';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import { uploadToCloudinary } from '../lib/config/upload';

// Lấy tất cả sản phẩm
export const getAll = async (req: Request, res: Response) => {
  try {
    const limit = 10;

    const rawPage = Number(req.query.page) || 1;
    const page = Math.max(rawPage, 1);

    const matchStage: any = {
      isDeleted: false
    };

    if (
      req.query.status &&
      ["draft", "available"].includes(String(req.query.status))
    ) {
      matchStage.status = String(req.query.status);
    }

    if (req.query.categoryId && mongoose.Types.ObjectId.isValid(String(req.query.categoryId))) {
      matchStage.categoryIds = { $in: [new mongoose.Types.ObjectId(String(req.query.categoryId))] };
    }

    if (req.query.keyword) {
      matchStage.title = { $regex: String(req.query.keyword), $options: 'i' };
    }

    const allowedSortFields = ['price', 'createdAt'];
    const sortBy = allowedSortFields.includes(String(req.query.sortBy)) ? String(req.query.sortBy) : '';
    const sortOrder: 1 | -1 = req.query.sortOrder === 'asc' ? 1 : -1;

    const total = await ProductModel.countDocuments(matchStage);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * limit;

    const sortStage: Record<string, 1 | -1> = sortBy
      ? { [sortBy]: sortOrder }
      : { isInStock: -1, createdAt: -1 };

    const products = await ProductModel.aggregate([
      { $match: matchStage },
      {
        $addFields: {
          isInStock: { $gt: ['$stock', 0] },
          thumbnail: { $arrayElemAt: ["$images", 0] }
        }
      },
      { $sort: sortStage },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "productcategories",
          localField: 'categoryIds',
          foreignField: '_id',
          as: 'categories'
        }
      },
      {
        $lookup: {
          from: "users",
          localField: 'author',
          foreignField: '_id',
          as: 'author'
        }
      },
      {
        $unwind: {
          path: "$author",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "users",
          localField: 'updatedBy',
          foreignField: '_id',
          as: 'updatedBy'
        }
      },
      {
        $unwind: {
          path: "$updatedBy",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: { // không lấy tất cả, chỉ lấy những field cần lấy
          _id: 1,
          title: 1,
          price: 1,
          stock: 1,
          sale: 1,
          points: 1,
          status: 1,
          author: {
            _id: "$author._id",
            fullName: "$author.fullName",
            email: "$author.email"
          },
          updatedBy: {
            _id: "$updatedBy._id",
            fullName: "$updatedBy.fullName",
            email: "$updatedBy.email"
          },
          isInStock: 1,
          categoryIds: 1,
          categories: {
            $map: {
              input: "$categories",
              as: "c",
              in: { _id: "$$c._id", name: "$$c.name", slug: "$$c.slug" }
            }
          },
          deletedAt: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    ])

    res.json({
      data: products,
      pagination: {
        page: safePage,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy product' });
  }
}

export const getPublishProducts = async (req: Request, res: Response) => {
  try {
    const limit = 10;

    const rawPage = Number(req.query.page) || 1;
    const page = Math.max(rawPage, 1);

    const matchStage: any = {
      isDeleted: false,
      status: "available",      // 🔥 chỉ publish
      stock: { $gt: 0 }         // 🔥 chỉ còn hàng
    };

    // filter category
    if (
      req.query.categoryId &&
      mongoose.Types.ObjectId.isValid(String(req.query.categoryId))
    ) {
      matchStage.categoryIds = {
        $in: [new mongoose.Types.ObjectId(
          String(req.query.categoryId)
        )]
      };
    }

    // search keyword
    if (req.query.keyword) {
      matchStage.title = {
        $regex: String(req.query.keyword),
        $options: "i"
      };
    }

    const total = await ProductModel.countDocuments(matchStage);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * limit;

    const products = await ProductModel.aggregate([
      { $match: matchStage },

      {
        $addFields: {
          isInStock: { $gt: ["$stock", 0] },
          thumbnail: { $arrayElemAt: ["$images", 0] }
        }
      },

      {
        $sort: {
          isInStock: -1,
          createdAt: -1
        }
      },

      { $skip: skip },
      { $limit: limit },

      // lookup category
      {
        $lookup: {
          from: "productcategories",
          localField: "categoryIds",
          foreignField: "_id",
          as: "categories"
        }
      },

      // PUBLIC API → KHÔNG lookup author / updatedBy (nhẹ hơn)
      {
        $project: {
          _id: 1,
          title: 1,
          price: 1,
          sale: 1,
          stock: 1,
          thumbnail: 1,
          isInStock: 1,
          categories: {
            $map: {
              input: "$categories",
              as: "c",
              in: { _id: "$$c._id", name: "$$c.name", slug: "$$c.slug" }
            }
          },
          createdAt: 1
        }
      }
    ]);

    res.json({
      data: products,
      pagination: {
        page: safePage,
        limit,
        total,
        totalPages
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi lấy product publish" });
  }
};

// Lấy tất cả sản phẩm trong thùng rác
export const getTrashProducts = async (req: Request, res: Response) => {
  try {
    const limit = 10;

    const rawPage = Number(req.query.page) || 1;
    const page = Math.max(rawPage, 1);

    const matchStage: any = {
      isDeleted: true
    };

    const total = await ProductModel.countDocuments(matchStage);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * limit;

    const products = await ProductModel.aggregate([
      { $match: matchStage },
      {
        $addFields: {
          isInStock: { $gt: ['$stock', 0] },
          thumbnail: { $arrayElemAt: ["$images", 0] }
        }
      },
      {
        $sort: {
          isInStock: -1,
          createdAt: -1
        }
      },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "productcategories",
          localField: 'categoryIds',
          foreignField: '_id',
          as: 'categories'
        }
      },
      {
        $lookup: {
          from: "users",
          localField: 'author',
          foreignField: '_id',
          as: 'author'
        }
      },
      {
        $unwind: {
          path: "$author",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "users",
          localField: 'updatedBy',
          foreignField: '_id',
          as: 'updatedBy'
        }
      },
      {
        $unwind: {
          path: "$updatedBy",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: { // không lấy tất cả, chỉ lấy những field cần lấy
          _id: 1,
          title: 1,
          price: 1,
          stock: 1,
          author: {
            _id: "$author._id",
            fullName: "$author.fullName",
            email: "$author.email"
          },
          updatedBy: {
            _id: "$updatedBy._id",
            fullName: "$updatedBy.fullName",
            email: "$updatedBy.email"
          },
          isInStock: 1,
          categoryIds: 1,
          categories: {
            $map: {
              input: "$categories",
              as: "c",
              in: { _id: "$$c._id", name: "$$c.name", slug: "$$c.slug" }
            }
          },
          deletedAt: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    ])

    res.json({
      data: products,
      pagination: {
        page: safePage,
        limit,
        total,
        totalPages
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy thùng rác" });
  }
};

// lấy sản phẩm theo ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }
    const product = await ProductModel.findById(req.params.id)
      .populate('categoryIds', '_id name slug')
      .populate('author', '_id fullName email')
      .populate('updatedBy', '_id fullName email')
      .lean();
    if (!product) return res.status(404).json({ message: 'Không tìm thấy product' });

    // Đổi tên categoryIds → categories để frontend dùng nhất quán
    const { categoryIds, ...rest } = product as any;
    res.json({ ...rest, categories: categoryIds ?? [] });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy product' });
  }
}

// tạo sản phẩm mới
export const postProduct = async (req: AuthenticatedRequest, res: Response) => {
  const {
    title, content, price, sale, stock, points, categoryIds, status } = req.body;
  const userId = req.user?.uid;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Vui lòng nhập tiêu đề" });
  }

  let parsedContent;
  try {
    parsedContent =
      typeof content === "string" ? JSON.parse(content) : content;
  } catch (err) {
    return res.status(400).json({ message: "Nội dung không hợp lệ (JSON)" });
  }

  if (
    !parsedContent ||
    !Array.isArray(parsedContent.blocks) ||
    parsedContent.blocks.length === 0
  ) {
    return res.status(400).json({ message: "Vui lòng nhập nội dung" });
  }

  if (!categoryIds) {
    return res.status(400).json({ message: "Vui lòng chọn category" });
  }

  const rawIds = Array.isArray(categoryIds) ? categoryIds : [categoryIds];
  const parsedCategoryIds = rawIds.filter((id: string) => mongoose.Types.ObjectId.isValid(id));

  if (parsedCategoryIds.length === 0) {
    return res.status(400).json({ message: "categoryIds không hợp lệ" });
  }

  const stockNumber = Number(stock) || 0;
  const priceNumber = Number(price) || 0;
  const saleNumber = Number(sale) || 0;
  const pointsNumber = Number(points) || 0;

  try {
    // Upload ảnh lên Cloudinary
    let images: string[] = [];
    console.log('[postProduct] req.files keys:', req.files ? Object.keys(req.files) : 'undefined');
    if (req.files && 'images' in req.files) {
      const imagesArray = req.files['images'] as Express.Multer.File[];
      console.log('[postProduct] images count:', imagesArray.length, '| buffers:', imagesArray.map(f => f.buffer?.length ?? 'no buffer'));
      images = await Promise.all(imagesArray.map(file => uploadToCloudinary(file.buffer)));
      console.log('[postProduct] cloudinary urls:', images);
    }

    const newProduct = new ProductModel({
      images,
      title: title.trim(),
      content: parsedContent,
      price: priceNumber,
      sale: saleNumber,
      stock: stockNumber,
      points: pointsNumber,
      status: status ?? 'draft',
      categoryIds: parsedCategoryIds,
      author: userId,
    });

    const savedProduct = await newProduct.save();

    return res.status(201).json(savedProduct);

  } catch (error: any) {
    console.error('[postProduct] error:', error);
    return res.status(500).json({
      message: error?.message || 'Không thể tạo product (lỗi server)',
    });
  }
}

// Cập nhật sản phẩm
export const updateProduct = async (req: AuthenticatedRequest, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'ID không hợp lệ' });
  }
  const {
    title, content, price, sale, stock, points, categoryIds, status, existingImages } = req.body;
  const userId = req.user?.uid;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Vui lòng nhập tiêu đề" });
  }

  const stockNumber = Number(stock) || 0;
  const priceNumber = Number(price) || 0;
  const saleNumber = Number(sale) || 0;
  const pointsNumber = Number(points) || 0;

  let parsedContent;
  try {
    parsedContent =
      typeof content === "string" ? JSON.parse(content) : content;
  } catch (error) {
    return res.status(400).json({ message: 'Nội dung Editor không hợp lệ' });
  }

  try {
    // Ảnh cũ giữ lại
    const keptImages: string[] = existingImages
      ? Array.isArray(existingImages) ? existingImages : [existingImages]
      : [];

    // Ảnh mới upload lên Cloudinary
    let newImages: string[] = [];
    if (req.files && 'images' in req.files) {
      const imagesArray = req.files['images'] as Express.Multer.File[];
      newImages = await Promise.all(imagesArray.map(file => uploadToCloudinary(file.buffer)));
    }

    const images = [...keptImages, ...newImages];

    const rawUpdateIds = Array.isArray(categoryIds) ? categoryIds : (categoryIds ? [categoryIds] : []);
    const parsedUpdateIds = rawUpdateIds.filter((id: string) => mongoose.Types.ObjectId.isValid(id));
    const updateData: any = { title, content: parsedContent, price: priceNumber, sale: saleNumber, stock: stockNumber, points: pointsNumber, categoryIds: parsedUpdateIds, status, updatedBy: userId, images };
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!updatedProduct) return res.status(404).json({ message: 'Không tìm thấy product để cập nhật' });
    res.json(updatedProduct);
  } catch (error: any) {
    console.error('[updateProduct] error:', error);
    return res.status(500).json({
      message: error?.message || 'Lỗi server khi cập nhật'
    });
  }
}

// Di chuyển sản phẩm vào thùng rác
export const moveProductToTrash = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }
    const product = await ProductModel.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedAt: new Date()
      },
      {
        new: true
      }
    );
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

    res.json({
      message: 'Đã chuyển sản phẩm vào thùng rác',
      data: product
    });
  } catch (error) {
    res.status(500).json({ message: 'Không thể chuyển vào thùng rác' });
  }
}

// khôi phục sản phẩm trong thùng rác
export const restoreProduct = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }
    const product = await ProductModel.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: false,
        deletedAt: null,
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    res.json({
      message: 'Khôi phục sản phẩm thành công',
      data: product,
    });
  } catch (error) {
    res.status(500).json({ message: 'Không thể khôi phục sản phẩm' });
  }
};

// Đếm số sản phẩm trong thùng rác
export const getTrashProductCount = async (req: Request, res: Response) => {
  try {
    const total = await ProductModel.countDocuments({ isDeleted: true });
    res.json({ total });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Xóa vĩnh viễn sản phẩm
export const forceDeleteProduct = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }
    const product = await ProductModel.findOneAndDelete({
      _id: req.params.id,
      isDeleted: true,
    });

    if (!product) {
      return res.status(404).json({
        message: 'Sản phẩm không tồn tại hoặc chưa nằm trong thùng rác',
      });
    }

    res.json({ message: 'Đã xóa vĩnh viễn sản phẩm' });
  } catch (error) {
    res.status(500).json({ message: 'Không thể xóa vĩnh viễn' });
  }
};