'use client';

import { ChevronLeft } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { User } from '@/lib/types';

import { ROLE_OPTIONS } from '@/utils/constants/roleOptions';
import { editUser, getUserById } from '@/lib/api/apiUserClient';
import Input from '@/components/ui/forms/Input';
import Select from '@/components/ui/forms/Select';
import Button from '@/components/ui/forms/Button';
import LoadingClient from '@/components/ui/Loading/LoadingClient';
import VietnamAddressSelect from '@/components/ui/forms/VietnamAddressSelect';

function EditUserPage() {
  const router = useRouter();
  const params = useParams();

  const id = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState('');
  const [address, setAddress] = useState('');
  const [loadingPage, setLoadingPage] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [isPending, startTransition] = useTransition();

  // ⭐ fetch user detail
  useEffect(() => {
    async function fetchUser() {
      setLoadingPage(true);
      setFetchError(null);
      try {
        const data = await getUserById(id);

        if (!data) {
          setFetchError(
            'Không tìm thấy user hoặc bạn không có quyền truy cập.',
          );
          setUser(null);
          return;
        }

        setUser(data);
        setRole(data.role);
        setAddress(data.address ?? '');
      } catch (err) {
        console.error(err);
        setFetchError('Lỗi kết nối, vui lòng thử lại.');
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
      await editUser(id, { role, address });

      // ⭐ redirect sau khi edit
      startTransition(() => {
        router.push('/admin/users');
      });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
      setLoadingSubmit(false); // chỉ tắt khi lỗi
    }
  }

  if (loadingPage) return <LoadingClient />;
  if (!user) return <div>{fetchError ?? 'User không tồn tại'}</div>;

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
      <div className="flex items-center justify-center mt-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-center mb-6">
            Chỉnh sửa thành viên
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

            <VietnamAddressSelect
              label="Địa chỉ"
              value={address}
              onChange={setAddress}
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
