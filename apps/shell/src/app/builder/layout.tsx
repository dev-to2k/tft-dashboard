import type { Metadata } from 'next';

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[var(--foreground)]">
            Team Builder
          </h1>
          <p className="mt-1 text-sm text-[var(--foreground)]/50">
            Plan your team composition and explore synergies.
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}
