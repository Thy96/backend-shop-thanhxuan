'use server';

import { cookies } from 'next/headers';

// Helper function to get auth token
async function getAuthToken(): Promise<string | null> {
    const cookieStore = await cookies();
    const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME || 'access_token';
    return cookieStore.get(cookieName)?.value || null;
}

// Server Actions for note categories
export async function serverCreateNoteCategory(categories: { name: string }) {
    try {
        const formData = new FormData();
        formData.append('name', categories.name);

        const token = await getAuthToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        console.log('[serverCreateNoteCategory] Posting to:', `${apiUrl}/api/admin/notes/categories`);

        const res = await fetch(`${apiUrl}/api/admin/notes/categories`, {
            method: 'POST',
            body: formData,
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
        });

        console.log('[serverCreateNoteCategory] Response status:', res.status);

        if (!res.ok) {
            const errorText = await res.text();
            console.error('[serverCreateNoteCategory] Server error:', res.status, errorText);
            throw new Error(`API Error ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        console.log('[serverCreateNoteCategory] Success:', data);
        return data;
    } catch (error) {
        console.error('[serverCreateNoteCategory] Exception:', error);
        throw error;
    }
}

export async function serverUpdateNoteCategory(id: string, categories: { name: string }) {
    try {
        const formData = new FormData();
        formData.append('name', categories.name);

        const token = await getAuthToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        console.log('[serverUpdateNoteCategory] Putting to:', `${apiUrl}/api/admin/notes/categories/${id}`);

        const res = await fetch(`${apiUrl}/api/admin/notes/categories/${id}`, {
            method: 'PUT',
            body: formData,
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
        });

        console.log('[serverUpdateNoteCategory] Response status:', res.status);

        if (!res.ok) {
            const errorText = await res.text();
            console.error('[serverUpdateNoteCategory] Server error:', res.status, errorText);
            throw new Error(`API Error ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        console.log('[serverUpdateNoteCategory] Success:', data);
        return data;
    } catch (error) {
        console.error('[serverUpdateNoteCategory] Exception:', error);
        throw error;
    }
}

export async function serverDeleteNoteCategory(id: string) {
    try {
        const token = await getAuthToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        console.log('[serverDeleteNoteCategory] Deleting to:', `${apiUrl}/api/admin/notes/categories/${id}`);

        const res = await fetch(`${apiUrl}/api/admin/notes/categories/${id}`, {
            method: 'DELETE',
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
        });

        console.log('[serverDeleteNoteCategory] Response status:', res.status);

        const data = await res.json().catch(() => ({} as any));

        if (!res.ok) {
            console.error('[serverDeleteNoteCategory] Server error:', res.status, data);
            throw new Error(data.message || 'Xóa không thành công');
        }

        console.log('[serverDeleteNoteCategory] Success:', data);
        return data;
    } catch (error) {
        console.error('[serverDeleteNoteCategory] Exception:', error);
        throw error;
    }
}
