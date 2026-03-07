'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter, useParams } from 'next/navigation';

import Input from '@/components/Input/Input';
import { editUser, getUserById } from '@/lib/api/apiUserClient';
import Select from '@/components/Select/Select';
import Button from '@/components/Button/Button';
import { ChevronLeft } from 'lucide-react';
import LoadingClient from '@/components/Loading/LoadingClient';

export const ROLE_OPTIONS = [
  { label: 'user', value: 'user' },
  { label: 'editor', value: 'editor' },
  { label: 'admin', value: 'admin' },
];

function EditUserPage() {
  const router = useRouter();
  const params = useParams();

  const id = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState('');
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [isPending, startTransition] = useTransition();

  // ⭐ fetch user detail
  useEffect(() => {
    async function fetchUser() {
      setLoadingPage(true);
      try {
        const data = await getUserById(id);

        if (!data) {
          setUser(null);
          return;
        }

        setUser(data);
        setRole(data.role); // ⭐ set role mặc định
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPage(false);
      }
    }

    if (id) fetchUser();
  }, [id]);

  // ⭐ submit edit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoadingSubmit(true);

    try {
      await editUser(id, { role });

      // ⭐ redirect sau khi edit
      startTransition(() => {
        router.push('/admin/users');
      });
    } catch (err: any) {
      alert(err.message);
      setLoadingSubmit(false); // chỉ tắt khi lỗi
    }
  }

  if (loadingPage) return <LoadingClient />;
  if (!user) return <div>User không tồn tại</div>;

  return (
    <>
      {(loadingSubmit || isPending) && (
        <LoadingClient text="Đang cập nhật thông tin..." />
      )}
      <Button
        type="button"
        onClick={() => router.push('/admin/users')}
        className="bg-blue-500 text-white px-4 pr-8 py-2 rounded hover:bg-blue-600 cursor-pointer flex justify-center max-w-[150]"
      >
        <ChevronLeft width={23} height={23} /> Quay Lại
      </Button>
      <div className="flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-center mb-6">
            Chỉnh sửa User
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Họ và tên" defaultValue={user.fullName} disabled />
            <Input label="Số điện thoại" defaultValue={user.phone} disabled />

            <Select
              label="Phân quyền"
              onChange={(e) => setRole(e.target.value)}
              options={ROLE_OPTIONS}
              defaultValue={user.role}
            />

            <Button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Cập nhật thông tin
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}

export default EditUserPage;
