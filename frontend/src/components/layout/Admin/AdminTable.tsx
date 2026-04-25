interface AdminTableProps {
  isEmpty: boolean;
  emptyText?: string;
  thead: React.ReactNode;
  tbody: React.ReactNode;
}

export default function AdminTable({
  isEmpty,
  emptyText = 'Không có dữ liệu',
  thead,
  tbody,
}: AdminTableProps) {
  if (isEmpty) {
    return (
      <div className="p-6 text-center text-sm text-gray-400">{emptyText}</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-max min-w-full text-sm">
        <thead>{thead}</thead>
        <tbody>{tbody}</tbody>
      </table>
    </div>
  );
}
