'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { ChevronLeft } from 'lucide-react';

import { CreateUserDTO } from '@/lib/types';
import { createUser } from '@/lib/api/apiUserClient';

import { ROLE_OPTIONS } from '@/utils/roleOptions';

import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import Select from '@/components/Select/Select';
import LoadingClient from '@/components/Loading/LoadingClient';

function CreateUserForm() {
  const router = useRouter();

  const [form, setForm] = useState<CreateUserDTO>({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    address: '',
    role: 'user',
  });

  const [isPending, startTransition] = useTransition();
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState('');

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoadingSubmit(true);

    const data = {
      email: form.email,
      password: form.password,
      fullName: form.fullName || '',
      phone: form.phone,
      address: form.address || '',
      role: form.role || 'user',
    };

    try {
      await createUser(data);
      startTransition(() => {
        router.push('/admin/users');
      });
    } catch (err: any) {
      setError(err.message);
      setLoadingSubmit(false);
    }
  }

  return (
    <>
      {(loadingSubmit || isPending) && (
        <LoadingClient text="Đang tạo user..." />
      )}
      <Button
        type="button"
        onClick={() => router.push('/admin/users')}
        className="bg-blue-500 text-white px-4 pr-8 py-2 rounded hover:bg-blue-600 cursor-pointer flex justify-center max-w-[150]"
      >
        <ChevronLeft width={23} height={23} /> Quay Lại
      </Button>
      <form onSubmit={handleSubmit} className="space-y-2 mt-4">
        {/* name */}
        <Input
          id="fullName"
          placeholder="Nhập họ và tên..."
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          required
          label="Họ và tên"
        />

        <Input
          id="phone"
          placeholder="Nhập số điện thoại..."
          name="phone"
          value={form.phone}
          onChange={handleChange}
          required
          label="Số điện thoại"
        />

        {/* email */}
        <Input
          id="email"
          placeholder="Nhập email..."
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          label="Email"
        />

        {/* password */}
        <Input
          id="password"
          placeholder="Nhập mật khẩu..."
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
          label="Mật khẩu"
        />

        <Input
          id="address"
          placeholder="Nhập địa chỉ..."
          name="address"
          value={form.address}
          onChange={handleChange}
          required
          label="Địa chỉ"
        />

        {/* role */}
        <Select
          label="Phân quyền"
          name="role"
          onChange={handleChange}
          options={ROLE_OPTIONS}
          value={form.role}
        />

        {/* error */}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* button */}
        <Button type="submit">Tạo thành viên</Button>
      </form>
    </>
  );
}

export default CreateUserForm;
