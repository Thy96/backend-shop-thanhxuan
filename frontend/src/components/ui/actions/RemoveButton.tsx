'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import LoadingClient from '@/components/ui/Loading/LoadingClient';
import { DeleteButton } from '@/components/ui/forms/Button';

interface RemoveButtonProps {
  id: string;
  serverAction: (id: string) => Promise<void>;
  confirmText?: string;
  loadingText?: string;
  errorText?: string;
  buttonText?: string;
  onName?: string;
}

export default function RemoveButton({
  id,
  serverAction,
  confirmText = 'Bạn có chắc chắn muốn xóa?',
  loadingText = 'Đang xóa...',
  errorText = 'Lỗi khi xóa. Vui lòng thử lại.',
  buttonText = 'Xóa',
  onName = 'RemoveButton',
}: RemoveButtonProps) {
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
        window.dispatchEvent(new Event('trash-updated'));
      } catch (error) {
        console.error(`[${onName}] Error:`, error);
        alert(errorText);
      }
    });
  };

  return (
    <>
      {isPending && <LoadingClient text={loadingText} />}
      <DeleteButton type="button" onClick={handleDelete} disabled={isPending}>
        {buttonText}
      </DeleteButton>
    </>
  );
}
