'use client';
import React, { useState } from 'react';

import Button from '@/components/ui/forms/Button';
import Input from '@/components/ui/forms/Input';
import LoadingClient from '@/components/ui/Loading/LoadingClient';

import { changePassword } from '@/lib/api/apiChangePassword';

function ProfilePage() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess('');
    setErrorMsg('');

    if (form.newPassword !== form.confirmPassword) {
      setErrors({ confirmPassword: 'Mật khẩu xác nhận không khớp' });
      return;
    }

    setLoadingSubmit(true);

    try {
      const res = await changePassword(form);
      setSuccess(res.message); // ✅ hiển thị thành công
      setForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: unknown) {
      if (err !== null && typeof err === 'object' && 'errors' in err) {
        setErrors((err as { errors: Record<string, string> }).errors);
      } else {
        setErrorMsg(
          err instanceof Error
            ? err.message
            : 'Có lỗi xảy ra. Vui lòng thử lại.',
        );
      }
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <>
      {loadingSubmit && <LoadingClient text="Đang đổi mật khẩu..." />}
      <div className="flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-center mb-6">
            Đổi Mật Khẩu
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Current Password */}
            <Input
              id="currentPassword"
              label="Mật khẩu hiện tại"
              type="password"
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              placeholder="Nhập mật khẩu hiện tại"
              error={errors.currentPassword}
            />

            {/* New Password */}
            <Input
              id="newPassword"
              label="Mật khẩu mới"
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="Nhập mật khẩu mới"
              error={errors.newPassword}
            />

            {/* Confirm Password */}
            <Input
              id="confirmPassword"
              label="Xác nhận mật khẩu mới"
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu"
              error={errors.confirmPassword}
            />

            <Button type="submit">Đổi mật khẩu</Button>

            {success && (
              <p className="text-green-600 text-center font-medium mt-3">
                {success}
              </p>
            )}

            {errorMsg && (
              <p className="text-red-600 text-center font-medium mt-3">
                {errorMsg}
              </p>
            )}
          </form>
        </div>
      </div>
    </>
  );
}

export default ProfilePage;
