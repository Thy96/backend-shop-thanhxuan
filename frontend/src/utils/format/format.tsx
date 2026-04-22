export function formatNumber(num: number): string {
  return (num ?? 0).toLocaleString('en-US');
}

export function formatDate(
  createdAt: string,
  updatedAt: string,
  status?: string,
) {
  const created = new Date(createdAt);
  const updated = new Date(updatedAt);

  // Nếu updatedAt gần bằng createdAt (chênh < 10 giây)
  const diff = (updated.getTime() - created.getTime()) / 1000;

  if (diff < 10) {
    if (status === 'draft') {
      return (
        <>
          Bản nháp
          <br />
          {created.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </>
      );
    }
    return (
      <>
        Đã xuất bản
        <br />
        {created.toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })}
      </>
    );
  }

  // Nếu không thì tính thời gian chênh lệch
  const now = new Date();
  const diffSeconds = Math.floor((now.getTime() - updated.getTime()) / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60)
    return (
      <>
        Cập nhật <br />
        {diffSeconds} giây trước
      </>
    );
  if (diffMinutes < 60)
    return (
      <>
        Cập nhật <br />
        {diffMinutes} phút trước
      </>
    );
  if (diffHours < 24)
    return (
      <>
        Cập nhật <br />
        {diffHours} giờ trước
      </>
    );
  if (diffDays < 7)
    return (
      <>
        Cập nhật
        <br />
        {diffDays} ngày trước
      </>
    );

  return (
    <>
      Cập nhật vào ngày
      <br />{' '}
      {updated.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })}
    </>
  );
}

export function formatDeletedDate(deletedAt: string) {
  const deleted = new Date(deletedAt);
  const now = new Date();

  const diffSeconds = Math.floor((now.getTime() - deleted.getTime()) / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60)
    return (
      <>
        Đã xóa <br />
        {diffSeconds} giây trước
      </>
    );

  if (diffMinutes < 60)
    return (
      <>
        Đã xóa <br />
        {diffMinutes} phút trước
      </>
    );

  if (diffHours < 24)
    return (
      <>
        Đã xóa <br />
        {diffHours} giờ trước
      </>
    );

  if (diffDays < 7)
    return (
      <>
        Đã xóa <br />
        {diffDays} ngày trước
      </>
    );

  return (
    <>
      Đã xóa vào ngày
      <br />
      {deleted.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })}
    </>
  );
}

export const finalPrice = (
  initPrice: string | number,
  initSale?: string | number,
) => {
  const sale = initSale || 0;
  return formatNumber(
    Number(initPrice) - (Number(initPrice) * Number(sale)) / 100,
  );
};

export function formatRevenue(data: { _id: number; value: number }[]) {
  const months = Array.from({ length: 12 }, (_, i) => ({
    name: `T${i + 1}`,
    value: 0,
  }));

  data.forEach((item) => {
    months[item._id - 1].value = item.value;
  });

  return months;
}

export const formatMillions = (value: number) => {
  const num = Number(value);
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace('.0', '') + ' triệu';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace('.0', '') + 'k';
  }
  return String(num);
};

export function formatChartData(data: { _id: number; value: number }[]) {
  const months = Array.from({ length: 12 }, (_, i) => ({
    name: `T${i + 1}`,
    value: 0,
  }));

  data.forEach((item) => {
    months[item._id - 1].value = item.value;
  });

  return months;
}
