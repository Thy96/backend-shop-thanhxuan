'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { API_URL } from '@/utils/helps';

import Input from '@/components/Input/Input';
import Button from '@/components/Button/Button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr({});

    try {
      // Phần này fetch vào folder auth login
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // để browser nhận cookie
          body: JSON.stringify({ email, password }),
        },
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Trường hợp backend trả lỗi validate
        if (data?.errors) {
          setErr(data.errors);
        } else {
          setErr({ general: data?.message || 'Đăng nhập thất bại' });
        }
        return;
      }

      // ✅ Thành công
      router.push('/admin');
    } catch (error) {
      console.error('Login error:', error);
      setErr({
        general: 'Không thể kết nối đến máy chủ. Vui lòng thử lại.',
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded shadow w-80 space-y-4"
      >
        <h2 className="text-xl font-bold">Đăng Nhập</h2>
        <div>
          <Input
            id="email"
            type="email"
            name="email"
            placeholder="Email"
            className={`border p-2 w-full rounded ${
              err.email ? 'border-red-500' : ''
            }`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={err.email}
          />
        </div>
        <div>
          <Input
            id="password"
            type="password"
            name="password"
            placeholder="Password"
            className={`border p-2 w-full rounded ${
              err.password ? 'border-red-500' : ''
            }`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={err.password}
          />
        </div>
        {/* Lỗi chung từ server */}
        {err.general && <p className="text-red-600 text-sm">{err.general}</p>}
        <Button type="submit" className="mb-2">
          Đăng Nhập
        </Button>

        <div className="flex gap-1 text-sm">
          <Link
            href={'/forgot-password'}
            className="text-red-500 hover:text-red-400 duration-100 hover:underline hover:decoration-solid"
          >
            Quên mật khẩu
          </Link>
        </div>
      </form>
    </div>
  );
}
