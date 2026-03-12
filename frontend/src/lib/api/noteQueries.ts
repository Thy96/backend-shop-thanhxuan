import { cookies } from 'next/headers';

// Server-side queries (dùng cookies)
export async function getNotes(page = 1, limit = 10) {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
        .getAll()
        .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
        .join('; ');

    const res = await fetch(`/api/admin/notes?page=${page}&limit=${limit}`, {
        cache: "no-store",
        credentials: 'include',
        headers: {
            cookie: cookieHeader,
        },
    });

    if (!res.ok) {
        throw new Error('Không thể lấy dữ liệu bài viết');
    }

    return res.json();
}

export async function getTrashNotes(page = 1, limit = 10) {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
        .getAll()
        .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
        .join('; ');

    const res = await fetch(`/api/admin/notes/trash?page=${page}&limit=${limit}`, {
        cache: "no-store",
        credentials: 'include',
        headers: {
            cookie: cookieHeader,
        },
    });

    if (!res.ok) {
        throw new Error('Không thể lấy dữ liệu bài viết trong thùng rác');
    }

    return res.json();
}

export async function getNoteById(id: string) {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
        .getAll()
        .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
        .join('; ');

    const res = await fetch(`/api/admin/notes/${id}`, {
        cache: "no-store",
        credentials: 'include',
        headers: {
            cookie: cookieHeader,
        },
    });
    return res.json();
}
