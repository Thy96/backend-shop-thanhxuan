'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import Input from '@/components/ui/forms/Input';
import Button from '@/components/ui/forms/Button';
import LoadingClient from '@/components/ui/Loading/LoadingClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr({});
    setIsLoading(true);

    try {
      // Phần này fetch vào folder auth login
      const res = await fetch(`/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // để browser nhận cookie
      });

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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded shadow w-80 space-y-4"
      >
        {isLoading && <LoadingClient text="Đang đăng nhập..." />}
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
        <Button type="submit" className="mb-2" disabled={isLoading}>
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
