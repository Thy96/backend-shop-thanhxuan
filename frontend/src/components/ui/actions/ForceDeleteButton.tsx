'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import LoadingClient from '@/components/ui/Loading/LoadingClient';
import { DeleteButton } from '../forms/Button';

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
    console.log(`[${onName}] Button clicked, id:`, id);
    console.log(`[${onName}] isPending:`, isPending);

    const confirmed = window.confirm(confirmText);
    console.log(`[${onName}] Confirm result:`, confirmed);

    if (!confirmed) {
      console.log(`[${onName}] User cancelled confirm`);
      return;
    }

    console.log(`[${onName}] User confirmed, starting transition`);
    startTransition(async () => {
      try {
        console.log(`[${onName}] Calling serverAction for id:`, id);
        const result = await serverAction(id);
        console.log(`[${onName}] Success, result:`, result);
        console.log(`[${onName}] Refreshing router`);
        router.refresh();
        window.dispatchEvent(new Event('trash-updated'));
      } catch (error) {
        console.error(`[${onName}] Error caught:`, error);
        alert(errorText);
      }
    });
  };

  return (
    <>
      <DeleteButton
        type="button"
        onClick={handleForceDelete}
        disabled={isPending}
      >
        {buttonText}
      </DeleteButton>
      {isPending && <LoadingClient text={loadingText} />}
    </>
  );
}
