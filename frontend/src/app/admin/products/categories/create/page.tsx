import { getProductCategories } from '@/lib/api/productCategoryQueries';
import CreateProductCategoryForm from './CreateProductCategoryForm';

export default async function CreateCategoryPage() {
  const categories = await getProductCategories();
  return <CreateProductCategoryForm allCategories={categories} />;
}
