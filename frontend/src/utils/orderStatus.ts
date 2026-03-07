import { OrderStatus } from "@/lib/types"

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Đang chờ xác nhận',
  paid: 'Đã thanh toán',
  shipping: 'Đang giao hàng',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
}
export const ORDER_STATUS_STYLE: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  shipping: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
}

export const ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: 'Đang chờ xác nhận' },
  { value: 'paid', label: 'Đã thanh toán' },
  { value: 'shipping', label: 'Đang giao hàng' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
];