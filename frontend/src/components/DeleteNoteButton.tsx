'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { serverMoveNoteToTrash } from '@/app/actions/noteActions';
import LoadingClient from '@/components/Loading/LoadingClient';

interface DeleteNoteButtonProps {
  noteId: string;
}

export default function DeleteNoteButton({ noteId }: DeleteNoteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;

    startTransition(async () => {
      try {
        console.log('[DeleteNoteButton] Deleting note:', noteId);
        await serverMoveNoteToTrash(noteId);
        console.log('[DeleteNoteButton] Success, refreshing page');
        router.refresh(); // Refresh page data
      } catch (error) {
        console.error('[DeleteNoteButton] Error:', error);
        alert('Lỗi khi xóa bài viết. Vui lòng thử lại.');
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
        {isPending ? 'Đang xóa...' : 'Xóa'}
      </button>
      {isPending && <LoadingClient text="Đang xóa bài viết..." />}
    </>
  );
}
