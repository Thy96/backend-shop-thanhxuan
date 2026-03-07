'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';

import { getProductById, updateProduct } from '@/lib/api/apiProducts';
import { getProductCategories } from '@/lib/api/apiProductCategories';

import { finalPrice } from '@/utils/format';

import Input from '@/components/Input/Input';
import Select from '@/components/Select/Select';

import { ChevronLeft } from 'lucide-react';
import { CategoryOption } from '@/utils/category';
import Button from '@/components/Button/Button';
import isEditorContentValid from '@/utils/validationEditor';
import Editor from '@/components/Editor/Editor';
import LoadingClient from '@/components/Loading/LoadingClient';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const editorRef = useRef<any>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    price: 0,
    sale: 0,
    stock: 0,
    categoryId: '',
    status: '',
  });

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isPending, startTransition] = useTransition();
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingCate, setLoadingCate] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [percent, setPercent] = useState('0');
  const [quality, setQuality] = useState('0');

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const target = e.target as
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement;
    const { name, value } = e.target;

    // Sale: chỉ nhận 0..100, loại 0 đầu, sync percent & formData
    if (name === 'sale') {
      let numStr = value;
      if (numStr.length > 1 && numStr.startsWith('0'))
        numStr = numStr.replace(/^0+/, '');
      if (numStr === '') {
        setPercent('');
        setFormData((prev) => ({ ...prev, sale: 0 }));
        return;
      }
      let num = Number(numStr);
      if (isNaN(num)) num = 0;
      if (num > 100) num = 100;
      if (num < 0) num = 0;

      setPercent(num.toString());
      setFormData((prev) => ({ ...prev, sale: num }));
      return; // ⚠️ dừng ở đây để không bị dòng default ghi đè
    }

    // Stock: không được âm
    if (name === 'stock') {
      let numStr = value;
      if (numStr.length > 1 && numStr.startsWith('0'))
        numStr = numStr.replace(/^0+/, '');
      if (numStr === '') {
        setQuality('');
        setFormData((prev) => ({ ...prev, stock: 0 }));
        return;
      }
      let num = Number(numStr);
      if (isNaN(num)) num = 0;
      if (num < 0) num = 0;

      setQuality(num.toString());
      setFormData((prev) => ({ ...prev, stock: num }));
      return; // ⚠️ dừng ở đây để không bị dòng default ghi đè
    }

    // Các field số khác (nếu có): price, stock...
    const numericFields = new Set(['price', 'stock']);
    if (numericFields.has(name)) {
      const num = Number((target as HTMLInputElement).value);
      setFormData((prev) => ({ ...prev, [name]: isNaN(num) ? 0 : num }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Additional images change
  const handleAdditionalImagesChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);

    // Giới hạn 3 ảnh
    if (images.length + selectedFiles.length > 3) {
      alert('Chỉ được chọn tối đa 3 hình ảnh');
      return;
    }

    const newImages = selectedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  const removeAdditionalImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getProductCategories();
        setCategories(data);
      } catch (error) {
        console.error(error);
        setError('Không lấy được danh sách category');
      } finally {
        setLoadingCate(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoadingPage(true); // nếu bạn có state loading

        const product = await getProductById(params.id as string);

        if (!product) return;

        // ⭐ set form
        setFormData({
          title: product.title || '',
          content: product.content || '',
          price: product.price || 0,
          sale: product.sale || 0,
          stock: product.stock || 0,
          categoryId: product.categoryId || '',
          status: product.status || '',
        });

        // ⭐ normalize images
        const normalizedImages = (product.images || []).map((img: any) => {
          const BASE_URL = 'http://localhost:4000';

          if (typeof img === 'string') {
            const fullUrl = img.startsWith('/uploads/')
              ? `${BASE_URL}${img}`
              : img;

            return { file: null as any, preview: fullUrl };
          }

          return img;
        });

        setImages(normalizedImages);
        setPercent(String(product.sale || 0));
        setQuality(String(product.stock || 0));
      } catch (err) {
        console.error('Fetch product error:', err);
        setError('Không thể tải sản phẩm'); // nếu bạn có error state
      } finally {
        setLoadingPage(false);
      }
    }

    if (params.id) fetchProduct();
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoadingSubmit(true);
    if (!editorRef.current) {
      alert('Editor chưa sẵn sàng');
      return;
    }

    const content = await editorRef.current.save();

    if (!isEditorContentValid(content)) {
      alert('Vui lòng nhập nội dung!!!');
      return;
    }

    const data = {
      images: images
        .filter((img) => img.file) // chỉ ảnh mới
        .map((img) => img.file as File),
      title: formData.title,
      content: content,
      price: formData.price,
      sale: formData.sale,
      stock: formData.stock,
      categoryId: formData.categoryId,
      status: formData.status,
    };
    try {
      await updateProduct(params.id as string, data);
      startTransition(() => {
        router.push('/admin/products');
      });
    } catch (error: any) {
      setError(error.message || 'Cập nhật không thành công!');
      setLoadingSubmit(false);
    }
  }

  if (loadingPage) return <LoadingClient />;

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
        {/* Ảnh */}
        <div>
          <Input
            label="📁 Chọn nhiều hình ảnh"
            id="images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleAdditionalImagesChange}
            classNames={{
              wrapper: '!mb-1',
              input: 'hidden',
              label:
                'cursor-pointer inline-block bg-blue-500 text-white px-4 py-2 rounded shadow-md hover:bg-blue-600 transition',
            }}
          />
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, index) => (
              <div key={index} className="relative group">
                <Image
                  src={img.preview}
                  alt={`Additional Preview ${index}`}
                  className="w-full h-33 object-cover rounded-lg border"
                  width={1000}
                  height={1000}
                />
                <button
                  type="button"
                  onClick={() => removeAdditionalImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full px-2 py-0 text-xs opacity-0 group-hover:opacity-100 transition cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-red-500 mt-1 mb-4">
            * Tối đa 3 hình ảnh và hình ảnh giới hạn 5MB
          </p>
        </div>

        {/* Category */}
        <Select
          options={categories.map((cat) => ({
            value: cat._id,
            label: cat.name,
          }))}
          value={formData.categoryId}
          name="categoryId"
          onChange={handleChange}
          label="Danh mục"
          required
        />

        {/* Tiêu đề */}
        <Input
          id="title"
          placeholder="Nhập tên sản phẩm..."
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          label="Tiêu đề"
        />

        {/* Nội dung */}
        {formData.content && typeof formData.content === 'object' && (
          <Editor
            initialData={formData.content}
            onReady={(editor) => {
              editorRef.current = editor;
            }}
          />
        )}

        {/* Giá & Khuyến mãi */}
        <div className="grid grid-cols-3 gap-2 mb-0">
          <Input
            id="price"
            placeholder="Nhập giá sản phẩm..."
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            label="Giá tiền"
            note={
              <>
                <p className="text-xs text-red-500 mt-2">
                  * Giá sản phẩm sau khi giảm {percent}%:{' '}
                  {finalPrice(String(formData.price), String(formData.sale))}đ
                </p>
              </>
            }
          />
          <Input
            id="sale"
            placeholder="Nhập % sale..."
            name="sale"
            type="number"
            min={0}
            max={100}
            value={percent}
            onChange={handleChange}
            required
            label="Giảm giá %"
          />
          <Input
            id="stock"
            placeholder="Stock"
            name="stock"
            type="number"
            min={0}
            value={quality}
            onChange={handleChange}
            label="Hàng tồn kho"
          />
        </div>

        <Button type="submit">Cập nhật sản phẩm</Button>
      </form>
    </>
  );
}
