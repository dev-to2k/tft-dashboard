import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Navigation } from '@/components/navigation';

export const metadata: Metadata = {
  title: 'TFT Dashboard - Teamfight Tactics Companion',
  description:
    'Your ultimate Teamfight Tactics companion. Track meta comps, browse champions and traits, build teams, and stay on top of every patch.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <Providers>
          <div className="flex min-h-screen flex-col lg:flex-row">
            <Navigation />
            <main className="flex-1 overflow-auto p-4 lg:p-8">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
