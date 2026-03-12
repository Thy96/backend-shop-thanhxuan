'use server';

import { cookies } from 'next/headers';

// Server Actions for note categories
export async function serverCreateNoteCategory(categories: { name: string }) {
    const formData = new FormData();
    formData.append('name', categories.name);

    const cookieStore = await cookies();
    const cookieHeader = cookieStore
        .getAll()
        .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
        .join('; ');

    const res = await fetch(`/api/admin/notes/categories`, {
        method: 'POST',
        body: formData,
        headers: {
            cookie: cookieHeader,
        },
    });

    return res.json();
}

export async function serverUpdateNoteCategory(id: string, categories: { name: string }) {
    const formData = new FormData();
    formData.append('name', categories.name);

    const cookieStore = await cookies();
    const cookieHeader = cookieStore
        .getAll()
        .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
        .join('; ');

    const res = await fetch(`/api/admin/notes/categories/${id}`, {
        method: 'PUT',
        body: formData,
        headers: {
            cookie: cookieHeader,
        },
    });

    return res.json();
}

export async function serverDeleteNoteCategory(id: string) {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
        .getAll()
        .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
        .join('; ');

    const res = await fetch(`/api/admin/notes/categories/${id}`, {
        method: 'DELETE',
        headers: {
            cookie: cookieHeader,
        },
    });

    const data = await res.json().catch(() => ({} as any));

    if (!res.ok) {
        throw new Error(data.message || 'Xóa không thành công');
    }

    return data;
}
