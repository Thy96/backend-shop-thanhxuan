'use server';

import { cookies } from 'next/headers';

// Helper function to get auth token
async function getAuthToken(): Promise<string | null> {
    const cookieStore = await cookies();
    const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME || 'access_token';
    return cookieStore.get(cookieName)?.value || null;
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

        const data = await res.json().catch(() => ({} as Record<string, unknown>));

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
