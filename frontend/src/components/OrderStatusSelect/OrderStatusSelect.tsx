'use client';

import { ORDER_STATUS_OPTIONS } from '@/utils/orderStatus';
import { updateOrderStatusAction } from '@/actions/orderActions';
import Select from '../Select/Select';
import { ChangeEvent, useState, useTransition } from 'react';

export default function OrderStatusSelect({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = e.target.value;

    setStatus(nextStatus);

    startTransition(async () => {
      const res = await updateOrderStatusAction(orderId, nextStatus);

      if (!res.success) {
        alert(res.message); // ✅ HIỂN THỊ LỖI BACKEND

        setStatus(currentStatus);
      }
    });
  };

  return (
    <div className="mt-4">
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
