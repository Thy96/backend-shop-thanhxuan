'use client';

import Button, { DeleteButton } from '@/components/ui/forms/Button';
import LoadingClient from '@/components/ui/Loading/LoadingClient';
import { useTransition } from 'react';

interface Props {
  id: string;
  onDelete: (id: string) => Promise<void>;
}

export default function DeleteCategoryButton({ id, onDelete }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      try {
        await onDelete(id);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Xóa danh mục thất bại';
        alert(message);
      }
    });
  };

  return (
    <>
      {isPending && <LoadingClient text="Đang xóa danh mục..." />}
      <DeleteButton type="button" disabled={isPending} onClick={handleClick}>
        Xóa
      </DeleteButton>
    </>
  );
}
