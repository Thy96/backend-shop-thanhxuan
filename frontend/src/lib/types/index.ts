import { CategoryOption } from "@/utils/format/category";
import { UserOption } from "@/utils/user";
import { ReactNode } from "react";

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface ProductProps {
  _id: string;
  images: string[];
  title: string;
  price: number;
  sale: number;
  stock: number;
  points: number;
  status: string;
  categoryIds: (string | CategoryOption)[];
  categories: CategoryOption[];
  author: UserOption;
  updatedBy: UserOption;
  createdAt: string;
  updatedAt: string;
}

export interface ProductComment {
  _id: string;
  productId: string;
  userId: {
    _id: string;
    fullName?: string;
    email: string;
  };
  content: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  fullName?: string;
  email: string;
  role: string;
  phone: string;
  address?: string;
  points: number;
  isBlocked: boolean;
  blockedAt: Date | null;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
  isVerified?: boolean;
}

export interface CreateUserDTO {
  fullName?: string;
  email: string;
  password: string;
  phone: string;
  address?: string;
  role?: string;
}

export interface NoteProps {
  _id: string;
  thumbnail: string;
  title: string;
  slug: string;
  status: string;
  categoryIds: (string | CategoryOption)[];
  categories: CategoryOption[];
  author: UserOption;
  updatedBy: UserOption;
  isDeleted: boolean;
  deletedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OrderItem {
  _id: string;
  product: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  points: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  email: string;
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'shipping'
  | 'completed'
  | 'cancelled';

export type PaymentMethod =
  | 'COD'
  | 'BANK_TRANSFER'
  | 'MOMO'
  | 'VNPAY'
  | 'ZALOPAY'
  | 'PAYPAL';

export interface OrderProps {
  _id: string;
  user: string | null;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}

export interface MenuProps {
  label: string;
  url: string;
  icon?: ReactNode;
  subMenu?: MenuProps[];
  roles?: Role[];
  trashCountKey?: string;
}