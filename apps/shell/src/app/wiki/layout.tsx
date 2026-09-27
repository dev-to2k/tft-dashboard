import type { Metadata } from 'next';

import { WikiHeader } from '@/components/wiki-header';

export const metadata: Metadata = {
  title: 'TFT Wiki — TFT Dashboard',
  description:
    'Complete TFT reference for champions, traits, items, and augments in the current set.',
};

export default function WikiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {/* Wiki Header */}
      <WikiHeader />

      {children}
    </div>
  );
}
