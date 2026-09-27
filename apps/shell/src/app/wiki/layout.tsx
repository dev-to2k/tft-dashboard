import type { Metadata } from 'next';

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
      <div className="rounded-xl border border-[var(--border)] bg-gradient-to-r from-[var(--card-bg)] to-[var(--background)] p-6">
        <h1 className="text-2xl font-black text-[var(--foreground)]">
          TFT Wiki
        </h1>
        <p className="mt-1 text-sm text-[var(--foreground)]/50">
          Set 18 - Enchanted Wilds &mdash; Complete reference for champions, traits, items, and augments.
        </p>
      </div>

      {children}
    </div>
  );
}
