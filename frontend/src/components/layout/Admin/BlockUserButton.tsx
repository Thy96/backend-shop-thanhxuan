'use client';

import Button from '@/components/ui/forms/Button';
import { useFormStatus } from 'react-dom';

function SubmitButton({ isBlocked }: { isBlocked: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className={`text-white px-3 py-1 rounded transition text-sm w-full cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed ${
        isBlocked
          ? 'bg-green-500 hover:bg-green-600'
          : 'bg-red-500 hover:bg-red-600'
      }`}
    >
      {pending
        ? isBlocked
          ? 'Đang mở khóa...'
          : 'Đang khóa...'
        : isBlocked
          ? 'Mở khóa'
          : 'Khóa'}
    </Button>
  );
}

export default function BlockUserButton({
  id,
  isBlocked,
  action,
}: {
  id: string;
  isBlocked: boolean;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <SubmitButton isBlocked={isBlocked} />
    </form>
  );
}
