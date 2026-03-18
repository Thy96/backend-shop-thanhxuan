'use server';

import { cookies } from 'next/headers';

// Helper function to get auth token
async function getAuthToken(): Promise<string | null> {
    const cookieStore = await cookies();
    const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME || 'access_token';
    return cookieStore.get(cookieName)?.value || null;
}

// Server Actions (mutations - dùng được từ client components)
export async function serverCreateProduct(product: {
    title: string;
    content: any;
    price: number;
    sale?: number;
    stock?: number;
    images?: File[] | null;
    categoryId: string;
    status?: string;
}) {
    try {
        const formData = new FormData();
        formData.append('title', product.title);
        formData.append('content', JSON.stringify(product.content));
        formData.append('price', String(product.price));
        formData.append('categoryId', product.categoryId);

        if (product.images) {
            product.images.forEach(file => formData.append('images', file));
        }

        if (product.sale !== undefined) {
            formData.append('sale', String(product.sale));
        }

        if (product.stock !== undefined) {
            formData.append('stock', String(product.stock));
        }

        if (product.status) {
            formData.append('status', product.status);
        }

        const token = await getAuthToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        console.log('[serverCreateProduct] Posting to:', `${apiUrl}/api/admin/products`);

        const res = await fetch(`${apiUrl}/api/admin/products`, {
            method: 'POST',
            body: formData,
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
        });

        console.log('[serverCreateProduct] Response status:', res.status);

        if (!res.ok) {
            const errorText = await res.text();
            console.error('[serverCreateProduct] Server error:', res.status, errorText);
            throw new Error(`API Error ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        console.log('[serverCreateProduct] Success:', data);
        return data;
    } catch (error) {
        console.error('[serverCreateProduct] Exception:', error);
        throw error;
    }
}

export async function serverUpdateProduct(
    id: string,
    product: {
        title: string;
        content: any;
        price: number;
        sale: number;
        stock: number;
        categoryId: string;
        status: string;
        images?: File[] | null;
    }
) {
    try {
        const formData = new FormData();
        formData.append('title', product.title);
        formData.append('content', JSON.stringify(product.content));
        formData.append('price', String(product.price));
        formData.append('categoryId', product.categoryId);

        if (product.images) {
            product.images.forEach(file => formData.append('images', file));
        }

        if (product.sale !== undefined) {
            formData.append('sale', String(product.sale));
        }

        if (product.stock !== undefined) {
            formData.append('stock', String(product.stock));
        }

        if (product.status) {
            formData.append('status', product.status);
        }

        const token = await getAuthToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        console.log('[serverUpdateProduct] Putting to:', `${apiUrl}/api/admin/products/${id}`);

        const res = await fetch(`${apiUrl}/api/admin/products/${id}`, {
            method: 'PUT',
            body: formData,
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
        });

        console.log('[serverUpdateProduct] Response status:', res.status);

        if (!res.ok) {
            const errorText = await res.text();
            console.error('[serverUpdateProduct] Server error:', res.status, errorText);
            throw new Error(`API Error ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        console.log('[serverUpdateProduct] Success:', data);
        return data;
    } catch (error) {
        console.error('[serverUpdateProduct] Exception:', error);
        throw error;
    }
}

export async function serverMoveProductToTrash(id: string) {
    try {
        const token = await getAuthToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        console.log('[serverMoveProductToTrash] Patching to:', `${apiUrl}/api/admin/products/${id}/trash`);

        const res = await fetch(`${apiUrl}/api/admin/products/${id}/trash`, {
            method: 'PATCH',
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
        });

        console.log('[serverMoveProductToTrash] Response status:', res.status);

        const data = await res.json().catch(() => ({} as any));

        if (!res.ok) {
            console.error('[serverMoveProductToTrash] Server error:', res.status, data);
            throw new Error(data.message || 'Chuyển vào thùng rác thất bại');
        }

        console.log('[serverMoveProductToTrash] Success:', data);
        return data;
    } catch (error) {
        console.error('[serverMoveProductToTrash] Exception:', error);
        throw error;
    }
}

export async function serverRestoreProduct(id: string) {
    try {
        const token = await getAuthToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        console.log('[serverRestoreProduct] Patching to:', `${apiUrl}/api/admin/products/${id}/restore`);

        const res = await fetch(`${apiUrl}/api/admin/products/${id}/restore`, {
            method: 'PATCH',
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
        });

        console.log('[serverRestoreProduct] Response status:', res.status);

        if (!res.ok) {
            const errorText = await res.text();
            console.error('[serverRestoreProduct] Server error:', res.status, errorText);
            throw new Error(`API Error ${res.status}: Khôi phục thất bại`);
        }

        const data = await res.json();
        console.log('[serverRestoreProduct] Success:', data);
        return data;
    } catch (error) {
        console.error('[serverRestoreProduct] Exception:', error);
        throw error;
    }
}

export async function serverForceDeleteProduct(id: string) {
    try {
        const token = await getAuthToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        console.log('[serverForceDeleteProduct] Deleting to:', `${apiUrl}/api/admin/products/${id}/force`);

        const res = await fetch(`${apiUrl}/api/admin/products/${id}/force`, {
            method: 'DELETE',
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
        });

        console.log('[serverForceDeleteProduct] Response status:', res.status);

        if (!res.ok) {
            const errorText = await res.text();
            console.error('[serverForceDeleteProduct] Server error:', res.status, errorText);
            throw new Error(`API Error ${res.status}: Xóa vĩnh viễn thất bại`);
        }

        const data = await res.json();
        console.log('[serverForceDeleteProduct] Success:', data);
        return data;
    } catch (error) {
        console.error('[serverForceDeleteProduct] Exception:', error);
        throw error;
    }
}
