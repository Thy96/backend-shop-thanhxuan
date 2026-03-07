import { API_URL } from "@/utils/helps";

export async function getProducts(page = 1, limit = 10, status = 'draft') {
  let url = `/api/admin/products?page=${page}&limit=${limit}`;

  if (status) {
    url += `&status=${status}`;
  }
  const res = await fetch(`${API_URL}${url}`, { cache: "no-store", credentials: 'include', });
  if (!res.ok) {
    throw new Error('Không thể lấy dữ liệu sản phẩm');
  }
  return res.json();
}

export async function getTrashProducts(page = 1, limit = 10) {
  const res = await fetch(`${API_URL}/api/admin/products/trash?page=${page}&limit=${limit}`, { cache: "no-store", credentials: 'include', });
  if (!res.ok) {
    throw new Error('Không thể lấy dữ liệu sản phẩm');
  }
  return res.json();
}

export async function getProductById(id: string) {
  const res = await fetch(`${API_URL}/api/admin/products/${id}`, { cache: "no-store", credentials: 'include', });
  return res.json();
}

export async function createProducts(product: {
  images?: File[] | null;
  title: string;
  content: any;
  price: number;
  sale?: number;
  stock?: number;
  categoryId: string;
  status?: string;
}) {
  const formData = new FormData();
  formData.append("title", product.title);
  formData.append("content", JSON.stringify(product.content));
  formData.append("price", String(product.price));
  formData.append("categoryId", product.categoryId);

  if (product.images) {
    product.images.forEach(file => formData.append('images', file));
  }

  if (product.sale !== undefined) {
    formData.append("sale", String(product.sale));
  }

  if (product.stock !== undefined) {
    formData.append("stock", String(product.stock));
  }

  if (product.status) {
    formData.append("status", product.status);
  }

  const res = await fetch(`${API_URL}/api/admin/products`, {
    method: "POST",
    body: formData,
    credentials: 'include',
  });

  return res.json();
}

export async function updateProduct(id: string, product: {
  images?: File[] | null;
  title: string;
  content: any;
  price: number;
  sale: number;
  stock: number;
  categoryId: string;
  status: string;
}) {

  const formData = new FormData();
  formData.append("title", product.title);
  formData.append("content", JSON.stringify(product.content));
  formData.append("price", String(product.price));

  if (product.images) {
    product.images.forEach(file => formData.append('images', file));
  }

  if (product.sale !== undefined) {
    formData.append("sale", String(product.sale));
  }

  if (product.stock !== undefined) {
    formData.append("stock", String(product.stock));
  }

  if (product.categoryId) {
    formData.append("categoryId", product.categoryId);
  }

  if (product.status) {
    formData.append("status", product.status);
  }

  const res = await fetch(`${API_URL}/api/admin/products/${id}`, {
    method: "PUT",
    body: formData,
    credentials: 'include',
  });
  return res.json();
}

export async function moveProductToTrash(id: string, cookieHeader?: string) {
  const res = await fetch(`${API_URL}/api/admin/products/${id}/trash`, {
    method: "PATCH",
    // Nếu chạy trên server (server action), ta truyền cookieHeader vào
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    // Nếu chạy trên client (browser) thì dùng credentials: 'include'
    credentials: cookieHeader ? undefined : 'include',
  });

  const data = await res.json().catch(() => ({} as any));

  if (!res.ok) {
    throw new Error(data.message || `Chuyển vào thùng rác thất bại`);
  }

  return data;
}

// Khôi phục bài viết
export async function restoreProduct(id: string, cookieHeader?: string) {
  const res = await fetch(`${API_URL}/api/admin/products/${id}/restore`, {
    method: 'PATCH',
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    credentials: cookieHeader ? undefined : 'include',
  });

  if (!res.ok) throw new Error('Khôi phục thất bại');
  return res.json();
}

// Xóa vĩnh viễn
export async function forceDeleteProduct(id: string, cookieHeader?: string) {
  const res = await fetch(`${API_URL}/api/admin/products/${id}/force`, {
    method: 'DELETE',
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    credentials: cookieHeader ? undefined : 'include',
  });

  if (!res.ok) throw new Error('Xóa vĩnh viễn thất bại');
  return res.json();
}

