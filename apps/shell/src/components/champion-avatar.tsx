'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn, costRingClass, costVar } from '@tft/ui';

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
  const showImage = iconUrl !== '' && !failed;

  return (
    <div
      title={name}
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden bg-[var(--background)] font-bold text-white',
        sizeClasses[size],
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
          sizes="64px"
          loading="lazy"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        getInitials(name)
      )}
    </div>
  );
}
