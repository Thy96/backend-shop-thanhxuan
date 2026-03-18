import { cookies } from 'next/headers';

// Server-side queries for product categories
export async function getProductCategories() {
    try {
        const cookieStore = await cookies();
        const cookieHeader = cookieStore
            .getAll()
            .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
            .join('; ');

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        console.log('[getProductCategories] Fetching from:', `${apiUrl}/api/admin/products/categories`);

        const res = await fetch(`${apiUrl}/api/admin/products/categories`, {
            cache: "no-store",
            credentials: 'include',
            headers: {
                cookie: cookieHeader,
            },
        });

        console.log('[getProductCategories] Response status:', res.status);

        if (!res.ok) {
            const errorText = await res.text();
            console.error('[getProductCategories] API Error:', res.status, errorText);
            throw new Error(`API Error ${res.status}: Không thể lấy dữ liệu chuyên mục sản phẩm`);
        }

        const data = await res.json();
        console.log('[getProductCategories] Success:', data);
        return data;
    } catch (error) {
        console.error('[getProductCategories] Exception:', error);
        throw error;
    }
}

export async function getProductCategoryById(id: string) {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        console.log('[getProductCategoryById] Fetching from:', `${apiUrl}/api/admin/products/categories/${id}`);

        const res = await fetch(`${apiUrl}/api/admin/products/categories/${id}`, {
            cache: "no-store",
            credentials: 'include',
        });

        console.log('[getProductCategoryById] Response status:', res.status);

        if (!res.ok) {
            const errorText = await res.text();
            console.error('[getProductCategoryById] API Error:', res.status, errorText);
            throw new Error(`API Error ${res.status}: Không thể lấy dữ liệu chuyên mục sản phẩm`);
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error('[getProductCategoryById] Exception:', error);
        throw error;
    }
}
