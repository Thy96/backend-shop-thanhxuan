import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type PaymentMethod =
  | 'COD'
  | 'BANK_TRANSFER'
  | 'MOMO'
  | 'VNPAY'
  | 'ZALOPAY'
  | 'PAYPAL';

export interface OrderItem {
  product: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  email: string;
}

export interface OrderDocument extends Document {
  user: Types.ObjectId;
  items: OrderItem[];
  totalPrice: number;
  status: 'pending' | 'paid' | 'shipping' | 'completed' | 'cancelled';
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<OrderDocument>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },

  items: [
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      image: { type: String, default: '' },
    },
  ],

  totalPrice: {
    type: Number,
    required: true,
  },

  status: {
    type: String,
    enum: ['pending', 'paid', 'shipping', 'completed', 'cancelled'],
    default: 'pending',
  },

  shippingAddress: {
    fullName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },

  paymentMethod: {
    type: String,
    enum: ['COD', 'BANK_TRANSFER', 'MOMO', 'VNPAY', 'ZALOPAY', 'PAYPAL'],
    required: true,
  },
},
  { timestamps: true }
);

const Order: Model<OrderDocument> = mongoose.model<OrderDocument>('Order', OrderSchema)
export default Order
