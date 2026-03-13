import { cookies } from 'next/headers';

// Server-side queries for note categories
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

    if (!res.ok) {
        throw new Error('Không thể lấy dữ liệu chuyên mục bài viết');
    }

    return res.json();
}

export async function getNoteCategoryById(id: string) {
    const res = await fetch(`/api/admin/notes/categories/${id}`, { cache: "no-store" });
    return res.json();
}
