'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn, costRingClass, costVar } from '@tft/ui';
import { IMAGE_BLUR_DATA_URL } from './image-placeholder';

function getInitials(name: string): string {
  const parts = name.split(/[\s']+/).filter(Boolean);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

const sizeClasses = {
  sm: 'h-8 w-8 text-[10px]',
  md: 'h-12 w-12 text-sm',
  lg: 'h-14 w-14 text-lg',
} as const;

/** Fixed-pixel `sizes` per avatar size so the optimizer never fetches a hero-sized tile. */
const sizePixels = {
  sm: '32px',
  md: '48px',
  lg: '56px',
} as const;

export interface ChampionAvatarProps {
  name: string;
  iconUrl: string;
  cost?: number;
  size?: keyof typeof sizeClasses;
  className?: string;
}

export function ChampionAvatar({
  name,
  iconUrl,
  cost,
  size = 'md',
  className,
}: ChampionAvatarProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const showImage = iconUrl !== '' && !failed;

  return (
    <div
      title={name}
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden bg-[var(--background)] font-bold text-white',
        sizeClasses[size],
        // Skeleton pulse while the upstream tile is in flight.
        showImage && !loaded && 'animate-pulse bg-[var(--foreground)]/10',
        cost !== undefined && costRingClass[cost]
          ? `ring-1 ${costRingClass[cost]}`
          : 'ring-1 ring-[var(--border)]',
        className,
      )}
      style={
        !showImage && cost !== undefined && costVar[cost]
          ? { backgroundColor: costVar[cost] }
          : undefined
      }
    >
      {showImage ? (
        <Image
          src={iconUrl}
          alt={name}
          fill
          sizes={sizePixels[size]}
          loading="lazy"
          placeholder="blur"
          blurDataURL={IMAGE_BLUR_DATA_URL}
          className={cn('object-cover transition-opacity duration-300', loaded ? 'opacity-100' : 'opacity-0')}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      ) : (
        getInitials(name)
      )}
    </div>
  );
}
