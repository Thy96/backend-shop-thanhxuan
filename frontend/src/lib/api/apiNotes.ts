export async function getNotes(page = 1, limit = 10) {
  const res = await fetch(`/api/admin/notes?page=${page}&limit=${limit}`, { cache: "no-store", credentials: 'include', });
  if (!res.ok) {
    throw new Error('Không thể lấy dữ liệu bài viết');
  }
  return res.json();
}

// Lấy danh sách bài trong thùng rác
export async function getTrashNotes(page = 1, limit = 10) {
  const res = await fetch(`/api/admin/notes/trash?page=${page}&limit=${limit}`, { cache: "no-store", credentials: 'include', });

  if (!res.ok) {
    throw new Error('Không thể lấy dữ liệu bài viết trong thùng rác');
  }

  return res.json();
}

export async function getNoteById(id: string) {
  const res = await fetch(`/api/admin/notes/${id}`, { cache: "no-store", credentials: 'include', });
  return res.json();
}

export async function createNote(note: { title: string, content: any, thumbnail?: File | null, categoryId: string }) {
  const formData = new FormData();

  formData.append("title", note.title);
  formData.append("content", JSON.stringify(note.content));
  formData.append("categoryId", note.categoryId);
  if (note.thumbnail) {
    formData.append("thumbnail", note.thumbnail);
  }

  const res = await fetch(`/api/admin/notes`, {
    method: "POST",
    body: formData,
    credentials: 'include',
  });

  return res.json();
}

export async function updateNote(id: string, note: { title: string, content: any, thumbnail?: File | string | null, categoryId: string, imageDeleted?: boolean }) {
  const formData = new FormData();
  formData.append('title', note.title);
  formData.append("content", JSON.stringify(note.content));
  formData.append("categoryId", note.categoryId);
  formData.append('imageDeleted', note.imageDeleted ? 'true' : 'false');
  if (note.thumbnail) {
    formData.append('thumbnail', note.thumbnail);
  }

  const res = await fetch(`/api/admin/notes/${id}`, {
    method: "PUT",
    body: formData,
    credentials: 'include',
  });
  return res.json();
}

export async function moveNoteToTrash(id: string, cookieHeader?: string) {
  const res = await fetch(`/api/admin/notes/${id}/trash`, {
    method: 'PATCH',
    // Nếu chạy trên server (server action), ta truyền cookieHeader vào
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    // Nếu chạy trên client (browser) thì dùng credentials: 'include'
    credentials: cookieHeader ? undefined : 'include',
  })

  const data = await res.json().catch(() => ({} as any))

  if (!res.ok) {
    throw new Error(data.message || `Chuyển vào thùng rác thất bại`);
  }

  return data;
}

// Khôi phục bài viết
export async function restoreNote(id: string, cookieHeader?: string) {
  const res = await fetch(`/api/admin/notes/${id}/restore`, {
    method: 'PATCH',
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    credentials: cookieHeader ? undefined : 'include',
  });

  if (!res.ok) throw new Error('Khôi phục thất bại');
  return res.json();
}

// Xóa vĩnh viễn
export async function forceDeleteNote(id: string, cookieHeader?: string) {
  const res = await fetch(`/api/admin/notes/${id}/force`, {
    method: 'DELETE',
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    credentials: cookieHeader ? undefined : 'include',
  });

  if (!res.ok) throw new Error('Xóa vĩnh viễn thất bại');
  return res.json();
}
