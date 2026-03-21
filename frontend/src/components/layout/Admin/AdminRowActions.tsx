import Link from 'next/link';

interface AdminRowActionsProps {
  editHref?: string;
  onDelete?: React.ReactNode;
}

export default function AdminRowActions({
  editHref,
  onDelete,
}: AdminRowActionsProps) {
  return (
    <div className="flex flex-col gap-2">
      {editHref && (
        <Link
          href={editHref}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition text-center text-sm"
        >
          Sửa
        </Link>
      )}
      {onDelete}
    </div>
  );
}
