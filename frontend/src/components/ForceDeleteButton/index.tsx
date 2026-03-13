'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import LoadingClient from '@/components/Loading/LoadingClient';

interface ForceDeleteButtonProps {
  id: string;
  serverAction: (id: string) => Promise<any>;
  confirmText?: string;
  loadingText?: string;
  errorText?: string;
  buttonText?: string;
  onName?: string;
}

export default function ForceDeleteButton({
  id,
  serverAction,
  confirmText = 'Bạn có chắc chắn muốn xóa vĩnh viễn? Không thể khôi phục!',
  loadingText = 'Đang xóa...',
  errorText = 'Lỗi khi xóa. Vui lòng thử lại.',
  buttonText = 'Xóa vĩnh viễn',
  onName = 'ForceDeleteButton',
}: ForceDeleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleForceDelete = () => {
    if (!confirm(confirmText)) return;

    startTransition(async () => {
      try {
        console.log(`[${onName}] Force deleting:`, id);
        await serverAction(id);
        console.log(`[${onName}] Success, refreshing page`);
        router.refresh();
      } catch (error) {
        console.error(`[${onName}] Error:`, error);
        alert(errorText);
      }
    });
  };

  return (
    <>
      <button
        onClick={handleForceDelete}
        disabled={isPending}
        className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-3 py-1 rounded transition text-sm w-full cursor-pointer"
      >
        {isPending ? `${loadingText}` : buttonText}
      </button>
      {isPending && <LoadingClient text={`${loadingText}`} />}
    </>
  );
}
