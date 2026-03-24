export default function LoadingServer() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white px-6 py-3 rounded-lg shadow flex items-center gap-3">
        <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">Đang tải trang...</span>
      </div>
    </div>
  );
}
