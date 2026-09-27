import { LoadingSkeleton } from '@tft/ui';

export default function RootLoading() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <LoadingSkeleton key={i} variant="card" />
      ))}
    </div>
  );
}
