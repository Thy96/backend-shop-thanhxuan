'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import LoadingClient from '@/components/ui/Loading/LoadingClient';

interface DeleteButtonProps {
  id: string;
  serverAction: (id: string) => Promise<any>;
  confirmText?: string;
  loadingText?: string;
  errorText?: string;
  buttonText?: string;
  onName?: string; // For logging: 'DeleteNote', 'DeleteCategory', etc
}

export default function DeleteButton({
  id,
  serverAction,
  confirmText = 'Bạn có chắc chắn muốn xóa?',
  loadingText = 'Đang xóa...',
  errorText = 'Lỗi khi xóa. Vui lòng thử lại.',
  buttonText = 'Xóa',
  onName = 'DeleteButton',
}: DeleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(confirmText)) return;

    startTransition(async () => {
      try {
        console.log(`[${onName}] Deleting:`, id);
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
        onClick={handleDelete}
        disabled={isPending}
        className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-3 py-1 rounded transition text-sm w-full cursor-pointer"
      >
        {buttonText}
      </button>
      {isPending && <LoadingClient text={`${loadingText}`} />}
    </>
  );
}
