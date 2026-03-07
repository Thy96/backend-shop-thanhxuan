import { PaymentMethod } from "@/lib/types";

export const PAY_METHOD_LABEL: Record<PaymentMethod, string> = {
  COD: 'Thanh toán khi nhận hàng',
  BANK_TRANSFER: 'Chuyển khoản ngân hàng',
  MOMO: 'Ví MoMo',
  VNPAY: 'VNPay',
  ZALOPAY: 'ZaloPay',
  PAYPAL: 'PayPal',
};

export const PAY_METHOD_STYLE: Record<PaymentMethod, string> = {
  COD: 'bg-gray-100 text-gray-700',
  BANK_TRANSFER: 'bg-indigo-100 text-indigo-700',
  MOMO: 'bg-pink-100 text-pink-700',
  VNPAY: 'bg-blue-100 text-blue-700',
  ZALOPAY: 'bg-green-100 text-green-700',
  PAYPAL: 'bg-yellow-100 text-yellow-700',
};