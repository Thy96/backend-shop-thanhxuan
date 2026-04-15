'use client';

import {
  ORDER_STATUS_OPTIONS,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_STYLE,
} from '@/utils/constants/orderStatus';
import { updateOrderStatusAction } from '@/app/actions/orderActions';
import Select from '../forms/Select';
import { ChangeEvent, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function OrderStatusSelect({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = e.target.value;

    setStatus(nextStatus);

    startTransition(async () => {
      const res = await updateOrderStatusAction(orderId, nextStatus);

      if (!res.success) {
        alert(res.message);
        setStatus(status); // rollback về trạng thái hiện tại
      } else {
        router.refresh(); // ẩn refresh lại server data
      }
    });
  };

  return (
    <div className="mt-4">
      {/* Badge cập nhật ngay khi chọn, không chờ server re-render */}
      <div
        className={`px-3 py-1 text-xs font-semibold rounded-full text-center mb-2 ${
          ORDER_STATUS_STYLE[status as keyof typeof ORDER_STATUS_STYLE] ??
          'bg-gray-100 text-gray-700'
        }`}
      >
        {ORDER_STATUS_LABEL[status as keyof typeof ORDER_STATUS_LABEL] ??
          status}
      </div>
      <b>Cập nhật trạng thái:</b>{' '}
      <Select
        value={status}
        onChange={(e) => handleChange(e)}
        disabled={isPending}
        className="mb-0 mt-1"
        hideOption
        options={ORDER_STATUS_OPTIONS}
      />
    </div>
  );
}
