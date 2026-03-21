'use client';

import { useState, FormEvent, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { serverCreateProductCategory } from '@/app/actions/productCategoryActions';
import { ChevronLeft } from 'lucide-react';

import Button from '@/components/ui/forms/Button';
import Input from '@/components/ui/forms/Input';
import LoadingClient from '@/components/ui/Loading/LoadingClient';

export default function CreateCategoryPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [isPending, startTransition] = useTransition();
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoadingSubmit(true);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Vui lòng nhập tên category');
      setLoadingSubmit(false);
      return;
    }

    try {
      await serverCreateProductCategory({ name: trimmedName });

      // Tạo xong thì quay lại list
      setLoadingSubmit(false);
      startTransition(() => {
        router.push('/admin/products/categories');
      });
    } catch (err) {
      console.error(err);
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
      setLoadingSubmit(false);
    }
  };

  return (
    <>
      {(loadingSubmit || isPending) && (
        <LoadingClient text="Đang tạo danh mục..." />
      )}
      <Button
        type="button"
        onClick={() => router.push('/admin/products/categories')}
        className="flex justify-center max-w-[200]"
      >
        <ChevronLeft width={23} height={23} /> Quay Lại Danh Mục
      </Button>
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <Input
          id="name"
          name="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded border px-3 py-2 text-sm"
          placeholder="Ví dụ: Tin tức, Hướng dẫn..."
          required
          label="Tên danh mục"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" className="max-w-40">
          Tạo danh mục
        </Button>
      </form>
    </>
  );
}
