'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import LoadingClient from '@/components/ui/Loading/LoadingClient';

interface RestoreButtonProps {
  id: string;
  serverAction: (id: string) => Promise<any>;
  confirmText?: string;
  loadingText?: string;
  errorText?: string;
  buttonText?: string;
  onName?: string;
}

export default function RestoreButton({
  id,
  serverAction,
  confirmText = 'Bạn có chắc chắn muốn khôi phục?',
  loadingText = 'Đang khôi phục...',
  errorText = 'Lỗi khi khôi phục. Vui lòng thử lại.',
  buttonText = 'Khôi phục',
  onName = 'RestoreButton',
}: RestoreButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRestore = () => {
    console.log(`[${onName}] Button clicked, id:`, id);
    console.log(`[${onName}] Confirm text:`, confirmText);

    if (!confirm(confirmText)) {
      console.log(`[${onName}] User cancelled confirm`);
      return;
    }

    console.log(`[${onName}] User confirmed, starting transition`);
    startTransition(async () => {
      try {
        console.log(`[${onName}] Restoring:`, id);
        const result = await serverAction(id);
        console.log(`[${onName}] Success, result:`, result);
        console.log(`[${onName}] Refreshing page`);
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
        onClick={handleRestore}
        disabled={isPending}
        className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-3 py-1 rounded transition text-center text-sm cursor-pointer w-full"
      >
        {buttonText}
      </button>
      {isPending && <LoadingClient text={`${loadingText}`} />}
    </>
  );
}
