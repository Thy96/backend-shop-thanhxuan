import mongoose, { Document, Model, Schema } from "mongoose";
import { ICategory } from "../types";

const noteCategorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'NoteCategory',
    default: null,
  },
}, {
  timestamps: true,
});

const NoteCategoryModel: Model<ICategory> = mongoose.model<ICategory>(
  "NoteCategory",
  noteCategorySchema
);

export default NoteCategoryModel;