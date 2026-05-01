interface AdminPageHeaderProps {
  title: string;
  action?: React.ReactNode;
  count?: string | number;
  children?: React.ReactNode;
}

export default function AdminPageHeader({
  title,
  action,
  count,
  children,
}: AdminPageHeaderProps) {
  return (
    <div
      className="grid grid-cols-2 items-start justify-between mb-6 flex-wrap
    gap-2"
    >
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      <div className="text-right">{action}</div>
      {count ?? <div>Tổng số lượng: {count}</div>}
      <div>{children}</div>
    </div>
  );
}
