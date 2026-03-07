import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import {
  forceDeleteProduct,
  getTrashProducts,
  restoreProduct,
} from '@/lib/api/apiProducts';
import { getProductCategories } from '@/lib/api/apiProductCategories';
import { PaginationProps, ProductProps } from '@/lib/types';

import { getPaginationRange } from '@/utils/pagination';
import { getCategoryLabel } from '@/utils/category';
import { finalPrice, formatDate, formatNumber } from '@/utils/format';

import AdminPageHeader from '@/components/Layout/Pages/AdminPageHeader';
import AdminCard from '@/components/Layout/Pages/AdminCard';
import AdminTable from '@/components/Layout/Pages/AdminTable';
import AdminPagination from '@/components/Layout/Pages/AdminPagination';

export default async function TrashProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = 10;

  const {
    data: products,
    pagination,
  }: {
    data: ProductProps[];
    pagination: PaginationProps;
  } = await getTrashProducts(page, limit);

  const pages = getPaginationRange(pagination.page, pagination.totalPages);

  const categories = await getProductCategories();

  // ✅ Đây là Server Action
  async function restoreAction(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;

    // Lấy toàn bộ cookie của user hiện tại
    const cookieHeader = (await cookies())
      .getAll()
      .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
      .join('; ');

    // Gửi kèm cookie này sang backend
    await restoreProduct(id, cookieHeader);
    revalidatePath('/admin/products'); // reload lại data
    revalidatePath('/admin/products/trash'); // reload lại data trash
  }

  async function forceDeleteAction(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const cookieHeader = (await cookies())
      .getAll()
      .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
      .join('; ');

    await forceDeleteProduct(id, cookieHeader);
    revalidatePath('/admin/products/trash');
  }

  return (
    <>
      <AdminPageHeader
        title="Thùng rác"
        action={
          <Link
            href="/admin/products"
            className="ml-auto rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 transition inline-block"
          >
            Quay lại danh sách
          </Link>
        }
        count={pagination.total}
      />

      <AdminCard>
        <AdminTable
          isEmpty={products.length === 0}
          emptyText="Không có sản phẩm"
          thead={
            <tr className="text-gray-500 border-b-1 border-b-blue-100 text-left">
              <th className="px-1 py-4 text-center w-[50]">STT</th>
              <th className="px-4 py-4 text-center">Tiêu đề</th>
              <th className="px-1 py-4 w-[130]">Giá</th>
              <th className="px-1 py-4 w-[130]">Chuyên mục</th>
              <th className="px-1 py-4 w-[130]">Ngày xóa</th>
              <th className="px-1 py-4 w-[100]">Tồn kho</th>
              <th className="px-4 py-4 text-right w-[150]"></th>
            </tr>
          }
          tbody={products.map((product, index) => (
            <tr
              key={product._id}
              className={`transition-colors ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              } hover:bg-gray-100`}
            >
              <td className="px-1 py-4 text-center">
                {(pagination.page - 1) * limit + index + 1}
              </td>
              <td className="px-4 py-4">{product.title}</td>
              <td className="px-1 py-4">
                {product.sale !== 0 ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 line-through text-sm">
                        {formatNumber(Number(product.price))}₫
                      </span>
                      <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-0.5 rounded">
                        -{product.sale}%
                      </span>
                    </div>
                    <span className="text-red-500 font-bold text-sm">
                      {finalPrice(product.price, product.sale)}
                    </span>
                  </>
                ) : (
                  <span className="font-medium">
                    {finalPrice(product.price)}
                  </span>
                )}
                ₫
              </td>
              <td className="px-1 py-4">
                {getCategoryLabel(product.categoryId, categories)}
              </td>
              <td className="px-1 py-4">
                {formatDate(product.createdAt, product.updatedAt)}
              </td>
              <td className="px-1 py-4 text-center">{product.stock}</td>
              <td className="px-4 py-4 text-right flex flex-col gap-2">
                {/* Restore */}
                <form action={restoreAction}>
                  <input type="hidden" name="id" value={product._id} />
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition text-center text-sm cursor-pointer w-full"
                  >
                    Khôi phục
                  </button>
                </form>

                {/* Force delete */}
                <form action={forceDeleteAction}>
                  <input type="hidden" name="id" value={product._id} />
                  <button
                    type="submit"
                    className="bg-red-500 hover:bg-red-600 text-white px-1 py-1 rounded transition text-sm w-full cursor-pointer"
                  >
                    Xóa vĩnh viễn
                  </button>
                </form>
              </td>
            </tr>
          ))}
        />
      </AdminCard>

      {/* Pagination */}
      <AdminPagination pagination={pagination} pages={pages} page="products" />
    </>
  );
}
