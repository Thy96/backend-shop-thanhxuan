import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { getNoteCategories } from '@/lib/api/noteCategoryQueries';
import { serverDeleteNoteCategory } from '@/app/actions/noteCategoryActions';
import { CategoryOption } from '@/utils/category';

import PageHeader from '@/components/Layout/Category/PageHeader';
import Card from '@/components/Layout/Category/Card';
import Tablelayout from '@/components/Layout/Category/Tablelayout';

export default async function CategoriesPage() {
  const categories = await getNoteCategories();
  async function deleteCategoryAction(formData: FormData) {
    'use server';

    const id = formData.get('id')?.toString();
    if (!id) return;

    await serverDeleteNoteCategory(id);
    revalidatePath('/admin/notes/categories');
  }

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
          tbody={categories.map((cat: CategoryOption, index: number) => (
            <tr
              key={cat._id}
              className={`transition-colors ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              } hover:bg-gray-100`}
            >
              <td className="px-1 py-4 font-medium text-gray-800 text-center">
                {index}
              </td>
              <td className="px-6 py-4 font-medium text-gray-800">
                {cat.name}
              </td>

              <td className="px-6 py-4 text-xs text-gray-400">{cat.slug}</td>

              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/notes/categories/edit/${cat._id}`}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded shadow-sm transition block text-center"
                  >
                    Sửa
                  </Link>

                  <form action={deleteCategoryAction}>
                    <input type="hidden" name="id" value={cat._id} />
                    <button
                      type="submit"
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow-sm transition w-full cursor-pointer"
                    >
                      Xóa
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        />
      </Card>
    </>
  );
}
