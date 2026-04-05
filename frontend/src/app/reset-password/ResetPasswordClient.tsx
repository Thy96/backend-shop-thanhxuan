'use client';

import { ReactNode, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { API_URL } from '@/utils/helps';

import Input from '@/components/ui/forms/Input';
import Button from '@/components/ui/forms/Button';
import LoadingClient from '@/components/ui/Loading/LoadingClient';

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<ReactNode>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || password.length < 6) {
      return setError('Mật khẩu tối thiểu 6 ký tự');
    }

    if (password !== confirm) {
      return setError('Mật khẩu không khớp');
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/admin/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return setError(data.message || 'Lỗi reset mật khẩu');
      }

      setSuccess(
        <>
          Đổi mật khẩu thành công! <br />
          Trở lại trang đăng nhập sau vài giây!
        </>,
      );
      setTimeout(() => router.push('/login'), 2000);
    } catch {
      setError('Đã xảy ra lỗi, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded">
      {loading && <LoadingClient text="Đang đặt lại mật khẩu..." />}
      <h2 className="text-xl font-bold mb-4">Thay Đổi Mật Khẩu</h2>

      {!success && error && <p className="text-red-500 mb-3">{error}</p>}
      {success && <p className="text-green-600 mb-3">{success}</p>}

      <form onSubmit={handleSubmit}>
        <Input
          type="password"
          placeholder="Mật khẩu mới"
          className="border p-2 w-full mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Input
          type="password"
          placeholder="Nhập lại mật khẩu mới"
          className="border p-2 w-full mb-3"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        <Button type="submit">Đổi mật khẩu</Button>
      </form>
    </div>
  );
}
