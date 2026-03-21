export default function LoadingServer() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm gap-3">
      <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm font-medium text-gray-600">Đang tải trang...</p>
    </div>
  );
}
