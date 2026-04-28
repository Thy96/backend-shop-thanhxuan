export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import Link from 'next/link';

import { getProducts } from '@/lib/api/productQueries';
import { serverMoveProductToTrash } from '@/app/actions/productActions';
import { PaginationProps, ProductProps } from '@/lib/types';

import { getPaginationRange } from '@/utils/format/pagination';
import { CategoryOption } from '@/utils/format/category';
import { finalPrice, formatDate, formatNumber } from '@/utils/format/format';

import AdminPageHeader from '@/components/layout/Admin/AdminPageHeader';
import AdminCard from '@/components/layout/Admin/AdminCard';
import AdminTable from '@/components/layout/Admin/AdminTable';
import AdminRowActions from '@/components/layout/Admin/AdminRowActions';
import AdminPagination from '@/components/layout/Admin/AdminPagination';
import RemoveButton from '@/components/ui/actions/RemoveButton';
import StatusFilter from '@/components/ui/filters/StatusFilter';

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
      >
        <Suspense>
          <StatusFilter
            basePath="/admin/products"
            options={[
              { value: 'draft', label: 'Bản nháp' },
              { value: 'available', label: 'Xuất bản' },
            ]}
          />
        </Suspense>
      </AdminPageHeader>

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
              <th className="px-1 py-4 w-[80]">Điểm</th>
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
              <td className="px-4 py-4 max-w-[220px]">
                <p className="truncate" title={product.title}>
                  {product.title}
                </p>
              </td>
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
                  '—'
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
                {(product.categories || [])
                  .map((c: CategoryOption) => c.name)
                  .join(', ') || '—'}
              </td>
              <td className="px-1 py-4">
                {formatDate(product.createdAt, product.updatedAt)}
              </td>
              <td className="px-1 py-4 text-center">{product.stock}</td>
              <td className="px-1 py-4 text-center">
                <span className="inline-block bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {formatNumber(product.points ?? 0)}
                </span>
              </td>
              <td className="px-4 py-4 text-right">
                <AdminRowActions
                  detailHref={`/admin/products/${product._id}`}
                  editHref={`/admin/products/edit/${product._id}`}
                  onDelete={
                    <RemoveButton
                      id={product._id}
                      serverAction={serverMoveProductToTrash}
                      confirmText="Bạn có chắc chắn muốn xóa sản phẩm này?"
                      loadingText="Đang xóa sản phẩm..."
                      errorText="Lỗi khi xóa sản phẩm. Vui lòng thử lại."
                      buttonText="Xóa"
                      onName="DeleteProduct"
                    />
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
