import { Suspense } from 'react';
import ResetPasswordClient from './ResetPasswordClient';
import LoadingClient from '@/components/ui/Loading/LoadingClient';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingClient />}>
      <ResetPasswordClient />
    </Suspense>
  );
}
