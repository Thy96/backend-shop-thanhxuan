'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Select from '../forms/Select';
import LoadingClient from '../Loading/LoadingClient';

interface StatusOption {
  value: string;
  label: string;
}

interface StatusFilterProps {
  basePath: string;
  options: StatusOption[];
}

export default function StatusFilter({ basePath, options }: StatusFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const currentStatus = searchParams.get('status') || '';

  useEffect(() => {
    setLoading(false);
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());

    if (e.target.value) {
      params.set('status', e.target.value);
    } else {
      params.delete('status');
    }

    params.set('page', '1');

    setLoading(true);
    router.push(`${basePath}?${params.toString()}`);
  };

  return (
    <div className="relative">
      {loading && <LoadingClient text="Đang lọc..." />}
      <Select
        value={currentStatus}
        onChange={handleChange}
        className="w-[133px] ml-auto !mb-0"
        selectClassName="!p-2"
        hideOption
        options={[{ value: '', label: 'Tất cả' }, ...options]}
      />
    </div>
  );
}
