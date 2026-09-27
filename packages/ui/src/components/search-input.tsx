"use client";

import * as React from 'react';
import { Search } from 'lucide-react';
import { cn } from '../lib/utils';

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onChange?: (value: string) => void;
  debounceMs?: number;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onChange, debounceMs = 300, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(
      (props.defaultValue as string) ?? '',
    );
    const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInternalValue(value);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        onChange?.(value);
      }, debounceMs);
    };

    React.useEffect(() => {
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }, []);

    return (
      <div className={cn('group relative', className)}>
        <Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-[var(--accent-gold)]" />
        <input
          ref={ref}
          type="text"
          value={props.value ?? internalValue}
          onChange={handleChange}
          className={cn(
            'flex h-10 w-full rounded-md border border-[var(--border)] bg-[var(--card-bg)] pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-muted-foreground focus:border-[var(--accent-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)] focus:shadow-[0_0_16px_-6px_var(--accent-gold)]',
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);
SearchInput.displayName = 'SearchInput';
