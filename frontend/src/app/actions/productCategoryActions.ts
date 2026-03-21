'use server';

import { cookies } from 'next/headers';

// Helper function to get auth token
async function getAuthToken(): Promise<string | null> {
    const cookieStore = await cookies();
    const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME || 'access_token';
    return cookieStore.get(cookieName)?.value || null;
}

// Server Actions for product categories
export async function serverCreateProductCategory(categories: { name: string }) {
    try {
        const formData = new FormData();
        formData.append('name', categories.name);

        const token = await getAuthToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        console.log('[serverCreateProductCategory] Posting to:', `${apiUrl}/api/admin/products/categories`);

        const res = await fetch(`${apiUrl}/api/admin/products/categories`, {
            method: 'POST',
            body: formData,
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
        });

        console.log('[serverCreateProductCategory] Response status:', res.status);

        if (!res.ok) {
            const errorText = await res.text();
            console.error('[serverCreateProductCategory] Server error:', res.status, errorText);
            throw new Error(`API Error ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        console.log('[serverCreateProductCategory] Success:', data);
        return data;
    } catch (error) {
        console.error('[serverCreateProductCategory] Exception:', error);
        throw error;
    }
}

export async function serverUpdateProductCategory(id: string, categories: { name: string }) {
    try {
        const formData = new FormData();
        formData.append('name', categories.name);

        const token = await getAuthToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        console.log('[serverUpdateProductCategory] Putting to:', `${apiUrl}/api/admin/products/categories/${id}`);

        const res = await fetch(`${apiUrl}/api/admin/products/categories/${id}`, {
            method: 'PUT',
            body: formData,
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
        });

        console.log('[serverUpdateProductCategory] Response status:', res.status);

        if (!res.ok) {
            const errorText = await res.text();
            console.error('[serverUpdateProductCategory] Server error:', res.status, errorText);
            throw new Error(`API Error ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        console.log('[serverUpdateProductCategory] Success:', data);
        return data;
    } catch (error) {
        console.error('[serverUpdateProductCategory] Exception:', error);
        throw error;
    }
}

export async function serverDeleteProductCategory(id: string) {
    try {
        const token = await getAuthToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        console.log('[serverDeleteProductCategory] Deleting to:', `${apiUrl}/api/admin/products/categories/${id}`);

        const res = await fetch(`${apiUrl}/api/admin/products/categories/${id}`, {
            method: 'DELETE',
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
        });

        console.log('[serverDeleteProductCategory] Response status:', res.status);

        const data = await res.json().catch(() => ({} as Record<string, unknown>));

        if (!res.ok) {
            console.error('[serverDeleteProductCategory] Server error:', res.status, data);
            throw new Error(data.message || 'Xóa không thành công');
        }

        console.log('[serverDeleteProductCategory] Success:', data);
        return data;
    } catch (error) {
        console.error('[serverDeleteProductCategory] Exception:', error);
        throw error;
    }
}
