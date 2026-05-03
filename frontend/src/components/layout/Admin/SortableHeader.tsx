import Link from 'next/link';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

interface SortableHeaderProps {
  label: string;
  field: string;
  currentSortBy: string;
  currentSortOrder: string;
  basePath: string;
  extraParams?: Record<string, string>;
}

export default function SortableHeader({
  label,
  field,
  currentSortBy,
  currentSortOrder,
  basePath,
  extraParams = {},
}: SortableHeaderProps) {
  const isActive = currentSortBy === field;
  const nextOrder = isActive && currentSortOrder === 'asc' ? 'desc' : 'asc';

  const params = new URLSearchParams({
    ...extraParams,
    sortBy: field,
    sortOrder: nextOrder,
    page: '1',
  });

  return (
    <Link
      href={`${basePath}?${params.toString()}`}
      className="inline-flex items-center gap-1 hover:text-gray-700 select-none"
    >
      {label}
      {isActive ? (
        currentSortOrder === 'asc' ? (
          <ChevronUp className="w-4 h-4 text-blue-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-blue-500" />
        )
      ) : (
        <ChevronsUpDown className="w-4 h-4 text-gray-400" />
      )}
    </Link>
  );
}
