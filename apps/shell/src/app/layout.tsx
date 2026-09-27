import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Navigation } from '@/components/navigation';
import { SkipLink } from '@/components/skip-link';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

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
      <body className={`${inter.className} min-h-screen bg-[var(--background)] text-[var(--foreground)]`}>
        <Providers>
          <SkipLink />
          <div className="flex min-h-screen flex-col">
            <Navigation />
            <main id="main-content" className="w-full flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
