import mongoose from 'mongoose';
import ProductModel from '../models/productModel';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/auth';

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
      matchStage.categoryId = new mongoose.Types.ObjectId(String(req.query.categoryId));
    }

    if (req.query.keyword) {
      matchStage.title = { $regex: String(req.query.keyword), $options: 'i' };
    }

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
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true
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
          categoryId: 1,
          category: {
            _id: "$category._id",
            name: "$category.name",
            slug: "$category.slug"
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
      matchStage.categoryId = new mongoose.Types.ObjectId(
        String(req.query.categoryId)
      );
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
          localField: "categoryId",
          foreignField: "_id",
          as: "category"
        }
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true
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
          category: {
            _id: "$category._id",
            name: "$category.name",
            slug: "$category.slug"
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
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true
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
          categoryId: 1,
          category: {
            _id: "$category._id",
            name: "$category.name",
            slug: "$category.slug"
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
    const product = await ProductModel.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy product' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy product' });
  }
}

// tạo sản phẩm mới
export const postProduct = async (req: AuthenticatedRequest, res: Response) => {
  console.log('📦 req.body:', req.body); // Debug
  const {
    title, content, price, sale, stock, categoryId, status } = req.body;
  const userId = req.user?.uid;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  let images: string[] = [];
  if (req.files && 'images' in req.files) {
    const imagesArray = req.files['images'] as Express.Multer.File[];
    images = imagesArray.map(file => `/uploads/${file.filename}`);
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

  // 3️⃣ Validate EditorJS blocks
  if (
    !parsedContent ||
    !Array.isArray(parsedContent.blocks) ||
    parsedContent.blocks.length === 0
  ) {
    return res.status(400).json({ message: "Vui lòng nhập nội dung" });
  }

  if (!categoryId) {
    return res.status(400).json({ message: "Vui lòng chọn category" });
  }

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return res.status(400).json({ message: "categoryId không hợp lệ (không phải ObjectId)" });
  }

  // ✅ Convert number
  const stockNumber = Number(stock) || 0;
  const priceNumber = Number(price) || 0;
  const saleNumber = Number(sale) || 0;

  try {
    const newProduct = new ProductModel({
      images,
      title: title.trim(),
      content: parsedContent,
      price: priceNumber,
      sale: saleNumber,
      stock: stockNumber,
      status: status ?? 'draft',
      categoryId,
      author: userId,
    });

    const savedProduct = await newProduct.save();

    return res.status(201).json(savedProduct);

  } catch (error) {
    return res.status(500).json({
      message: 'Không thể tạo product (lỗi server)',
    });
  }
}

// export const publishProduct = async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const product = await ProductModel.findById(req.params.id);
//     if (!product) return res.status(404).json({ message: 'Không tìm thấy' });

//     if (product.stock <= 0) {
//       return res.status(400).json({ message: 'Không thể publish khi hết hàng' });
//     }

//     product.status = "available";
//     if (!req.user?.uid) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//     product.updatedBy = req.user?.uid;

//     await product.save();

//     res.json({ message: "Publish thành công", data: product });
//   } catch {
//     res.status(500).json({ message: "Lỗi server" });
//   }
// };

// export const unpublishProduct = async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const product = await ProductModel.findByIdAndUpdate(
//       req.params.id,
//       { status: "draft", updatedBy: req.user?.uid },
//       { new: true }
//     );

//     if (!product) return res.status(404).json({ message: "Không tìm thấy" });

//     res.json({ message: "Đã chuyển về draft", data: product });
//   } catch {
//     res.status(500).json({ message: "Lỗi server" });
//   }
// };

// Cập nhật sản phẩm
export const updateProduct = async (req: AuthenticatedRequest, res: Response) => {
  // console.log('📦 req.body:', req.body);
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'ID không hợp lệ' });
  }
  const {
    title, content, price, sale, stock, categoryId, status } = req.body;
  const userId = req.user?.uid;

  let images: string[] = [];
  if (req.files && 'images' in req.files) {
    const imagesArray = req.files['images'] as Express.Multer.File[];
    images = imagesArray.map(file => `/uploads/${file.filename}`);
  }

  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Vui lòng nhập tiêu đề" });
  }

  // ✅ Convert number
  const stockNumber = Number(stock) || 0;
  const priceNumber = Number(price) || 0;
  const saleNumber = Number(sale) || 0;

  let parsedContent
  try {
    parsedContent =
      typeof content === "string" ? JSON.parse(content) : content;
  } catch (error) {
    return res.status(400).json({ message: 'Nội dung Editor không hợp lệ' });
  }

  try {
    const updateData: any = { title, content: parsedContent, price: priceNumber, sale: saleNumber, stock: stockNumber, categoryId, status, updatedBy: userId };
    if (images.length > 0) {
      updateData.images = images;
    }
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!updatedProduct) return res.status(404).json({ message: 'Không tìm thấy product để cập nhật' });
    res.json(updatedProduct);
  } catch (error) {
    return res.status(500).json({
      message: 'Lỗi server khi cập nhật'
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