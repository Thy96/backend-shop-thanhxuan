interface AdminCardProps {
  children: React.ReactNode;
}

export default function AdminCard({ children }: AdminCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {children}
    </div>
  );
}
