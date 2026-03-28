import mongoose from "mongoose";
import NoteModel from "../models/noteModel";
import { Request, Response } from 'express';
import { AuthenticatedRequest } from "../types/auth";
import slugify from "slugify";

// Lấy tất cả bài viết
export const getAll = async (req: Request, res: Response) => {
  try {
    const limit = 10;

    const page = Math.max(parseInt(String(req.query.page)) || 1, 1);

    const matchStage: any = {
      isDeleted: false
    };

    if (req.query.categoryId && mongoose.Types.ObjectId.isValid(String(req.query.categoryId))) {
      matchStage.categoryId = new mongoose.Types.ObjectId(String(req.query.categoryId));
    }

    if (req.query.keyword) {
      matchStage.title = { $regex: String(req.query.keyword), $options: 'i' };
    }

    const totalResult = await NoteModel.aggregate([
      { $match: matchStage },
      { $count: "total" }
    ]);
    const total = totalResult[0]?.total || 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * limit;

    const notes = await NoteModel.aggregate([
      { $match: matchStage },
      {
        $addFields: {
          author: {
            $convert: {
              input: "$author",
              to: "objectId",
              onError: null,
              onNull: null
            }
          },
          updatedBy: {
            $convert: {
              input: "$updatedBy",
              to: "objectId",
              onError: null,
              onNull: null
            }
          },
          categoryId: {
            $convert: {
              input: "$categoryId",
              to: "objectId",
              onError: null,
              onNull: null
            }
          }
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "notecategories",
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
          thumbnail: 1,
          title: 1,
          slug: 1,
          content: 1,
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
    ]);

    res.json({
      data: notes,
      pagination: {
        page: safePage,
        limit,
        total,
        totalPages
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi lấy bài viết" });
  }
};

// Lấy tất cả bài viết trong thùng rác
export const getTrashNotes = async (req: Request, res: Response) => {
  try {
    const limit = 10;

    const page = Math.max(parseInt(String(req.query.page)) || 1, 1);

    const matchStage: any = {
      isDeleted: true
    };

    if (req.query.categoryId && mongoose.Types.ObjectId.isValid(String(req.query.categoryId))) {
      matchStage.categoryId = new mongoose.Types.ObjectId(String(req.query.categoryId));
    }

    if (req.query.keyword) {
      matchStage.title = { $regex: String(req.query.keyword), $options: 'i' };
    }

    const totalResult = await NoteModel.aggregate([
      { $match: matchStage },
      { $count: "total" }
    ]);
    const total = totalResult[0]?.total || 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * limit;

    const notes = await NoteModel.aggregate([
      { $match: matchStage },
      {
        $addFields: {
          author: {
            $convert: {
              input: "$author",
              to: "objectId",
              onError: null,
              onNull: null
            }
          },
          updatedBy: {
            $convert: {
              input: "$updatedBy",
              to: "objectId",
              onError: null,
              onNull: null
            }
          },
          categoryId: {
            $convert: {
              input: "$categoryId",
              to: "objectId",
              onError: null,
              onNull: null
            }
          }
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "notecategories",
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
    ]);

    res.json({
      data: notes,
      pagination: {
        page: safePage,
        limit,
        total,
        totalPages
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi lấy bài viết từ thùng rác" });
  }
};

// Lấy bài viết theo ID admin
export const getNoteById = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }
    const note = await NoteModel.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Không tìm thấy bài biết' });
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi lấy bài viết" });
  }
}

//Lấy bài viết theo slug client
export const getNoteBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        message: "Slug không hợp lệ",
      });
    }

    const note = await NoteModel.findOne({
      slug: slug.toLowerCase(),
      isDeleted: false,
    })
      .populate("categoryId", "name slug")
      .populate("author", "fullName email")
      .populate("updatedBy", "fullName email");

    if (!note) {
      return res.status(404).json({
        message: "Không tìm thấy bài viết",
      });
    }

    return res.status(200).json({
      message: "Lấy chi tiết bài viết thành công",
      data: note,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server",
    });
  }
};

// Tạo bài viết mới
export const postNote = async (req: AuthenticatedRequest, res: Response) => {
  console.log('📦 req.body:', req.body); // Debug
  const { title, content, categoryId } = req.body;
  const userId = req.user?.uid;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Vui lòng nhập tiêu đề" });
  }

  const baseSlug = slugify(title, {
    lower: true,
    locale: "vi",
  });

  let slug = baseSlug;
  let count = 1;

  while (await NoteModel.findOne({ slug })) {
    slug = `${baseSlug}-${count++}`;
  }

  let parsedContent;
  try {
    parsedContent = JSON.parse(content);
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

  const thumbnail = req.file ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}` : undefined;
  try {
    const newNote = new NoteModel({ thumbnail, title: title.trim(), slug, content: parsedContent, categoryId, author: userId, });

    const savedNote = await newNote.save();

    return res.status(201).json(savedNote);
  } catch (error) {
    console.error("postNote error:", error);
    return res.status(500).json({ message: 'Không thể tạo bài viết (lỗi server)' });
  }
}

// Cập nhật bài viết
export const updateNote = async (req: AuthenticatedRequest, res: Response) => {
  // console.log('📦 req.body:', req.body); // Debug
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "ID không hợp lệ" });
  }
  const { title, content, categoryId, imageDeleted } = req.body;
  const userId = req.user?.uid;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Vui lòng nhập tiêu đề" });
  }

  if (!content) {
    return res.status(400).json({ message: "Vui lòng nhập nội dung" });
  }

  const slug = slugify(title, {
    lower: true,
    locale: "vi",
    strict: true,
  });

  let parsedContent;
  try {
    parsedContent = JSON.parse(content);
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

  if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
    return res.status(400).json({ message: "categoryId không hợp lệ" });
  }
  try {
    const existingNote = await NoteModel.findById(req.params.id);
    if (!existingNote)
      return res.status(404).json({ message: "Không tìm thấy bài viết để cập nhật" });

    let thumbnail = existingNote.thumbnail;

    if (req.file) {
      // 🖼 Có upload ảnh mới
      thumbnail = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    } else if (imageDeleted === 'true') {
      // ❌ Nếu frontend báo đã xóa ảnh
      thumbnail = null;
    }

    const updateData: any = { thumbnail, title, slug, content: parsedContent, categoryId, updatedBy: userId };
    const updatedNote = await NoteModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!updatedNote) return res.status(404).json({ message: 'Không tìm thấy ghi chú để cập nhật' });
    res.json(updatedNote);
  } catch (error) {
    res.status(500).json({ message: 'Không thể cập nhật ghi chú' });
  }
}

// Di chuyển bài viết vào thùng rác
export const moveNoteToTrash = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    // Accept cả MongoDB _id (24 chars hex) và slug
    let existingNote;
    if (mongoose.Types.ObjectId.isValid(id)) {
      existingNote = await NoteModel.findByIdAndUpdate(
        id,
        { isDeleted: true, deletedAt: new Date() },
        { new: true }
      );
    } else {
      // Fallback to slug if not a valid ObjectId
      existingNote = await NoteModel.findOneAndUpdate(
        { slug: id },
        { isDeleted: true, deletedAt: new Date() },
        { new: true }
      );
    }

    if (!existingNote) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }

    res.json({
      message: 'Đã chuyển bài viết vào thùng rác',
      data: existingNote
    });
  } catch (error) {
    console.error('[moveNoteToTrash] Error:', error);
    res.status(500).json({ message: 'Không thể chuyển vào thùng rác' });
  }
}

// khôi phục bài viết trong thùng rác
export const restoreNote = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }
    const note = await NoteModel.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: false,
        deletedAt: null,
      },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: 'Không tìm thấy bài viết' });
    }

    res.json({
      message: 'Khôi phục bài viết thành công',
      data: note,
    });
  } catch (error) {
    res.status(500).json({ message: 'Không thể khôi phục bài viết' });
  }
};

// Đếm số bài viết trong thùng rác
export const getTrashNoteCount = async (req: Request, res: Response) => {
  try {
    const total = await NoteModel.countDocuments({ isDeleted: true });
    res.json({ total });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Xóa vĩnh viễn bài viết
export const forceDeleteNote = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }
    const note = await NoteModel.findOneAndDelete({
      _id: req.params.id,
      isDeleted: true,
    });

    if (!note) {
      return res.status(404).json({
        message: 'Bài viết không tồn tại hoặc chưa nằm trong thùng rác',
      });
    }

    res.json({ message: 'Đã xóa vĩnh viễn bài viết' });
  } catch (error) {
    res.status(500).json({ message: 'Không thể xóa vĩnh viễn' });
  }
};