'use client';

import React, { useEffect, useState } from 'react';

import Button from '@/components/ui/forms/Button';
import Input from '@/components/ui/forms/Input';
import LoadingClient from '@/components/ui/Loading/LoadingClient';
import VietnamAddressSelect from '@/components/ui/forms/VietnamAddressSelect';

import useMe from '@/lib/hook/useMe';

export default function ProfilePage() {
  const { user, setUser, loading } = useMe();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      console.log('[Profile] user.address:', JSON.stringify(user.address));
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/admin/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, phone, address }),
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage('✅ Cập nhật thông tin thành công');
      setUser((prev) => prev && { ...prev, fullName, phone, address });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loading) {
    return <LoadingClient />;
  }

  if (error && !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      {loadingSubmit && <LoadingClient />}
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8 m-auto">
        {/* Title */}
        <h2 className="text-2xl font-semibold text-center mb-6">
          Thông tin cá nhân
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <Input
            label="Email"
            value={user.email}
            disabled
            name="email"
            classNames={{
              input:
                'border-gray-300 !bg-gray-200 text-gray-600 cursor-not-allowed',
            }}
          />

          {/* Full Name */}
          <Input
            id="fullName"
            label="Họ tên"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            name="fullName"
          />

          {/* Sdt */}
          <Input
            id="phone"
            label="Số điện thoại"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            name="phone"
          />

          {/* Address */}
          <VietnamAddressSelect
            label="Địa chỉ"
            value={address}
            onChange={(val) => setAddress(val)}
          />

          {/* Role */}
          <div className="mb-6">
            <label className="block mb-1 text-lg font-medium text-gray-700">
              Chức vụ
            </label>
            <span className="inline-block rounded-full bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1">
              {user.role.toUpperCase()}
            </span>
          </div>

          {/* Messages */}
          {message && (
            <p className="text-green-600 text-sm mb-3 text-center">{message}</p>
          )}
          {error && (
            <p className="text-red-500 text-sm mb-3 text-center">{error}</p>
          )}

          {/* Button */}
          <Button type="submit">Cập nhật thông tin</Button>
        </form>
      </div>
    </>
  );
}
