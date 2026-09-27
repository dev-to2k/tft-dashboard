import type { Metadata } from 'next';
import { Chakra_Petch, Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Navigation } from '@/components/navigation';
import { SkipLink } from '@/components/skip-link';

const display = Chakra_Petch({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-display',
});

const body = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-body',
});

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
      <body className={`${display.variable} ${body.variable} min-h-screen bg-[var(--background)] text-[var(--foreground)]`}>
        <Providers>
          <SkipLink />
          <div className="flex min-h-screen flex-col">
            <Navigation />
            <main id="main-content" className="page-enter w-full flex-1 py-6 lg:py-8">
              <div className="app-container">{children}</div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
