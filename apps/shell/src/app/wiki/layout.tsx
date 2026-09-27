import type { Metadata } from 'next';

import { WikiHeaderSlot } from '@/components/wiki-header-slot';

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
      {/* Wiki Header (lazy client slot — keeps layout chunk stable) */}
      <WikiHeaderSlot />

      {children}
    </div>
  );
}
