import type { Metadata } from 'next';
import { HomeSections } from '@/components/dashboard/home-sections';

export const metadata: Metadata = {
  title: 'TFT Dashboard — Track the Meta, Browse the Wiki, Build Teams',
  description:
    'Live Teamfight Tactics meta stats, champion wiki, and an interactive team builder for the current patch.',
};

export default function HomePage() {
  return <HomeSections />;
}
