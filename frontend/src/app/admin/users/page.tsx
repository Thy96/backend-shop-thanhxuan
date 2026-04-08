export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

import { blockUser, getUsers, resendVerifyUser } from '@/lib/api/userQueries';
import { getMe } from '@/lib/api/apiAuth';
import { PaginationProps, User } from '@/lib/types';

import { getPaginationRange } from '@/utils/format/pagination';
import { formatDate } from '@/utils/format/format';

import AdminPageHeader from '@/components/layout/Admin/AdminPageHeader';
import AdminPagination from '@/components/layout/Admin/AdminPagination';
import AdminCard from '@/components/layout/Admin/AdminCard';
import AdminTable from '@/components/layout/Admin/AdminTable';
import AdminRowActions from '@/components/layout/Admin/AdminRowActions';
import BlockUserButton from '@/components/layout/Admin/BlockUserButton';

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const me = await getMe();
  const isAdmin = me?.user?.role === 'admin';
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = 10;

  const {
    data: users,
    pagination,
  }: {
    data: User[];
    pagination: PaginationProps;
  } = await getUsers(page, limit);

  const pages = getPaginationRange(pagination.page, pagination.totalPages);

  const handleBlock = async (formData: FormData) => {
    'use server';

    const id = formData.get('id') as string;

    const cookieStore = cookies();
    const cookieHeader = (await cookieStore)
      .getAll()
      .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
      .join('; ');

    await blockUser(id, cookieHeader); // gọi api BE

    revalidatePath('/admin/users');
  };

  const handleResendVerify = async (formData: FormData) => {
    'use server';

    const email = formData.get('email') as string;

    const cookieStore = cookies();
    const cookieHeader = (await cookieStore)
      .getAll()
      .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
      .join('; ');

    await resendVerifyUser(email, cookieHeader);

    revalidatePath('/admin/users');
  };
  return (
    <>
      <AdminPageHeader
        title="Danh sách thành viên"
        count={pagination.total}
        action={
          isAdmin && (
            <Link
              href="/admin/users/create"
              className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 transition"
            >
              Tạo tài khoản
            </Link>
          )
        }
      />

      <AdminCard>
        <AdminTable
          isEmpty={users.length === 0}
          emptyText="Không có user"
          thead={
            <tr className="text-gray-500 border-b-1 border-b-blue-100 text-left">
              <th className="px-1 py-4 text-center w-[50]">STT</th>
              <th className="px-4 py-4">Họ và tên</th>
              <th className="px-1 py-4 text-center w-[200]">Tài khoản</th>
              <th className="px-1 py-4 text-center w-[130]">SDT</th>
              <th className="px-1 py-4 w-[70]">Role</th>
              <th className="px-1 py-4 w-[160]">Ngày tạo</th>
              <th className="px-1 py-4 w-[100] text-center">Xác thực</th>
              <th className="px-1 py-4 w-[100] text-center">Trạng thái</th>
              {isAdmin && <th className="px-4 py-4 text-right w-[150]"></th>}
            </tr>
          }
          tbody={users.map((user, index) => {
            const isSelf = me?.user?._id === user._id;
            return (
              <tr
                key={user._id}
                className={`transition-colors break-words ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                } ${user.isBlocked ? 'bg-red-50 text-gray-400 line-through' : ''} ${!user.isBlocked && (index % 2 === 0 ? 'bg-white' : 'bg-gray-50')} ${!user.isBlocked && 'hover:bg-gray-100'}`}
              >
                <td className="px-1 py-4 text-center">
                  {(pagination.page - 1) * limit + index + 1}
                </td>
                <td className="px-4 py-4">{user.fullName}</td>
                <td className="px-1 py-4">{user.email}</td>
                <td className="px-1 py-4 text-center">{user.phone}</td>
                <td className="px-1 py-4">{user.role}</td>
                <td className="px-1 py-4">
                  {formatDate(user.createdAt, user.updatedAt)}
                </td>
                <td className="px-1 py-4">
                  <div className="flex justify-center items-center">
                    {user.isVerified ? (
                      <span className="text-green-600 text-xs font-semibold">
                        ✓ Đã xác thực
                      </span>
                    ) : (
                      <form action={handleResendVerify}>
                        <input type="hidden" name="email" value={user.email} />
                        <button
                          type="submit"
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs transition cursor-pointer"
                        >
                          Gửi xác thực
                        </button>
                      </form>
                    )}
                  </div>
                </td>
                <td className="px-1 py-4">
                  <div className="flex justify-center items-center">
                    <span className={`relative flex h-3 w-3`}>
                      {user.isActive && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      )}
                      <span
                        className={`relative inline-flex rounded-full h-3 w-3 ${
                          user.isActive ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      ></span>
                    </span>
                  </div>
                </td>
                {isAdmin && (
                  <td className="px-4 py-4 text-right">
                    <AdminRowActions
                      editHref={
                        !user.isBlocked && !isSelf
                          ? `/admin/users/edit/${user._id}`
                          : undefined
                      }
                      onDelete={
                        !isSelf && (
                          <BlockUserButton
                            id={user._id}
                            isBlocked={user.isBlocked}
                            action={handleBlock}
                          />
                        )
                      }
                    />
                  </td>
                )}
              </tr>
            );
          })}
        />
      </AdminCard>

      {/* Pagination */}
      <AdminPagination pagination={pagination} pages={pages} page="users" />
    </>
  );
}
