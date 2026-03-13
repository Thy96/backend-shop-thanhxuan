import { cookies } from 'next/headers';

// Server-side queries for note categories
export async function getNoteCategories() {
    try {
        const cookieStore = await cookies();
        const cookieHeader = cookieStore
            .getAll()
            .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
            .join('; ');

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        console.log('[getNoteCategories] Fetching from:', `${apiUrl}/api/admin/notes/categories`);

        const res = await fetch(`${apiUrl}/api/admin/notes/categories`, {
            cache: "no-store",
            credentials: 'include',
            headers: {
                cookie: cookieHeader,
            },
        });

        console.log('[getNoteCategories] Response status:', res.status);

        if (!res.ok) {
            const errorText = await res.text();
            console.error('[getNoteCategories] API Error:', res.status, errorText);
            throw new Error(`API Error ${res.status}: Không thể lấy dữ liệu chuyên mục bài viết`);
        }

        const data = await res.json();
        console.log('[getNoteCategories] Success:', data);
        return data;
    } catch (error) {
        console.error('[getNoteCategories] Exception:', error);
        throw error;
    }
}

export async function getNoteCategoryById(id: string) {
    const res = await fetch(`/api/admin/notes/categories/${id}`, { cache: "no-store" });
    return res.json();
}
