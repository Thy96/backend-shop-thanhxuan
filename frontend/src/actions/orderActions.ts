'use server';

import { revalidatePath } from 'next/cache';
import { updateOrderStatus } from '@/lib/api/apiOrders';

export async function updateOrderStatusAction(orderId: string, status: string) {
  try {
    await updateOrderStatus(orderId, status);
    revalidatePath('/admin/orders');
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      message:
        error?.response?.data?.message ||
        error?.message ||
        'Không thể cập nhật trạng thái',
    };
  }
}