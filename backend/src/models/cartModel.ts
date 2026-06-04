import mongoose, { Document, Schema, Types } from "mongoose";

export interface CartItem {
    product: Types.ObjectId;
    name: string;
    price: number;
    sale: number;
    image: string;
    quantity: number;
    points: number;
}

export interface CartDocument extends Document {
    user: Types.ObjectId;
    items: CartItem[];
    updatedAt: Date;
}

const CartItemSchema = new Schema<CartItem>(
    {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        sale: { type: Number, default: 0 },
        image: { type: String, default: "" },
        quantity: { type: Number, required: true, min: 1 },
        points: { type: Number, default: 0 },
    },
    { _id: false }
);

const CartSchema = new Schema<CartDocument>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
        items: { type: [CartItemSchema], default: [] },
    },
    { timestamps: true }
);

const CartModel = mongoose.model<CartDocument>("Cart", CartSchema);
export default CartModel;
