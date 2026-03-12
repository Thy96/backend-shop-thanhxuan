'use server';

import { cookies } from 'next/headers';

// Server Actions (mutations - dùng được từ client components)
export async function serverCreateNote(note: { title: string; content: any; thumbnail?: File | null; categoryId: string }) {
    const formData = new FormData();
    formData.append('title', note.title);
    formData.append('content', JSON.stringify(note.content));
    formData.append('categoryId', note.categoryId);
    if (note.thumbnail) {
        formData.append('thumbnail', note.thumbnail);
    }

    const cookieStore = await cookies();
    const cookieHeader = cookieStore
        .getAll()
        .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
        .join('; ');

    const res = await fetch(`/api/admin/notes`, {
        method: 'POST',
        body: formData,
        headers: {
            cookie: cookieHeader,
        },
    });

    return res.json();
}

export async function serverUpdateNote(
    id: string,
    note: {
        title: string;
        content: any;
        thumbnail?: File | string | null;
        categoryId: string;
        imageDeleted?: boolean;
    }
) {
    const formData = new FormData();
    formData.append('title', note.title);
    formData.append('content', JSON.stringify(note.content));
    formData.append('categoryId', note.categoryId);
    formData.append('imageDeleted', note.imageDeleted ? 'true' : 'false');
    if (note.thumbnail) {
        formData.append('thumbnail', note.thumbnail);
    }

    const cookieStore = await cookies();
    const cookieHeader = cookieStore
        .getAll()
        .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
        .join('; ');

    const res = await fetch(`/api/admin/notes/${id}`, {
        method: 'PUT',
        body: formData,
        headers: {
            cookie: cookieHeader,
        },
    });

    return res.json();
}

export async function serverMoveNoteToTrash(id: string) {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
        .getAll()
        .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
        .join('; ');

    const res = await fetch(`/api/admin/notes/${id}/trash`, {
        method: 'PATCH',
        headers: {
            cookie: cookieHeader,
        },
    });

    const data = await res.json().catch(() => ({} as any));

    if (!res.ok) {
        throw new Error(data.message || 'Chuyển vào thùng rác thất bại');
    }

    return data;
}

export async function serverRestoreNote(id: string) {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
        .getAll()
        .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
        .join('; ');

    const res = await fetch(`/api/admin/notes/${id}/restore`, {
        method: 'PATCH',
        headers: {
            cookie: cookieHeader,
        },
    });

    if (!res.ok) throw new Error('Khôi phục thất bại');
    return res.json();
}

export async function serverForceDeleteNote(id: string) {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
        .getAll()
        .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
        .join('; ');

    const res = await fetch(`/api/admin/notes/${id}/force`, {
        method: 'DELETE',
        headers: {
            cookie: cookieHeader,
        },
    });

    if (!res.ok) throw new Error('Xóa vĩnh viễn thất bại');
    return res.json();
}
