export const dynamic = 'force-dynamic';

import React from 'react';
import Image from 'next/image';

import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_STYLE,
} from '@/utils/constants/orderStatus';
import { getAllOrders } from '@/lib/api/apiOrders';
import { OrderItem, OrderProps, PaginationProps } from '@/lib/types';

import { getPaginationRange } from '@/utils/format/pagination';
import {
  PAY_METHOD_LABEL,
  PAY_METHOD_STYLE,
} from '@/utils/constants/payMethod';

import AdminPagination from '@/components/layout/Admin/AdminPagination';
import OrderStatusSelect from '@/components/ui/filters/OrderStatusSelect';

export default async function MyOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = 10;

  const {
    data: orders,
    pagination,
  }: {
    data: OrderProps[];
    pagination: PaginationProps;
  } = await getAllOrders(page, limit);

  const pages = getPaginationRange(pagination.page, pagination.totalPages);

  return (
    <>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Danh sách đơn đặt hàng
      </h2>

      {orders.length === 0 && (
        <p className="text-gray-500 italic">Không có đơn hàng</p>
      )}

      <div className="space-y-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {orders.map((order: OrderProps, index: number) => (
          <div
            key={order._id}
            className="bg-white border border-gray-200 rounded-xl shadow-sm mb-0"
          >
            <div
              className="w-8 h-8 flex items-center justify-center 
                rounded-full bg-black text-white 
                font-semibold text-sm mt-6 border border-black m-auto"
            >
              {(pagination.page - 1) * limit + index + 1}
            </div>
            {/* ===== ROW 1: ORDER INFO ===== */}
            <div className="p-6 pt-4 border-b border-b-blue-100">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Info label="Mã đơn" value={order._id} />
                <Info
                  label="Tổng tiền"
                  value={`${order.totalPrice.toLocaleString()} đ`}
                  valueClass="text-green-600"
                />
                <Info
                  label="Ngày tạo"
                  value={new Date(order.createdAt).toLocaleDateString()}
                />
                <Info label="Số sản phẩm" value={order.items.length} />
                <Info
                  label="Tổng điểm thưởng"
                  value={`${order.items.reduce((sum, i) => sum + (i.points ?? 0) * i.quantity, 0)}`}
                  valueClass="text-yellow-600"
                />
              </div>

              <div
                className={`px-3 py-1 text-xs font-semibold rounded-full text-center ${
                  ORDER_STATUS_STYLE[order.status]
                }`}
              >
                {ORDER_STATUS_LABEL[order.status]}
              </div>
              <OrderStatusSelect
                orderId={order._id}
                currentStatus={order.status}
              />
            </div>

            {/* ===== ROW 2: SHIPPING INFO ===== */}
            <div className="p-6 bg-gray-50 border-b border-b-blue-100 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 break-words">
                <p>
                  <b>Họ tên:</b> {order.shippingAddress.fullName}
                </p>
                <p>
                  <b>SĐT:</b> {order.shippingAddress.phone}
                </p>
                <p>
                  <b>Email:</b> {order.shippingAddress.email}
                </p>
                <p>
                  <b>Địa chỉ:</b> {order.shippingAddress.address}
                </p>
              </div>
              <p>
                <b>Phương Thức Thanh Toán:</b>{' '}
                <span className={PAY_METHOD_STYLE[order.paymentMethod]}>
                  {PAY_METHOD_LABEL[order.paymentMethod]}
                </span>
              </p>
            </div>

            {/* ===== ROW 3: PRODUCTS ===== */}
            <div className="p-6 space-y-4">
              {order.items.map((item: OrderItem) => (
                <div
                  key={item._id}
                  className="flex items-center gap-4 border rounded-lg p-4 hover:shadow transition border-blue-100"
                >
                  {/* Image */}
                  <Image
                    src={item.image || '/images/no-image.png'}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover rounded-md border border-blue-100"
                  />

                  {/* Product info */}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      Đơn giá: {item.price.toLocaleString()} đ
                    </p>
                    <p className="text-sm text-gray-500">
                      Số lượng: {item.quantity}
                    </p>
                    {(item.points ?? 0) > 0 && (
                      <p className="text-xs text-yellow-600 font-medium mt-0.5">
                        Số thưởng: {(item.points ?? 0) * item.quantity}
                      </p>
                    )}
                  </div>

                  {/* Sub total */}
                  <div className="font-semibold text-gray-800">
                    {(item.price * item.quantity).toLocaleString()} đ
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <AdminPagination pagination={pagination} pages={pages} page="orders" />
    </>
  );
}

const Info = ({
  label,
  value,
  valueClass = '',
}: {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}) => (
  <div>
    <b>{label}</b>
    <p className={`font-medium text-gray-800 truncate ${valueClass}`}>
      {value}
    </p>
  </div>
);
