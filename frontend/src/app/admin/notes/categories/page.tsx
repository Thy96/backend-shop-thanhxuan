export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { getNoteCategories } from '@/lib/api/noteCategoryQueries';
import { serverDeleteNoteCategory } from '@/app/actions/noteCategoryActions';
import {
  CategoryOption,
  buildCategoryTree,
  flattenCategoryTree,
  CategoryWithChildren,
} from '@/utils/format/category';

import PageHeader from '@/components/layout/Category/PageHeader';
import Card from '@/components/layout/Category/Card';
import Tablelayout from '@/components/layout/Category/Tablelayout';
import DeleteCategoryButton from '@/components/layout/Category/DeleteCategoryButton';
import EditCategoryButton from '@/components/layout/Category/EditCategoryButton';

export default async function CategoriesPage() {
  const categories = await getNoteCategories();

  async function deleteCategoryAction(id: string) {
    'use server';
    await serverDeleteNoteCategory(id);
    revalidatePath('/admin/notes/categories');
  }

  const tree = buildCategoryTree(categories as CategoryOption[]);
  const flatDisplay = flattenCategoryTree(tree);

  return (
    <>
      <PageHeader
        title="Danh mục bài viết"
        action={
          <Link
            href="/admin/notes/categories/create"
            className="ml-auto rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 transition"
          >
            Thêm danh mục
          </Link>
        }
      />

      <Card>
        <Tablelayout
          isEmpty={categories.length === 0}
          thead={
            <tr className="text-gray-500 border-b-1 border-b-blue-100">
              <th className="px-1 py-4 w-[50]">STT</th>
              <th className="px-6 py-4">Tên</th>
              <th className="px-6 py-4">Slug</th>
              <th className="px-6 py-4 text-right w-[100]"></th>
            </tr>
          }
          tbody={flatDisplay.map(
            (
              { cat, depth }: { cat: CategoryWithChildren; depth: number },
              index: number,
            ) => (
              <tr
                key={cat._id}
                className={`transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                } hover:bg-gray-100`}
              >
                <td className="px-1 py-4 font-medium text-gray-800 text-center">
                  {index + 1}
                </td>
                <td className="px-6 py-4 font-medium text-gray-800">
                  {depth > 0 && (
                    <span
                      style={{ paddingLeft: `${depth * 16}px` }}
                      className="inline-block text-gray-400 mr-1"
                    >
                      └
                    </span>
                  )}
                  {cat.name}
                </td>
                <td className="px-6 py-4 text-xs text-gray-400">{cat.slug}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <EditCategoryButton
                      href={`/admin/notes/categories/edit/${cat._id}`}
                    />

                    <DeleteCategoryButton
                      id={cat._id}
                      onDelete={deleteCategoryAction}
                    />
                  </div>
                </td>
              </tr>
            ),
          )}
        />
      </Card>
    </>
  );
}
