import type { Metadata } from 'next';

import { BuilderHeader } from '@/components/builder/builder-header';

export const metadata: Metadata = {
  title: 'Team Builder — TFT Dashboard',
  description:
    'Plan your TFT team composition with an interactive board builder and live trait synergies.',
};

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <BuilderHeader />
      {children}
    </div>
  );
}
