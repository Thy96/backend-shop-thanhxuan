import Link from 'next/link';

import { getTrashNotes } from '@/lib/api/noteQueries';
import {
  serverRestoreNote,
  serverForceDeleteNote,
} from '@/app/actions/noteActions';
import { NoteProps, PaginationProps } from '@/lib/types';
import { getNoteCategories } from '@/lib/api/noteCategoryQueries';

import { getPaginationRange } from '@/utils/pagination';
import { getCategoryLabel } from '@/utils/category';
import { formatDeletedDate } from '@/utils/format';

import AdminPageHeader from '@/components/Layout/Pages/AdminPageHeader';
import AdminCard from '@/components/Layout/Pages/AdminCard';
import AdminTable from '@/components/Layout/Pages/AdminTable';
import AdminPagination from '@/components/Layout/Pages/AdminPagination';
import RestoreButton from '@/components/RestoreButton/RestoreButton';
import ForceDeleteButton from '@/components/ForceDeleteButton/ForceDeleteButton';

export default async function TrashNotesPage({
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
  } = await getTrashNotes(page, limit);

  const pages = getPaginationRange(pagination.page, pagination.totalPages);

  const categories = await getNoteCategories();

  return (
    <>
      <AdminPageHeader
        title="Thùng rác"
        action={
          <Link
            href="/admin/notes"
            className="ml-auto rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 transition inline-block"
          >
            Quay lại danh sách
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
              <th className="px-1 py-4 text-center w-[130]">Ngày xóa</th>
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
              <td className="px-1 py-4">{formatDeletedDate(note.deletedAt)}</td>

              <td className="px-4 py-4 text-right flex flex-col gap-2">
                {/* Restore */}
                <RestoreButton
                  id={note._id}
                  serverAction={serverRestoreNote}
                  confirmText="Bạn có chắc chắn muốn khôi phục bài viết này?"
                  loadingText="Đang khôi phục bài viết..."
                  errorText="Lỗi khi khôi phục bài viết. Vui lòng thử lại."
                  buttonText="Khôi phục"
                  onName="RestoreNote"
                />

                {/* Force delete */}
                <ForceDeleteButton
                  id={note._id}
                  serverAction={serverForceDeleteNote}
                  confirmText="Bạn có chắc chắn muốn xóa vĩnh viễn bài viết này? Không thể khôi phục!"
                  loadingText="Đang xóa bài viết vĩnh viễn..."
                  errorText="Lỗi khi xóa bài viết. Vui lòng thử lại."
                  buttonText="Xóa vĩnh viễn"
                  onName="ForceDeleteNote"
                />
              </td>
            </tr>
          ))}
        />
      </AdminCard>

      <AdminPagination pagination={pagination} pages={pages} page="notes" />
    </>
  );
}
