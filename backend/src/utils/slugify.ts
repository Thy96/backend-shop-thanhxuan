export function slugify(str: string): string {
  return str
    .toString()
    .trim()
    .toLowerCase()
    .replace(/đ/g, "d") // đ không phân giải được qua NFD, cần xử lý riêng
    .normalize("NFD") // bỏ dấu tiếng Việt
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}