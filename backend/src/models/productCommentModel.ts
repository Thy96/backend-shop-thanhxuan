import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { IUser } from "../types";
import { IProduct } from "./productModel";

export interface IProductComment extends Document {
    _id: Types.ObjectId;
    productId: Types.ObjectId | IProduct;
    userId: Types.ObjectId | IUser;
    content: string;
    rating: number;
    createdAt: Date;
    updatedAt: Date;
}

const productCommentSchema = new Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            default: 5,
        },
    },
    { timestamps: true }
);

const ProductCommentModel: Model<IProductComment> = mongoose.model<IProductComment>(
    "ProductComment",
    productCommentSchema
);

export default ProductCommentModel;
