'use client';

import { useState, FormEvent, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { serverUpdateNoteCategory } from '@/app/actions/noteCategoryActions';
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
  category: CategoryOption;
  allCategories: CategoryOption[];
}

function resolveParentId(
  parentId: string | CategoryOption | null | undefined,
): string {
  if (!parentId) return '';
  if (typeof parentId === 'string') return parentId;
  return parentId._id;
}

export default function EditNoteCategoryForm({
  category,
  allCategories,
}: Props) {
  const router = useRouter();
  const [name, setName] = useState(category.name);
  const [parentId, setParentId] = useState(() =>
    resolveParentId(category.parentId),
  );
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const parentOptions = getCategorySelectOptions(allCategories, category._id);

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

      await serverUpdateNoteCategory(category._id, {
        name: trimmedName,
        parentId: parentId || undefined,
      });

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
        <LoadingClient text="Đang cập nhật danh mục..." />
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
          Lưu thay đổi
        </Button>
      </form>
    </>
  );
}
