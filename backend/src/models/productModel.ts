import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { ICategory, IUser } from "../types";

export interface IProduct extends Document {
  _id: Types.ObjectId;
  images: string[];
  title: string;
  content: Object;
  price: number;
  sale: number;
  stock: number;
  points: number;
  categoryIds: (Types.ObjectId | ICategory)[];
  status: string;
  author: Types.ObjectId | IUser;
  updatedBy: Types.ObjectId | IUser | null | string;
  isDeleted: boolean;
  deletedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema({
  images: {
    type: [String],
    default: []
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: Object,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  sale: {
    type: Number,
    default: 0
  },
  stock: {
    type: Number,
    default: 0
  },
  points: {
    type: Number,
    default: 0
  },
  categoryIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductCategory",
  }],
  status: {
    type: String,
    enum: ["draft", "available"],
    default: "draft"
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const ProductModel: Model<IProduct> = mongoose.model<IProduct>("Product", productSchema);
export default ProductModel;