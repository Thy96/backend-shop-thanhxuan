'use client';

import { useRouter } from 'next/navigation';
import { EditButton } from '@/components/ui/forms/Button';

interface Props {
  href: string;
}

export default function EditCategoryButton({ href }: Props) {
  const router = useRouter();

  return (
    <EditButton type="button" onClick={() => router.push(href)}>
      Sửa
    </EditButton>
  );
}
