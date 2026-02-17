import { Suspense } from 'react';
import VerifyContent from './VerifyContent';

export default function VerifyPaymentPage() {
  return (
    <Suspense fallback={<p className="p-10 text-center">Loading verification...</p>}>
      <VerifyContent />
    </Suspense>
  );
}