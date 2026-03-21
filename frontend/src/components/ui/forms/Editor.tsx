'use client';

import type { OutputData, ToolConstructable } from '@editorjs/editorjs';
import { useEffect, useId, useRef } from 'react';

interface EditorInstance {
  isReady: Promise<void>;
  save: () => Promise<OutputData>;
  destroy: () => void;
}

interface EditorProps {
  initialData?: OutputData;
  onReady?: (editor: Pick<EditorInstance, 'save'>) => void;
  children?: string;
}

const unsafeTool = <T,>(tool: T) => tool as unknown as ToolConstructable;

export default function Editor({
  initialData,
  onReady,
  children = 'Nội dung',
}: EditorProps) {
  const editorRef = useRef<EditorInstance | null>(null);
  const holderId = useId();

  useEffect(() => {
    let mounted = true;

    const initEditor = async () => {
      const EditorJS = (await import('@editorjs/editorjs')).default;
      const Header = (await import('@editorjs/header')).default;
      const List = (await import('@editorjs/list')).default;
      const ImageTool = (await import('@editorjs/image')).default;

      if (!editorRef.current && mounted) {
        const editor = new EditorJS({
          holder: holderId,
          data: initialData,
          placeholder: 'Nhập nội dung bài viết...',
          tools: {
            header: {
              class: unsafeTool(Header),
              inlineToolbar: true,
            },
            list: {
              class: List,
              inlineToolbar: true,
            },
            image: {
              class: ImageTool,
              config: {
                uploader: {
                  uploadByFile: async (file: File) => {
                    try {
                      const formData = new FormData();
                      formData.append('thumbnail', file);

                      const res = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/uploads`,
                        {
                          method: 'POST',
                          body: formData,
                        },
                      );

                      console.log('UPLOAD STATUS:', res.status);
                      console.log('UPLOAD OK:', res.ok);

                      if (!res.ok) {
                        const text = await res.text();
                        console.error('UPLOAD RESPONSE TEXT:', text);
                        throw new Error('Upload Failed');
                      }

                      const data = await res.json();

                      if (!data?.file?.url) {
                        console.error('UPLOAD RESPONSE INVALID:', data);
                        throw new Error('Invalid upload response');
                      }

                      return {
                        success: 1,
                        file: { url: data.file.url },
                      };
                    } catch (error) {
                      console.error('UPLOAD IMAGE ERROR:', error);
                      throw error; // 👈 BẮT BUỘC throw để EditorJS hiện lỗi
                    }
                  },
                },
              },
            },
          },
        });

        editorRef.current = editor;
        onReady?.(editor);
      }
    };

    initEditor();

    return () => {
      mounted = false;
      if (editorRef.current) {
        editorRef.current.isReady
          .then(() => {
            editorRef.current?.destroy();
            editorRef.current = null;
          })
          .catch(() => {});
      }
    };
  }, []);

  return (
    <div className="w-full mb-4">
      <p className="mb-1 text-lg font-medium text-gray-700">{children}</p>
      <div
        id={holderId}
        className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-400 focus:outline-none transition bg-white  "
      />
    </div>
  );
}
