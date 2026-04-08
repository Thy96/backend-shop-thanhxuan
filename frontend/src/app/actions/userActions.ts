'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

async function getAuthToken(): Promise<string | null> {
    const cookieStore = await cookies();
    const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME || 'access_token';
    return cookieStore.get(cookieName)?.value || null;
}

export async function serverCreateUser(user: {
    email: string;
    fullName: string;
    password: string;
    phone: string;
    address: string;
    role: string;
}) {
    const token = await getAuthToken();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    const res = await fetch(`${apiUrl}/api/admin/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(user),
    });

    const data = await res.json();

    if (!res.ok) {
        const errorMsg =
            data.message ||
            Object.values(data.errors || {})[0] ||
            'Có lỗi xảy ra';
        throw new Error(errorMsg as string);
    }

    revalidatePath('/admin/users');
    return data;
}

export async function serverUpdateUser(
    id: string,
    user: {
        role?: string;
        address?: string;
    },
) {
    const token = await getAuthToken();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    const res = await fetch(`${apiUrl}/api/admin/users/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(user),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || 'Cập nhật user thất bại');
    }

    revalidatePath('/admin/users');
    return data;
}
