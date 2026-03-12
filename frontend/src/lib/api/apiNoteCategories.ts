import { cookies } from 'next/headers';

export async function getNoteCategories() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
    .join('; ');

  const res = await fetch(`/api/admin/notes/categories`, {
    cache: "no-store",
    credentials: 'include',
    headers: {
      cookie: cookieHeader,
    },
  });
  return res.json();
}

export async function getNoteCategoryById(id: string) {
  const res = await fetch(`/api/admin/notes/categories/${id}`, { cache: "no-store" });
  return res.json();
}

export async function createNoteCategory(categories: { name: string }) {
  const formData = new FormData();
  formData.append("name", categories.name);

  const res = await fetch(`/api/admin/notes/categories`, {
    method: "POST",
    body: formData,
    credentials: 'include',
  });

  return res.json();
}

export async function updateNoteCategory(id: string, categories: { name: string }) {
  const formData = new FormData();
  console.log(formData);

  formData.append('name', categories.name);

  const res = await fetch(`/api/admin/notes/categories/${id}`, {
    method: "PUT",
    body: formData,
    credentials: 'include',
  });
  return res.json();
}

export async function deleteNoteCategory(id: string, cookieHeader?: string) {
  const res = await fetch(`/api/admin/notes/categories/${id}`, {
    method: 'DELETE',
    // Nếu chạy trên server (server action), ta truyền cookieHeader vào
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    // Nếu chạy trên client (browser) thì dùng credentials: 'include'
    credentials: cookieHeader ? undefined : 'include',
  });

  const data = await res.json().catch(() => ({} as any));

  if (!res.ok) {
    throw new Error(data.message || `Xóa thất bại (status ${res.status})`);
  }

  return data;
}
