import { API_URL } from "@/utils/helps";

export async function getNoteCategories() {
  const res = await fetch(`${API_URL}/api/admin/notes/categories`, { cache: "no-store", credentials: 'include', });
  return res.json();
}

export async function getNoteCategoryById(id: string) {
  const res = await fetch(`${API_URL}/api/admin/notes/categories/${id}`, { cache: "no-store" });
  return res.json();
}

export async function createNoteCategory(categories: { name: string }) {
  const formData = new FormData();
  formData.append("name", categories.name);

  const res = await fetch(`${API_URL}/api/admin/notes/categories`, {
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

  const res = await fetch(`${API_URL}/api/admin/notes/categories/${id}`, {
    method: "PUT",
    body: formData,
    credentials: 'include',
  });
  return res.json();
}

export async function deleteNoteCategory(id: string, cookieHeader?: string) {
  const res = await fetch(`${API_URL}/api/admin/notes/categories/${id}`, {
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
