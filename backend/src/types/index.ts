import { Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
}

export interface IUser extends Document {
  fullName: string;
  email: string;
}

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  SHIPPING = 'shipping',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  COD = 'COD',
  MOMO = 'MOMO',
  ZALOPAY = 'ZALOPAY',
  VNPAY = 'VNPAY',
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: 'Đang chờ xác nhận',
  paid: 'Đã thanh toán',
  shipping: 'Đang giao hàng',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
}