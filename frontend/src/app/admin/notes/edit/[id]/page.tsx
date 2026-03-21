'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

import type { OutputData } from '@editorjs/editorjs';
import { serverUpdateNote } from '@/app/actions/noteActions';

import { ChevronLeft } from 'lucide-react';
import { CategoryOption } from '@/utils/format/category';
import isEditorContentValid from '@/utils/validation/validationEditor';

import Input from '@/components/ui/forms/Input';
import Select from '@/components/ui/forms/Select';
import Button from '@/components/ui/forms/Button';
import Editor from '@/components/ui/forms/Editor';
import LoadingClient from '@/components/ui/Loading/LoadingClient';

interface NoteDetail {
  _id: string;
  title: string;
  categoryId: string | CategoryOption;
  content: OutputData;
  thumbnail: string;
}

export default function EditNotePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const editorRef = useRef<{ save: () => Promise<OutputData> } | null>(null);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageDeleted, setImageDeleted] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loadingCate, setLoadingCate] = useState(true);
  const [loadingNote, setLoadingNote] = useState(true);
  const [initialContent, setInitialContent] = useState<OutputData | undefined>(
    undefined,
  );
  const [isPending, startTransition] = useTransition();
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [noteRes, cateRes] = await Promise.all([
          fetch(`/api/admin/notes/${id}`, {
            cache: 'no-store',
            credentials: 'include',
          }),
          fetch('/api/admin/notes/categories', {
            cache: 'no-store',
            credentials: 'include',
          }),
        ]);
        const note: NoteDetail = await noteRes.json();
        const cates: CategoryOption[] = await cateRes.json();

        setCategories(cates);
        setFormData({
          title: note.title,
          categoryId:
            typeof note.categoryId === 'string'
              ? note.categoryId
              : note.categoryId._id,
        });
        if (note.thumbnail) setPreview(note.thumbnail);
        if (note.content) setInitialContent(note.content);
      } catch (err) {
        console.error(err);
        setError('Không thể tải dữ liệu bài viết');
      } finally {
        setLoadingNote(false);
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImage(file);
      setFileName(file.name);
      setPreview(URL.createObjectURL(file));
      setImageDeleted(false);
    }
  };

  const removeImage = () => {
    setPreview(null);
    setNewImage(null);
    setImageDeleted(true);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoadingSubmit(true);

    try {
      if (!editorRef.current) throw new Error('Editor chưa sẵn sàng');

      const content = await editorRef.current.save();

      if (!isEditorContentValid(content))
        throw new Error('Vui lòng nhập nội dung');

      const data = {
        thumbnail: newImage,
        title: formData.title,
        content,
        categoryId: formData.categoryId,
        imageDeleted,
      };

      await serverUpdateNote(id, data);
      startTransition(() => {
        router.push('/admin/notes');
      });
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : 'Cập nhật không thành công!',
      );
    } finally {
      setLoadingSubmit(false);
    }
  }

  if (loadingNote) return <LoadingClient text="Đang tải bài viết..." />;

  return (
    <>
      {(loadingSubmit || isPending) && (
        <LoadingClient text="Đang cập nhật bài viết..." />
      )}
      <Button
        type="button"
        onClick={() => router.push('/admin/notes')}
        className="flex justify-center max-w-[150]"
      >
        <ChevronLeft width={23} height={23} /> Quay Lại
      </Button>
      <form onSubmit={handleSubmit} className="space-y-2 mt-4">
        <div>
          <Input
            label="📁 Chọn hình ảnh"
            id="thumbnail"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            classNames={{
              wrapper: '!mb-1',
              input: 'hidden',
              label:
                'cursor-pointer inline-block bg-blue-500 text-white px-4 py-2 rounded shadow-md hover:bg-blue-600 transition',
            }}
          />

          {preview && (
            <div
              className="relative group"
              style={{ width: '128px', height: '128px' }}
            >
              <Image
                src={preview}
                alt={fileName ?? 'thumbnail'}
                className="w-32 h-32 object-cover rounded-lg border"
                width={350}
                height={350}
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full px-2 py-0 text-xs opacity-0 group-hover:opacity-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
          <p className="text-xs text-red-500 mt-1 mb-4">
            * Hình ảnh giới hạn 5MB
          </p>
        </div>

        <Select
          options={categories.map((cat) => ({
            value: cat._id,
            label: cat.name,
          }))}
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          label="Thể Loại"
          required
          disabled={loadingCate}
        />

        <Input
          id="title"
          label="Tiêu Đề"
          placeholder="Nhập tiêu đề..."
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

        <Button type="submit">Cập Nhật Tin Tức</Button>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </form>
    </>
  );
}
