export const dynamic = 'force-dynamic';

import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { getProductById, getProductComments } from '@/lib/api/productQueries';
import { ProductProps, ProductComment, PaginationProps } from '@/lib/types';
import { getPaginationRange } from '@/utils/format/pagination';
import { finalPrice, formatDate, formatNumber } from '@/utils/format/format';

import AdminPageHeader from '@/components/layout/Admin/AdminPageHeader';
import AdminCard from '@/components/layout/Admin/AdminCard';
import AdminPagination from '@/components/layout/Admin/AdminPagination';
import { CategoryOption } from '@/utils/format/category';

const STAR_FILLED = '★';
const STAR_EMPTY = '☆';

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-yellow-400 text-base">
      {Array.from({ length: 5 }, (_, i) =>
        i < rating ? STAR_FILLED : STAR_EMPTY,
      ).join('')}
    </span>
  );
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const page = Number(sp.page) || 1;

  let product: ProductProps;
  let comments: ProductComment[] = [];
  let pagination: PaginationProps = {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  };

  try {
    product = await getProductById(id);
  } catch {
    notFound();
  }

  try {
    const result = await getProductComments(id, page, 10);
    comments = result.data ?? [];
    pagination = result.pagination ?? pagination;
  } catch {
    // Không crash nếu lỗi fetch comments
  }

  const pages = getPaginationRange(pagination.page, pagination.totalPages);
  const thumbnail = product!.images?.[0];

  return (
    <>
      <AdminPageHeader
        title={product!.title}
        action={
          <div className="flex gap-2 justify-end">
            <Link
              href={`/admin/products/edit/${id}`}
              className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 transition inline-block"
            >
              Chỉnh sửa
            </Link>
            <Link
              href="/admin/products"
              className="rounded-md bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 transition inline-block"
            >
              Quay lại
            </Link>
          </div>
        }
      />

      {/* Product info */}
      <AdminCard>
        <div className="p-6 flex gap-6 flex-col md:flex-row">
          {/* Images */}
          {product!.images && product!.images.length > 0 && (
            <div className="flex gap-2 flex-wrap shrink-0">
              {product!.images.map((img, idx) => (
                <Image
                  key={idx}
                  src={img}
                  width={100}
                  height={100}
                  alt={`${product!.title} - ảnh ${idx + 1}`}
                  className="w-full h-32 object-cover rounded-lg border"
                />
              ))}
            </div>
          )}

          {/* Details */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Tiêu đề:</span>
              <p className="font-semibold mt-0.5">{product!.title}</p>
            </div>
            <div>
              <span className="text-gray-500">Trạng thái:</span>
              <p className="mt-0.5">
                {product!.status === 'available' ? (
                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    Xuất bản
                  </span>
                ) : (
                  <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                    Bản nháp
                  </span>
                )}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Giá:</span>
              <p className="font-semibold mt-0.5">
                {product!.sale > 0 ? (
                  <span className="flex items-center gap-2">
                    <span className="text-gray-400 line-through">
                      {formatNumber(product!.price)}₫
                    </span>
                    <span className="text-red-500">
                      {finalPrice(product!.price, product!.sale)}₫
                    </span>
                    <span className="bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded">
                      -{product!.sale}%
                    </span>
                  </span>
                ) : (
                  <span>{finalPrice(product!.price)}₫</span>
                )}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Tồn kho:</span>
              <p className="font-semibold mt-0.5">{product!.stock}</p>
            </div>
            <div>
              <span className="text-gray-500">Điểm tích lũy:</span>
              <p className="font-semibold mt-0.5">
                {formatNumber(product!.points ?? 0)}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Danh mục:</span>
              <p className="mt-0.5">
                {(product.categories || [])
                  .map((c: CategoryOption) => c.name)
                  .join(', ') || '—'}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Tác giả:</span>
              <p className="mt-0.5">{product.author?.fullName}</p>
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
            </div>
          </div>
        </div>
      </AdminCard>

      {/* Comments section */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Bình luận ({pagination.total})
        </h3>

        <AdminCard>
          {comments.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              Chưa có bình luận nào
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {comments.map((comment) => (
                <div key={comment._id} className="p-4 flex gap-4">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm shrink-0">
                    {(comment.userId?.fullName || comment.userId?.email || '?')
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-gray-800">
                        {comment.userId?.fullName ||
                          comment.userId?.email ||
                          'Ẩn danh'}
                      </span>
                      <StarRating rating={comment.rating} />
                      <span className="text-xs text-gray-400 ml-auto">
                        {formatDate(product.createdAt, product.updatedAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 break-words">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AdminCard>

        {pagination.totalPages > 1 && (
          <AdminPagination
            pagination={pagination}
            pages={pages}
            page={`products/${id}`}
          />
        )}
      </div>
    </>
  );
}
