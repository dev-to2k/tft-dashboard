import type { Metadata } from 'next';
import { MetaFilterBar } from '@/components/meta-filter-bar';

export const metadata: Metadata = {
  title: 'Meta Overview — TFT Dashboard',
  description:
    'Live TFT meta tier lists, champion win rates, and top compositions for the current patch.',
};

export default function MetaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <MetaFilterBar />

      {children}
    </div>
  );
}
