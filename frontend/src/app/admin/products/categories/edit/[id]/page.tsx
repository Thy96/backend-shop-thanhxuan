import {
  getProductCategories,
  getProductCategoryById,
} from '@/lib/api/productCategoryQueries';
import { notFound } from 'next/navigation';
import EditProductCategoryForm from './EditProductCategoryForm';

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [category, allCategories] = await Promise.all([
    getProductCategoryById(id).catch(() => null),
    getProductCategories(),
  ]);

  if (!category) notFound();

  return (
    <EditProductCategoryForm
      category={category}
      allCategories={allCategories}
    />
  );
}
