'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

import type { OutputData } from '@editorjs/editorjs';
import { serverUpdateProduct } from '@/app/actions/productActions';

import { ChevronLeft } from 'lucide-react';
import { CategoryOption } from '@/utils/format/category';
import isEditorContentValid from '@/utils/validation/validationEditor';
import { finalPrice } from '@/utils/format/format';

import Input from '@/components/ui/forms/Input';
import Select from '@/components/ui/forms/Select';
import Button from '@/components/ui/forms/Button';
import Editor from '@/components/ui/forms/Editor';
import LoadingClient from '@/components/ui/Loading/LoadingClient';

interface ProductDetail {
  _id: string;
  title: string;
  price: number;
  sale: number;
  stock: number;
  status: string;
  categoryId: string | CategoryOption;
  content: OutputData;
  images: string[];
}

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const editorRef = useRef<{ save: () => Promise<OutputData> } | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<{ file: File; preview: string }[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loadingCate, setLoadingCate] = useState(true);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [initialContent, setInitialContent] = useState<OutputData | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    price: 0,
    sale: 0,
    stock: 0,
    categoryId: '',
    status: 'draft',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const [productRes, cateRes] = await Promise.all([
          fetch(`${apiUrl}/api/admin/products/${id}`, { cache: 'no-store', credentials: 'include' }),
          fetch(`${apiUrl}/api/admin/products/categories`, { cache: 'no-store', credentials: 'include' }),
        ]);
        const product: ProductDetail = await productRes.json();
        const cates: CategoryOption[] = await cateRes.json();

        setCategories(cates);
        setFormData({
          title: product.title,
          price: product.price,
          sale: product.sale,
          stock: product.stock,
          categoryId: typeof product.categoryId === 'string' ? product.categoryId : product.categoryId._id,
          status: product.status || 'draft',
        });
        if (product.images?.length) setExistingImages(product.images);
        if (product.content) setInitialContent(product.content);
      } catch (err) {
        console.error(err);
        setError('Không thể tải dữ liệu sản phẩm');
      } finally {
        setLoadingProduct(false);
        setLoadingCate(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    if (name === 'sale') {
      if (value === '') { setFormData((prev) => ({ ...prev, sale: 0 })); return; }
      let num = Number(value);
      if (isNaN(num)) num = 0;
      if (num > 100) num = 100;
      if (num < 0) num = 0;
      setFormData((prev) => ({ ...prev, sale: num }));
      return;
    }

    if (name === 'stock' || name === 'price') {
      if (value === '') { setFormData((prev) => ({ ...prev, [name]: 0 })); return; }
      let num = Number(value);
      if (isNaN(num)) num = 0;
      if (num < 0) num = 0;
      setFormData((prev) => ({ ...prev, [name]: num }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    const totalCount = existingImages.length + newImages.length + selectedFiles.length;
    if (totalCount > 3) {
      alert('Chỉ được chọn tối đa 3 hình ảnh');
      return;
    }
    const mapped = selectedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setNewImages((prev) => [...prev, ...mapped]);
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoadingSubmit(true);

    try {
      if (!editorRef.current) throw new Error('Editor chưa sẵn sàng');

      const content = await editorRef.current.save();

      if (!isEditorContentValid(content)) {
        throw new Error('Vui lòng nhập nội dung');
      }

      const data = {
        title: formData.title,
        content,
        price: formData.price,
        sale: formData.sale,
        stock: formData.stock,
        categoryId: formData.categoryId,
        status: formData.status,
        images: newImages.length > 0 ? newImages.map((img) => img.file) : null,
      };

      await serverUpdateProduct(id, data);
      startTransition(() => {
        router.push('/admin/products');
      });
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : 'Cập nhật không thành công!',
      );
    } finally {
      setLoadingSubmit(false);
    }
  }

  if (loadingProduct) return <LoadingClient text="Đang tải sản phẩm..." />;

  return (
    <>
      {(loadingSubmit || isPending) && (
        <LoadingClient text="Đang cập nhật sản phẩm..." />
      )}
      <Button
        type="button"
        onClick={() => router.push('/admin/products')}
        className="flex justify-center max-w-[150]"
      >
        <ChevronLeft width={23} height={23} /> Quay Lại
      </Button>
      <form onSubmit={handleSubmit} className="space-y-2 mt-4">
        {/* Images */}
        <div>
          <Input
            label="📁 Chọn hình ảnh mới (tối đa 3)"
            id="images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImagesChange}
            classNames={{
              wrapper: '!mb-1',
              input: 'hidden',
              label:
                'cursor-pointer inline-block bg-blue-500 text-white px-4 py-2 rounded shadow-md hover:bg-blue-600 transition',
            }}
          />
          <div className="grid grid-cols-3 gap-2">
            {existingImages.map((url, index) => (
              <div key={`existing-${index}`} className="relative group">
                <Image
                  src={url}
                  alt={`Ảnh ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border"
                  width={100}
                  height={100}
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full px-2 py-0 text-xs opacity-0 group-hover:opacity-100 transition cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ))}
            {newImages.map((img, index) => (
              <div key={`new-${index}`} className="relative group">
                <Image
                  src={img.preview}
                  alt={`Ảnh mới ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border opacity-80"
                  width={100}
                  height={100}
                />
                <button
                  type="button"
                  onClick={() => removeNewImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full px-2 py-0 text-xs opacity-0 group-hover:opacity-100 transition cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-red-500 mt-1 mb-4">
            * Tối đa 3 hình ảnh, giới hạn 5MB mỗi file
          </p>
        </div>

        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Select
              options={categories.map((cat) => ({
                value: cat._id,
                label: cat.name,
              }))}
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              label="Danh mục"
              required
              disabled={loadingCate}
            />
          </div>

          <div className="w-56">
            <Select
              name="status"
              label="Trạng thái"
              value={formData.status}
              onChange={handleChange}
              options={[
                { value: 'draft', label: 'Bản nháp' },
                { value: 'available', label: 'Xuất bản' },
              ]}
              required
            />
          </div>
        </div>

        <Input
          id="title"
          label="Tiêu đề"
          placeholder="Nhập tiêu đề sản phẩm..."
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <Editor
          initialData={initialContent}
          onReady={(editor) => {
            editorRef.current = editor;
          }}
        />

        <div className="grid grid-cols-3 gap-2">
          <Input
            id="price"
            label="Giá tiền"
            placeholder="Nhập giá..."
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            note={
              <p className="text-xs text-red-500 mt-2">
                Giá sau giảm {formData.sale}%:{' '}
                {finalPrice(String(formData.price), String(formData.sale))}đ
              </p>
            }
            required
          />
          <Input
            id="sale"
            label="Giảm giá %"
            placeholder="0-100"
            name="sale"
            type="number"
            min={0}
            max={100}
            value={formData.sale}
            onChange={handleChange}
            required
          />
          <Input
            id="stock"
            label="Hàng tồn kho"
            placeholder="Nhập số lượng..."
            name="stock"
            type="number"
            min={0}
            value={formData.stock}
            onChange={handleChange}
          />
        </div>

        <Button type="submit">Cập Nhật Sản Phẩm</Button>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </form>
    </>
  );
}
