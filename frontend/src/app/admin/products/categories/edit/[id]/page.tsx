'use client';

import { useEffect, useState, FormEvent, useTransition } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { getProductCategoryById } from '@/lib/api/apiProductCategories';
import { serverUpdateProductCategory } from '@/app/actions/productCategoryActions';
import { CategoryOption } from '@/utils/category';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import LoadingClient from '@/components/Loading/LoadingClient';

export default function EditNoteCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [category, setCategory] = useState<CategoryOption | null>(null);
  const [name, setName] = useState('');
  const [isPending, startTransition] = useTransition();
  const [loadingpage, setLoadingPage] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load category khi vào page
  useEffect(() => {
    if (!id) return;

    const fetchCategory = async () => {
      try {
        setLoadingPage(true);
        const data = await getProductCategoryById(id);
        if (!data) {
          setError('Không tìm thấy category.');
          return;
        }
        setCategory(data);
        setName(data.name);
      } catch (err) {
        console.error(err);
        setError('Có lỗi khi tải category.');
      } finally {
        setLoadingPage(false);
      }
    };

    fetchCategory();
  }, [id]);

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
      await serverUpdateProductCategory(id, {
        name: trimmedName,
      });
      setLoadingSubmit(false);
      startTransition(() => {
        router.push('/admin/products/categories');
      });
    } catch (err) {
      console.error(err);
      setError('Đã có lỗi xảy ra khi cập nhật. Vui lòng thử lại.');
      setLoadingSubmit(false);
    }
  };

  if (loadingpage) return <LoadingClient />;

  if (error && !category) {
    return (
      <>
        <p className="text-red-500">{error}</p>
        <Button
          type="button"
          onClick={() => router.push('/admin/products/categories')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer flex justify-center max-w-[200]"
        >
          <ChevronLeft width={23} height={23} /> Quay Lại Danh Mục
        </Button>
      </>
    );
  }

  return (
    <>
      {(loadingSubmit || isPending) && (
        <LoadingClient text="Đang cập nhật danh mục..." />
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
          label="Tên danh mục"
          name="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded border px-3 py-2 text-sm"
          required
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" className="max-w-20">
          Sửa
        </Button>
      </form>
    </>
  );
}
