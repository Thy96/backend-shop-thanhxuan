'use client';

import { useState, FormEvent, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { serverCreateProductCategory } from '@/app/actions/productCategoryActions';
import {
  CategoryOption,
  getCategorySelectOptions,
} from '@/utils/format/category';
import { ChevronLeft } from 'lucide-react';

import Button from '@/components/ui/forms/Button';
import Input from '@/components/ui/forms/Input';
import Select from '@/components/ui/forms/Select';
import LoadingClient from '@/components/ui/Loading/LoadingClient';

interface Props {
  allCategories: CategoryOption[];
}

export default function CreateProductCategoryForm({ allCategories }: Props) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [isPending, startTransition] = useTransition();
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parentOptions = getCategorySelectOptions(allCategories);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoadingSubmit(true);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Vui lòng nhập tên danh mục');
      setLoadingSubmit(false);
      return;
    }

    try {
      await serverCreateProductCategory({
        name: trimmedName,
        parentId: parentId || undefined,
      });

      setLoadingSubmit(false);
      startTransition(() => {
        router.push('/admin/products/categories');
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      setError(message);
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
          placeholder="Ví dụ: Điện tử, Thời trang..."
          required
          label="Tên danh mục"
        />

        <Select
          label="Danh mục cha (tùy chọn)"
          options={parentOptions}
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" className="max-w-40">
          Tạo danh mục
        </Button>
      </form>
    </>
  );
}
