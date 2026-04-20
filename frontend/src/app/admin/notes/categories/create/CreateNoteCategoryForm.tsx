'use client';

import { useState, FormEvent, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { serverCreateNoteCategory } from '@/app/actions/noteCategoryActions';
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

export default function CreateNoteCategoryForm({ allCategories }: Props) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const parentOptions = getCategorySelectOptions(allCategories);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Vui lòng nhập tên danh mục');
      return;
    }

    try {
      setLoadingSubmit(true);

      const res = await serverCreateNoteCategory({
        name: trimmedName,
        parentId: parentId || undefined,
      });

      if (!res) {
        setError('Tạo danh mục thất bại. Vui lòng thử lại.');
        setLoadingSubmit(false);
        return;
      }

      startTransition(() => {
        router.push('/admin/notes/categories');
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
        onClick={() => router.push('/admin/notes/categories')}
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
          placeholder="Ví dụ: Tin tức, Hướng dẫn..."
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
