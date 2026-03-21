export const dynamic = 'force-dynamic';

import Link from 'next/link';

import { getNotes } from '@/lib/api/noteQueries';
import { getNoteCategories } from '@/lib/api/noteCategoryQueries';
import { serverMoveNoteToTrash } from '@/app/actions/noteActions';
import { NoteProps, PaginationProps } from '@/lib/types';

import { getCategoryLabel } from '@/utils/format/category';
import { formatDate } from '@/utils/format/format';
import { getPaginationRange } from '@/utils/format/pagination';

import AdminPageHeader from '@/components/layout/Admin/AdminPageHeader';
import AdminCard from '@/components/layout/Admin/AdminCard';
import AdminTable from '@/components/layout/Admin/AdminTable';
import AdminRowActions from '@/components/layout/Admin/AdminRowActions';
import AdminPagination from '@/components/layout/Admin/AdminPagination';
import DeleteButton from '@/components/ui/actions/DeleteButton';

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = 10;

  const {
    data: notes,
    pagination,
  }: {
    data: NoteProps[];
    pagination: PaginationProps;
  } = await getNotes(page, limit);

  const pages = getPaginationRange(pagination.page, pagination.totalPages);

  const categories = await getNoteCategories();

  return (
    <>
      <AdminPageHeader
        title="Danh sách bài viết"
        action={
          <Link
            href="/admin/notes/create"
            className="ml-auto rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 transition inline-block"
          >
            Thêm bài viết
          </Link>
        }
        count={pagination.total}
      />

      <AdminCard>
        <AdminTable
          isEmpty={notes.length === 0}
          emptyText="Không có bài viết"
          thead={
            <tr className="text-gray-500 border-b-1 border-b-blue-100 text-left">
              <th className="px-1 py-4 text-center w-[50]">STT</th>
              <th className="px-4 py-4 text-center">Tiêu đề</th>
              <th className="px-1 py-4 w-[130]">Tác giả</th>
              <th className="px-1 py-4 w-[130]">Chuyên mục</th>
              <th className="px-1 py-4 text-center w-[130]">Ngày tạo</th>
              <th className="px-4 py-4 text-right w-[150]"></th>
            </tr>
          }
          tbody={notes.map((note: NoteProps, index: number) => (
            <tr
              key={note._id}
              className={`transition-colors ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              } hover:bg-gray-100`}
            >
              <td className="px-1 py-4 text-center">
                {(pagination.page - 1) * limit + index + 1}
              </td>
              <td className="px-4 py-4">{note.title}</td>
              <td className="px-1 py-4">
                <p>{note.author.fullName}</p>
                {note.updatedBy?.fullName ? (
                  <>
                    Người sửa:{' '}
                    <span className="font-bold">
                      {note.updatedBy?.fullName}
                    </span>
                  </>
                ) : (
                  ''
                )}
              </td>
              <td className="px-1 py-4">
                {getCategoryLabel(note.categoryId, categories)}
              </td>
              <td className="px-1 py-4">
                {formatDate(note.createdAt, note.updatedAt)}
              </td>

              <td className="px-4 py-4 text-right">
                <AdminRowActions
                  editHref={`/admin/notes/edit/${note._id}`}
                  onDelete={
                    <DeleteButton
                      id={note._id}
                      serverAction={serverMoveNoteToTrash}
                      confirmText="Bạn có chắc chắn muốn xóa bài viết này?"
                      loadingText="Đang xóa bài viết..."
                      errorText="Lỗi khi xóa bài viết. Vui lòng thử lại."
                      buttonText="Xóa"
                      onName="DeleteNote"
                    />
                  }
                />
              </td>
            </tr>
          ))}
        />
      </AdminCard>

      {/* Pagination */}
      <AdminPagination pagination={pagination} pages={pages} page="notes" />
    </>
  );
}
