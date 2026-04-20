import {
  getNoteCategories,
  getNoteCategoryById,
} from '@/lib/api/noteCategoryQueries';
import { notFound } from 'next/navigation';
import EditNoteCategoryForm from './EditNoteCategoryForm';

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [category, allCategories] = await Promise.all([
    getNoteCategoryById(id).catch(() => null),
    getNoteCategories(),
  ]);

  if (!category) notFound();

  return (
    <EditNoteCategoryForm category={category} allCategories={allCategories} />
  );
}
