import { getNoteCategories } from '@/lib/api/noteCategoryQueries';
import CreateNoteCategoryForm from './CreateNoteCategoryForm';

export default async function CreateCategoryPage() {
  const categories = await getNoteCategories();
  return <CreateNoteCategoryForm allCategories={categories} />;
}
