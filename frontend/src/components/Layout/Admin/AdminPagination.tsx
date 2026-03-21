import React from 'react';
import Link from 'next/link';
import { PaginationProps } from '@/lib/types';

interface AdminPaginationProps {
  pagination: PaginationProps;
  pages: (number | string)[];
  page: string;
}

export default function AdminPagination({
  pagination,
  pages,
  page,
}: AdminPaginationProps) {
  return (
    <>
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {pages.map((p, i) =>
            p === '...' ? (
              <span
                key={`dots-${i}`}
                className="px-3 py-1 text-gray-400 select-none"
              >
                …
              </span>
            ) : (
              <Link
                key={p}
                href={`/admin/${page}?page=${p}`}
                className={`px-3 py-1 rounded transition ${
                  pagination.page === p
                    ? 'border border-blue-600 bg-blue-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-300'
                }`}
              >
                {p}
              </Link>
            ),
          )}
        </div>
      )}
    </>
  );
}
