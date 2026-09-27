"use client";

import * as React from 'react';
import { cn } from '../lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  className?: string;
  emptyMessage?: string;
  /** Return tier label (e.g. 'S') for a row to enable S-tier highlight. */
  getRowTier?: (row: T) => string | undefined;
  /** Extra per-row classes. */
  rowClassName?: (row: T, index: number) => string | undefined;
  /** When true, tbody fades (opacity transition) to signal sorting. */
  isSorting?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  onSort,
  sortKey,
  sortDirection,
  className,
  emptyMessage = 'No data available',
  getRowTier,
  rowClassName,
  isSorting = false,
}: DataTableProps<T>) {
  const handleSort = (key: string) => {
    if (!onSort) return;
    const newDirection =
      sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(key, newDirection);
  };

  return (
    <div className={cn('w-full overflow-auto', className)}>
      <table className="w-full caption-bottom text-sm tabular-nums">
        <thead className="sticky top-0 z-10">
          <tr className="border-b border-[var(--accent-gold)]/30 bg-[var(--card-bg)] bg-gradient-to-b from-[var(--accent-gold)]/[0.07] to-transparent">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                aria-sort={
                  col.sortable && sortKey === col.key
                    ? sortDirection === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : undefined
                }
                className={cn(
                  'sticky top-0 z-10 h-10 bg-[var(--card-bg)] px-4 text-left align-middle text-[11px] font-black uppercase tracking-widest text-muted-foreground tabular-nums',
                  col.sortable && 'cursor-pointer select-none hover:text-[var(--accent-gold)]',
                  col.className,
                )}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <div className="flex items-center gap-1">
                  {col.header}
                  {col.sortable && sortKey === col.key && (
                    <span className="text-[var(--accent-gold)]">
                      {sortDirection === 'asc' ? '\u25B2' : '\u25BC'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody
          className={cn(
            'transition-opacity duration-200',
            isSorting && 'opacity-50',
          )}
        >
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => {
              const tier = getRowTier?.(row);
              const isSTier = tier === 'S';
              return (
                <tr
                  key={rowIndex}
                  className={cn(
                    'border-b border-[var(--border)]/50 transition-colors even:bg-[var(--foreground)]/[0.03] hover:bg-[var(--accent-gold)]/[0.06]',
                    isSTier &&
                      'border-l-2 border-l-[var(--accent-gold)] bg-[var(--accent-gold)]/[0.04]',
                    rowClassName?.(row, rowIndex),
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn('p-4 align-middle text-[var(--foreground)] tabular-nums', col.className)}
                    >
                      {col.render
                        ? col.render(row)
                        : (row as Record<string, unknown>)[col.key] as React.ReactNode}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
