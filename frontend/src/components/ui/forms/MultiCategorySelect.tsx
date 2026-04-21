'use client';

import {
  CategoryOption,
  buildCategoryTree,
  flattenCategoryTree,
} from '@/utils/format/category';

interface MultiCategorySelectProps {
  categories: CategoryOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  label?: string;
}

export default function MultiCategorySelect({
  categories,
  selectedIds,
  onChange,
  label = 'Danh mục',
}: MultiCategorySelectProps) {
  const tree = buildCategoryTree(categories);
  const flat = flattenCategoryTree(tree);

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((s) => s !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="mb-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="border border-gray-300 rounded p-2 max-h-48 overflow-y-auto bg-white">
        {flat.length === 0 && (
          <p className="text-sm text-gray-400">Không có danh mục</p>
        )}
        {flat.map(({ cat, depth }) => {
          const checked = selectedIds.includes(cat._id);
          return (
            <label
              key={cat._id}
              className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-gray-50 text-sm ${
                checked ? 'bg-blue-50' : ''
              }`}
              style={{ paddingLeft: `${depth * 16 + 8}px` }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(cat._id)}
                className="accent-blue-600"
              />
              {depth > 0 && (
                <span className="text-gray-400 text-xs mr-1">└</span>
              )}
              {cat.name}
            </label>
          );
        })}
      </div>
      {selectedIds.length === 0 && (
        <p className="text-xs text-red-500 mt-1">
          Vui lòng chọn ít nhất 1 danh mục
        </p>
      )}
    </div>
  );
}
