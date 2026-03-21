export interface CategoryOption {
  _id: string;
  name: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
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

