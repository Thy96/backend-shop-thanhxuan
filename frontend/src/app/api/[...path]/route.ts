import { NextRequest, NextResponse } from 'next/server';
import { API_URL } from '@/utils/helps';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    const pathStr = path.join('/');
    const queryString = req.nextUrl.search;
    const url = `${API_URL}/${pathStr}${queryString}`;

    try {
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                cookie: req.headers.get('cookie') || '',
            },
        });

        const data = await res.json().catch(() => ({}));
        const next = NextResponse.json(data, { status: res.status });

        const setCookies = res.headers.getSetCookie();
        if (setCookies && setCookies.length > 0) {
            setCookies.forEach(cookie => next.headers.append('set-cookie', cookie));
        }

        return next;
    } catch (error) {
        return NextResponse.json({ message: 'Lỗi kết nối server' }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    const pathStr = path.join('/');
    const body = await req.json().catch(() => ({}));
    const url = `${API_URL}/${pathStr}`;

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                cookie: req.headers.get('cookie') || '',
            },
            body: JSON.stringify(body),
        });

        const data = await res.json().catch(() => ({}));
        const next = NextResponse.json(data, { status: res.status });

        const setCookies = res.headers.getSetCookie();
        if (setCookies && setCookies.length > 0) {
            setCookies.forEach(cookie => next.headers.append('set-cookie', cookie));
        }

        return next;
    } catch (error) {
        return NextResponse.json({ message: 'Lỗi kết nối server' }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    const pathStr = path.join('/');
    const body = await req.json().catch(() => ({}));
    const url = `${API_URL}/${pathStr}`;

    try {
        const res = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                cookie: req.headers.get('cookie') || '',
            },
            body: JSON.stringify(body),
        });

        const data = await res.json().catch(() => ({}));
        const next = NextResponse.json(data, { status: res.status });

        const setCookies = res.headers.getSetCookie();
        if (setCookies && setCookies.length > 0) {
            setCookies.forEach(cookie => next.headers.append('set-cookie', cookie));
        }

        return next;
    } catch (error) {
        return NextResponse.json({ message: 'Lỗi kết nối server' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    const pathStr = path.join('/');
    const url = `${API_URL}/${pathStr}`;

    try {
        const res = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                cookie: req.headers.get('cookie') || '',
            },
        });

        const data = await res.json().catch(() => ({}));
        const next = NextResponse.json(data, { status: res.status });

        const setCookies = res.headers.getSetCookie();
        if (setCookies && setCookies.length > 0) {
            setCookies.forEach(cookie => next.headers.append('set-cookie', cookie));
        }

        return next;
    } catch (error) {
        return NextResponse.json({ message: 'Lỗi kết nối server' }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    const pathStr = path.join('/');
    const body = await req.json().catch(() => ({}));
    const url = `${API_URL}/${pathStr}`;

    try {
        const res = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                cookie: req.headers.get('cookie') || '',
            },
            body: JSON.stringify(body),
        });

        const data = await res.json().catch(() => ({}));
        const next = NextResponse.json(data, { status: res.status });

        const setCookies = res.headers.getSetCookie();
        if (setCookies && setCookies.length > 0) {
            setCookies.forEach(cookie => next.headers.append('set-cookie', cookie));
        }

        return next;
    } catch (error) {
        return NextResponse.json({ message: 'Lỗi kết nối server' }, { status: 500 });
    }
}
