'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '@/utils/helps';

export interface Me {
  _id: string;
  fullName?: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

export default function useMe() {
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/auth/me`, {
          credentials: 'include',
        });

        const data = await res.json();
        if (!res.ok) throw new Error();

        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  return { user, setUser, loading };
}
