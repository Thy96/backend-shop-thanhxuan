import { cookies } from 'next/headers';

// Server-side queries (dùng cookies)
export async function getNotes(page = 1, limit = 10) {
    try {
        const cookieStore = await cookies();
        const cookieHeader = cookieStore
            .getAll()
            .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
            .join('; ');

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        console.log('[getNotes] Fetching from:', `${apiUrl}/api/admin/notes?page=${page}&limit=${limit}`);

        const res = await fetch(`${apiUrl}/api/admin/notes?page=${page}&limit=${limit}`, {
            cache: "no-store",
            credentials: 'include',
            headers: {
                cookie: cookieHeader,
            },
        });

        console.log('[getNotes] Response status:', res.status);

        if (!res.ok) {
            const errorText = await res.text();
            console.error('[getNotes] API Error:', res.status, errorText);
            throw new Error(`API Error ${res.status}: Không thể lấy dữ liệu bài viết`);
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error('[getNotes] Exception:', error);
        throw error;
    }
}

export async function getTrashNotes(page = 1, limit = 10) {
    try {
        const cookieStore = await cookies();
        const cookieHeader = cookieStore
            .getAll()
            .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
            .join('; ');

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        console.log('[getTrashNotes] Fetching from:', `${apiUrl}/api/admin/notes/trash?page=${page}&limit=${limit}`);

        const res = await fetch(`${apiUrl}/api/admin/notes/trash?page=${page}&limit=${limit}`, {
            cache: "no-store",
            credentials: 'include',
            headers: {
                cookie: cookieHeader,
            },
        });

        console.log('[getTrashNotes] Response status:', res.status);

        if (!res.ok) {
            const errorText = await res.text();
            console.error('[getTrashNotes] API Error:', res.status, errorText);
            throw new Error(`API Error ${res.status}: Không thể lấy dữ liệu bài viết trong thùng rác`);
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error('[getTrashNotes] Exception:', error);
        throw error;
    }
}

export async function getNoteById(id: string) {
    try {
        const cookieStore = await cookies();
        const cookieHeader = cookieStore
            .getAll()
            .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
            .join('; ');

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        console.log('[getNoteById] Fetching from:', `${apiUrl}/api/admin/notes/${id}`);

        const res = await fetch(`${apiUrl}/api/admin/notes/${id}`, {
            cache: "no-store",
            credentials: 'include',
            headers: {
                cookie: cookieHeader,
            },
        });

        console.log('[getNoteById] Response status:', res.status);

        if (!res.ok) {
            const errorText = await res.text();
            console.error('[getNoteById] API Error:', res.status, errorText);
            throw new Error(`API Error ${res.status}: Không thể lấy dữ liệu bài viết`);
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error('[getNoteById] Exception:', error);
        throw error;
    }
}
