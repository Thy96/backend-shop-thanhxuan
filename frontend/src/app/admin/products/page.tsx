import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import { getProducts, moveProductToTrash } from '@/lib/api/apiProducts';
import { getProductCategories } from '@/lib/api/apiProductCategories';
import { PaginationProps, ProductProps } from '@/lib/types';

import { getPaginationRange } from '@/utils/pagination';
import { getCategoryLabel } from '@/utils/category';
import { finalPrice, formatDate, formatNumber } from '@/utils/format';

import AdminPageHeader from '@/components/Layout/Pages/AdminPageHeader';
import AdminCard from '@/components/Layout/Pages/AdminCard';
import AdminTable from '@/components/Layout/Pages/AdminTable';
import AdminRowActions from '@/components/Layout/Pages/AdminRowActions';
import AdminPagination from '@/components/Layout/Pages/AdminPagination';
import ProductStatusFilter from '@/components/ProductStatusFilter/ProductStatusFilter';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const status = params.status || '';
  const limit = 10;

  const {
    data: products,
    pagination,
  }: {
    data: ProductProps[];
    pagination: PaginationProps;
  } = await getProducts(page, limit, status);

  const pages = getPaginationRange(pagination.page, pagination.totalPages);

  const categories = await getProductCategories();

  // ✅ Đây là Server Action
  async function deleteProductAction(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;

    // Lấy toàn bộ cookie của user hiện tại
    const cookieStore = cookies();
    const cookieHeader = (await cookieStore)
      .getAll()
      .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
      .join('; ');

    // Gửi kèm cookie này sang backend
    await moveProductToTrash(id, cookieHeader);
    revalidatePath('/admin/products'); // reload lại data
    revalidatePath('/admin/products/trash'); // reload lại data trash
  }

  return (
    <>
      <AdminPageHeader
        title="Danh sách sản phẩm"
        action={
          <Link
            href="/admin/products/create"
            className="ml-auto rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 transition inline-block"
          >
            Thêm sản phẩm
          </Link>
        }
        count={pagination.total}
        children={<ProductStatusFilter />}
      />

      <AdminCard>
        <AdminTable
          isEmpty={products.length === 0}
          emptyText="Không có sản phẩm"
          thead={
            <tr className="text-gray-500 border-b-1 border-b-blue-100 text-left">
              <th className="px-1 py-4 text-center w-[50]">STT</th>
              <th className="px-4 py-4 text-center">Tiêu đề</th>
              <th className="px-1 py-4 w-[130]">Tác giả</th>
              <th className="px-1 py-4 w-[130]">Giá</th>
              <th className="px-1 py-4 w-[130]">Chuyên mục</th>
              <th className="px-1 py-4 w-[130]">Ngày tạo</th>
              <th className="px-1 py-4 w-[80]">Tồn kho</th>
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
                <p>{product.author?.fullName}</p>
                {product.updatedBy?.fullName ? (
                  <>
                    Người sửa:{' '}
                    <span className="font-bold">
                      {product.updatedBy?.fullName}
                    </span>
                  </>
                ) : (
                  ''
                )}
              </td>
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
              <td className="px-4 py-4 text-right">
                <AdminRowActions
                  editHref={`/admin/products/edit/${product._id}`}
                  onDelete={
                    <form action={deleteProductAction}>
                      <input type="hidden" name="id" value={product._id} />
                      <button
                        type="submit"
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition text-sm w-full cursor-pointer"
                      >
                        Xóa
                      </button>
                    </form>
                  }
                />
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
