export interface CategoryOption {
  _id: string;
  name: string;
  slug: string;
  parentId?: string | CategoryOption | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryWithChildren extends CategoryOption {
  children: CategoryWithChildren[];
}

type CategoryValue = string | { _id: string } | CategoryOption;

export const getCategoryLabel = (
  value: CategoryValue,
  options: CategoryOption[]
): string => {
  const id =
    typeof value === 'string'
      ? value
      : value?._id;

  if (!id) return '';
  const found = options.find((opt) => opt._id === id);
  if (found) return found.name;

  if (typeof value !== 'string' && 'name' in value) {
    return value.name;
  }

  return id;
};

export function buildCategoryTree(categories: CategoryOption[]): CategoryWithChildren[] {
  const map = new Map<string, CategoryWithChildren>();
  const roots: CategoryWithChildren[] = [];

  categories.forEach(cat => map.set(cat._id, { ...cat, children: [] }));

  categories.forEach(cat => {
    const node = map.get(cat._id)!;
    const parentId =
      !cat.parentId
        ? null
        : typeof cat.parentId === 'string'
          ? cat.parentId
          : (cat.parentId as CategoryOption)._id;

    if (parentId && map.has(parentId)) {
      map.get(parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export function flattenCategoryTree(
  tree: CategoryWithChildren[],
  depth = 0
): { cat: CategoryWithChildren; depth: number }[] {
  return tree.flatMap(cat => [
    { cat, depth },
    ...flattenCategoryTree(cat.children, depth + 1),
  ]);
}

export function getCategorySelectOptions(
  categories: CategoryOption[],
  excludeId?: string
): { value: string; label: string }[] {
  const filtered = excludeId ? categories.filter(c => c._id !== excludeId) : categories;
  const tree = buildCategoryTree(filtered);
  const flat = flattenCategoryTree(tree);
  return flat.map(({ cat, depth }) => ({
    value: cat._id,
    label: `${'　'.repeat(depth)}${depth > 0 ? '└ ' : ''}${cat.name}`,
  }));
}

