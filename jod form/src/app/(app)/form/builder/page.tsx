'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { FormBuilderLayout } from '@/components/form-builder/form-builder-layout';

export default function FormBuilderPage() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get('id');
  const initialFormId = idParam ? Number(idParam) : undefined;

  return (
    <div className="w-full">
      <FormBuilderLayout initialFormId={initialFormId} />
    </div>
  );
}
