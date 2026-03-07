'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';

import { getNoteById, updateNote } from '@/lib/api/apiNotes';
import { getNoteCategories } from '@/lib/api/apiNoteCategories';

import { ChevronLeft } from 'lucide-react';

import { CategoryOption } from '@/utils/category';
import isEditorContentValid from '@/utils/validationEditor';

import Input from '@/components/Input/Input';
import Select from '@/components/Select/Select';
import Button from '@/components/Button/Button';
import Editor from '@/components/Editor/Editor';
import LoadingClient from '@/components/Loading/LoadingClient';

export default function EditNotePage() {
  const editorRef = useRef<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
  });
  const [isPending, startTransition] = useTransition();
  const [image, setImage] = useState<File | string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loadingCate, setLoadingCate] = useState(true);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageDeleted, setImageDeleted] = useState(false);

  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getNoteCategories();
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
    async function fetchNote() {
      try {
        setLoadingPage(true);
        const note = await getNoteById(params.id as string);

        if (!note) {
          throw new Error('Không tìm thấy ghi chú');
        }

        const parsedContent =
          typeof note.content === 'string'
            ? JSON.parse(note.content)
            : note.content;

        const data = {
          title: note.title || '',
          content: parsedContent || '',
          categoryId: note.categoryId || '',
        };

        setFormData(data);
        setPreview(note.thumbnail || '');
      } catch (error: any) {
        console.error('Fetch note error:', error);
        setError(error?.message || 'Có lỗi khi tải ghi chú');
      } finally {
        setLoadingPage(false);
      }
    }

    if (params.id) fetchNote();
  }, [params.id]);

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
      setImage(file);
      setFileName(file.name);
      setPreview(URL.createObjectURL(file));
    } else {
      setImage(null);
      setFileName(null);
      setPreview(null);
    }
  };

  const removeImage = () => {
    setPreview(null);
    setImage(null);
    setImageDeleted(true);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // console.log('EDITOR REF:', editorRef.current);
    setLoadingSubmit(true);

    try {
      if (!editorRef.current) throw new Error('Editor chưa sẵn sàng');

      const content = await editorRef.current.save();
      // console.log('EDITOR CONTENT:', content);

      if (!isEditorContentValid(content))
        throw new Error('Vui lòng nhập nội dung');

      const data = {
        thumbnail: image,
        title: formData.title,
        content: content,
        categoryId: formData.categoryId,
        imageDeleted,
      };
      await updateNote(params.id as string, data);
      startTransition(() => {
        router.push('/admin/notes');
      });
    } catch (error: any) {
      setError(error.message || 'Cập nhật không thành công!');
    } finally {
      setLoadingSubmit(false);
    }
  }

  if (loadingPage) return <LoadingClient />;

  console.log(formData);

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
              style={{
                width: '128px',
                height: '128px',
              }}
            >
              <Image
                src={preview}
                alt={fileName ? fileName : 'example'}
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
            value: cat._id, // 👈 DÙNG _id gán vào slug
            label: cat.name,
          }))}
          value={formData.categoryId}
          name="categoryId"
          onChange={handleChange}
          label="Thể Loại"
          required
        />
        <Input
          id="title"
          label="Tiêu đề"
          placeholder="Nhập tiêu đề..."
          name="title"
          defaultValue={formData.title}
          onChange={handleChange}
          required
        />

        {formData.content && (
          <Editor
            initialData={formData.content}
            onReady={(editor) => {
              editorRef.current = editor;
            }}
          />
        )}

        <Button type="submit">Cập nhật bài viết</Button>
      </form>
    </>
  );
}
