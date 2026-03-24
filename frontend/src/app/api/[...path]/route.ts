import { NextRequest, NextResponse } from 'next/server';
import { API_URL } from '@/utils/helps';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    const pathStr = path.join('/');
    const queryString = req.nextUrl.search;
    const url = `${API_URL}/api/${pathStr}${queryString}`;

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

    const contentType = req.headers.get('content-type');
    const cookie = req.headers.get('cookie') || '';

    let body: BodyInit | undefined;
    if (contentType?.includes('application/json')) {
        const json = await req.json().catch(() => ({}));
        body = JSON.stringify(json);
    } else if (contentType?.includes('multipart/form-data')) {
        body = await req.formData();
    } else {
        body = await req.text();
    }

    const headers: HeadersInit = {
        cookie,
        ...(contentType?.includes('application/json') && { 'Content-Type': 'application/json' }),
    };

    const url = `${API_URL}/api/${pathStr}`;

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: contentType?.includes('multipart/form-data') ? { cookie } : headers,
            body,
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

    const contentType = req.headers.get('content-type');
    const cookie = req.headers.get('cookie') || '';

    let body: BodyInit | undefined;
    if (contentType?.includes('application/json')) {
        const json = await req.json().catch(() => ({}));
        body = JSON.stringify(json);
    } else if (contentType?.includes('multipart/form-data')) {
        body = await req.formData();
    } else {
        body = await req.text();
    }

    const headers: HeadersInit = {
        cookie,
        ...(contentType?.includes('application/json') && { 'Content-Type': 'application/json' }),
    };

    const url = `${API_URL}/api/${pathStr}`;

    try {
        const res = await fetch(url, {
            method: 'PUT',
            headers: contentType?.includes('multipart/form-data') ? { cookie } : headers,
            body,
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
    const url = `${API_URL}/api/${pathStr}`;

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
    const url = `${API_URL}/api/${pathStr}`;

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
