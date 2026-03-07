import mongoose, { Document, Model, Schema } from "mongoose";
import { ICategory } from "../types";

const productCategorySchema = new Schema<ICategory>({
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
}, {
  timestamps: true,
});

const ProductCategoryModel: Model<ICategory> = mongoose.model<ICategory>(
  "ProductCategory",
  productCategorySchema
);

export default ProductCategoryModel;