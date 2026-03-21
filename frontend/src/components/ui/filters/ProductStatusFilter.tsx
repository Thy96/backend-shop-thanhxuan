'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Select from '../forms/Select';

export default function ProductStatusFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get('status') || '';

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());

    if (e.target.value) {
      params.set('status', e.target.value);
    } else {
      params.delete('status');
    }

    params.set('page', '1'); // reset về page 1 khi filter

    router.push(`/admin/products?${params.toString()}`);
  };

  return (
    <Select
      value={currentStatus}
      onChange={handleChange}
      className="w-[150px] ml-auto mb-0"
      hideOption
      options={[
        { value: '', label: 'Tất cả' },
        { value: 'draft', label: 'Bản nháp' },
        { value: 'available', label: 'Xuất bản' },
      ]}
    />
  );
}
