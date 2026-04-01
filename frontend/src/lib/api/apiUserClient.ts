export async function getUserById(id: string) {
  const res = await fetch(`/api/admin/users/${id}`, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!res.ok) return null;
  return res.json();
}

export async function createUser(user: {
  email: string;
  fullName: string;
  password: string;
  phone: string;
  address: string;
  role: string;
}) {
  const res = await fetch(`/api/admin/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
    credentials: 'include',
  });

  const data = await res.json()

  if (!res.ok) {
    const errorMsg =
      data.message ||
      Object.values(data.errors || {})[0] ||
      'Có lỗi xảy ra';

    throw new Error(errorMsg as string);
  }

  return data;
}

export async function editUser(id: string, data: {
  fullName?: string;
  phone?: string;
  role?: string;
  address?: string;
}) {
  const res = await fetch(`/api/admin/users/${id}`, {
    method: "PUT",
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Cập nhật user thất bại');
  }

  return res.json();
}