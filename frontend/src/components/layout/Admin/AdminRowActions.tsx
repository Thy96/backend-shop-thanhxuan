'use client';

import { useRouter } from 'next/navigation';
import { EditButton } from '@/components/ui/forms/Button';

interface AdminRowActionsProps {
  editHref?: string;
  onDelete?: React.ReactNode;
}

export default function AdminRowActions({
  editHref,
  onDelete,
}: AdminRowActionsProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-2">
      {editHref && (
        <EditButton type="button" onClick={() => router.push(editHref)}>
          Sửa
        </EditButton>
      )}
      {onDelete}
    </div>
  );
}
