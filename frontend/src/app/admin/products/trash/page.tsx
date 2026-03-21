import Link from 'next/link';

import { getTrashProducts } from '@/lib/api/productQueries';
import { getProductCategories } from '@/lib/api/productCategoryQueries';
import {
  serverRestoreProduct,
  serverForceDeleteProduct,
} from '@/app/actions/productActions';
import { PaginationProps, ProductProps } from '@/lib/types';

import { getPaginationRange } from '@/utils/format/pagination';
import { getCategoryLabel } from '@/utils/format/category';
import { finalPrice, formatDate, formatNumber } from '@/utils/format/format';

import AdminPageHeader from '@/components/layout/Admin/AdminPageHeader';
import AdminCard from '@/components/layout/Admin/AdminCard';
import AdminTable from '@/components/layout/Admin/AdminTable';
import AdminPagination from '@/components/layout/Admin/AdminPagination';
import RestoreButton from '@/components/ui/actions/RestoreButton';
import ForceDeleteButton from '@/components/ui/actions/ForceDeleteButton';

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
                <RestoreButton
                  id={product._id}
                  serverAction={serverRestoreProduct}
                  confirmText="Bạn có chắc chắn muốn khôi phục sản phẩm này?"
                  loadingText="Đang khôi phục sản phẩm..."
                  errorText="Lỗi khi khôi phục sản phẩm. Vui lòng thử lại."
                  buttonText="Khôi phục"
                  onName="RestoreProduct"
                />

                {/* Force delete */}
                <ForceDeleteButton
                  id={product._id}
                  serverAction={serverForceDeleteProduct}
                  confirmText="Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm này? Không thể khôi phục!"
                  loadingText="Đang xóa sản phẩm vĩnh viễn..."
                  errorText="Lỗi khi xóa sản phẩm. Vui lòng thử lại."
                  buttonText="Xóa vĩnh viễn"
                  onName="ForceDeleteProduct"
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
