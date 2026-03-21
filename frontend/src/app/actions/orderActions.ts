'use server';

import { revalidatePath } from 'next/cache';
import { updateOrderStatus } from '@/lib/api/apiOrders';

export async function updateOrderStatusAction(orderId: string, status: string) {
  try {
    await updateOrderStatus(orderId, status);
    revalidatePath('/admin/orders');
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Không thể cập nhật trạng thái',
    };
  }
}