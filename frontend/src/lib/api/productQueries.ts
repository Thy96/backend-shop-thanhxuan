import { cookies } from 'next/headers';

// Server-side queries (dùng cookies)
export async function getProducts(page = 1, limit = 10, status = '') {
    try {
        const cookieStore = await cookies();
        const cookieHeader = cookieStore
            .getAll()
            .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
            .join('; ');

        let url = `/api/admin/products?page=${page}&limit=${limit}`;
        if (status) {
            url += `&status=${status}`;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        console.log('[getProducts] Fetching from:', `${apiUrl}${url}`);

        const res = await fetch(`${apiUrl}${url}`, {
            cache: "no-store",
            credentials: 'include',
            headers: {
                cookie: cookieHeader,
            },
        });

        console.log('[getProducts] Response status:', res.status);

        if (!res.ok) {
            const errorText = await res.text();
            console.error('[getProducts] API Error:', res.status, errorText);
            throw new Error(`API Error ${res.status}: Không thể lấy dữ liệu sản phẩm`);
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error('[getProducts] Exception:', error);
        throw error;
    }
}

export async function getTrashProducts(page = 1, limit = 10) {
    try {
        const cookieStore = await cookies();
        const cookieHeader = cookieStore
            .getAll()
            .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
            .join('; ');

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        console.log('[getTrashProducts] Fetching from:', `${apiUrl}/api/admin/products/trash?page=${page}&limit=${limit}`);

        const res = await fetch(`${apiUrl}/api/admin/products/trash?page=${page}&limit=${limit}`, {
            cache: "no-store",
            credentials: 'include',
            headers: {
                cookie: cookieHeader,
            },
        });

        console.log('[getTrashProducts] Response status:', res.status);

        if (!res.ok) {
            const errorText = await res.text();
            console.error('[getTrashProducts] API Error:', res.status, errorText);
            throw new Error(`API Error ${res.status}: Không thể lấy dữ liệu sản phẩm trong thùng rác`);
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error('[getTrashProducts] Exception:', error);
        throw error;
    }
}

export async function getProductById(id: string) {
    try {
        const cookieStore = await cookies();
        const cookieHeader = cookieStore
            .getAll()
            .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
            .join('; ');

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        console.log('[getProductById] Fetching from:', `${apiUrl}/api/admin/products/${id}`);

        const res = await fetch(`${apiUrl}/api/admin/products/${id}`, {
            cache: "no-store",
            credentials: 'include',
            headers: {
                cookie: cookieHeader,
            },
        });

        console.log('[getProductById] Response status:', res.status);

        if (!res.ok) {
            const errorText = await res.text();
            console.error('[getProductById] API Error:', res.status, errorText);
            throw new Error(`API Error ${res.status}: Không thể lấy dữ liệu sản phẩm`);
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error('[getProductById] Exception:', error);
        throw error;
    }
}
