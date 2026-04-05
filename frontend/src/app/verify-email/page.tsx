import { Suspense } from 'react';
import VerifyEmailClient from './VerifyEmailClient';
import LoadingClient from '@/components/ui/Loading/LoadingClient';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingClient />}>
      <VerifyEmailClient />
    </Suspense>
  );
}
