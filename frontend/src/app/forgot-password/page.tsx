'use client';
import { useState } from 'react';
import Link from 'next/link';
import { API_URL } from '@/utils/helps';

import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import LoadingClient from '@/components/Loading/LoadingClient';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoadingSubmit(true);

    // TODO: gọi API reset password ở đây
    try {
      const res = await fetch(`${API_URL}/api/admin/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Không thể gửi email');
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <>
      {loadingSubmit && <LoadingClient text="Đang gửi yêu cầu..." />}
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
          <h1 className="text-2xl font-semibold text-center mb-2">
            Quên Mật Khẩu
          </h1>

          <p className="text-sm text-gray-500 text-center mb-6">
            Nhập email của bạn và chúng tôi sẽ gửi đường dẫn khôi phục mật khẩu.
          </p>

          {success ? (
            <div className="text-green-600 text-center font-medium">
              ✅ Đường dẫn khôi phục mật khẩu đã được gửi!
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Button type="submit">Gửi</Button>
            </form>
          )}

          <div className="text-center mt-4">
            <Link
              href="/login"
              className="text-sm text-blue-600 hover:underline"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
