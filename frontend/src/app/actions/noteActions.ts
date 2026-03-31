'use server';

import type { OutputData } from '@editorjs/editorjs';
import { cookies } from 'next/headers';

// Helper function to get auth token
async function getAuthToken(): Promise<string | null> {
    const cookieStore = await cookies();
    const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME || 'access_token';
    return cookieStore.get(cookieName)?.value || null;
}

// Server Actions (mutations - dùng được từ client components)
export async function serverCreateNote(note: { title: string; content: OutputData; thumbnail?: File | null; categoryId: string; status: string }) {
    try {
        const formData = new FormData();
        formData.append('title', note.title);
        formData.append('content', JSON.stringify(note.content));
        formData.append('categoryId', note.categoryId);
        formData.append('status', note.status);
        if (note.thumbnail) {
            formData.append('thumbnail', note.thumbnail);
        }

        const token = await getAuthToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        console.log('[serverCreateNote] Posting to:', `${apiUrl}/api/admin/notes`);

        const res = await fetch(`${apiUrl}/api/admin/notes`, {
            method: 'POST',
            body: formData,
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
        });

        console.log('[serverCreateNote] Response status:', res.status);

        if (!res.ok) {
            const errorText = await res.text();
            console.error('[serverCreateNote] Server error:', res.status, errorText);
            throw new Error(`API Error ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        console.log('[serverCreateNote] Success:', data);
        return data;
    } catch (error) {
        console.error('[serverCreateNote] Exception:', error);
        throw error;
    }
}

export async function serverUpdateNote(
    id: string,
    note: {
        title: string;
        content: OutputData;
        thumbnail?: File | string | null;
        categoryId: string;
        imageDeleted?: boolean;
        status: string;
    }
) {
    try {
        const formData = new FormData();
        formData.append('title', note.title);
        formData.append('content', JSON.stringify(note.content));
        formData.append('categoryId', note.categoryId);
        formData.append('imageDeleted', note.imageDeleted ? 'true' : 'false');
        formData.append('status', note.status);
        if (note.thumbnail) {
            formData.append('thumbnail', note.thumbnail);
        }

        const token = await getAuthToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        console.log('[serverUpdateNote] Putting to:', `${apiUrl}/api/admin/notes/${id}`);

        const res = await fetch(`${apiUrl}/api/admin/notes/${id}`, {
            method: 'PUT',
            body: formData,
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
        });

        console.log('[serverUpdateNote] Response status:', res.status);

        if (!res.ok) {
            const errorText = await res.text();
            console.error('[serverUpdateNote] Server error:', res.status, errorText);
            throw new Error(`API Error ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        console.log('[serverUpdateNote] Success:', data);
        return data;
    } catch (error) {
        console.error('[serverUpdateNote] Exception:', error);
        throw error;
    }
}

export async function serverMoveNoteToTrash(id: string) {
    try {
        const token = await getAuthToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        console.log('[serverMoveNoteToTrash] Patching to:', `${apiUrl}/api/admin/notes/${id}/trash`);

        const res = await fetch(`${apiUrl}/api/admin/notes/${id}/trash`, {
            method: 'PATCH',
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
        });

        console.log('[serverMoveNoteToTrash] Response status:', res.status);

        const data = await res.json().catch(() => ({} as Record<string, unknown>));

        if (!res.ok) {
            console.error('[serverMoveNoteToTrash] Server error:', res.status, data);
            throw new Error(data.message || 'Chuyển vào thùng rác thất bại');
        }

        console.log('[serverMoveNoteToTrash] Success:', data);
        return data;
    } catch (error) {
        console.error('[serverMoveNoteToTrash] Exception:', error);
        throw error;
    }
}

export async function serverRestoreNote(id: string) {
    try {
        const token = await getAuthToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        console.log('[serverRestoreNote] Patching to:', `${apiUrl}/api/admin/notes/${id}/restore`);

        const res = await fetch(`${apiUrl}/api/admin/notes/${id}/restore`, {
            method: 'PATCH',
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
        });

        console.log('[serverRestoreNote] Response status:', res.status);

        if (!res.ok) {
            const errorText = await res.text();
            console.error('[serverRestoreNote] Server error:', res.status, errorText);
            throw new Error(`API Error ${res.status}: Khôi phục thất bại`);
        }

        const data = await res.json();
        console.log('[serverRestoreNote] Success:', data);
        return data;
    } catch (error) {
        console.error('[serverRestoreNote] Exception:', error);
        throw error;
    }
}

export async function serverForceDeleteNote(id: string) {
    try {
        const token = await getAuthToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        console.log('[serverForceDeleteNote] Deleting to:', `${apiUrl}/api/admin/notes/${id}/force`);

        const res = await fetch(`${apiUrl}/api/admin/notes/${id}/force`, {
            method: 'DELETE',
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
        });

        console.log('[serverForceDeleteNote] Response status:', res.status);

        if (!res.ok) {
            const errorText = await res.text();
            console.error('[serverForceDeleteNote] Server error:', res.status, errorText);
            throw new Error(`API Error ${res.status}: Xóa vĩnh viễn thất bại`);
        }

        const data = await res.json();
        console.log('[serverForceDeleteNote] Success:', data);
        return data;
    } catch (error) {
        console.error('[serverForceDeleteNote] Exception:', error);
        throw error;
    }
}
