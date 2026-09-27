'use client';

import { useEffect, useState } from 'react';
import { useSavedCompsStore, useTeamBuilderStore } from '@tft/store';
import { decodeCompShare, encodeCompShare } from '@tft/utils';
import { Button } from '@tft/ui';
import { useDictionary } from '@/i18n/use-dictionary';
import { useMounted } from '@/hooks/use-mounted';

function copyText(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).then(
      () => true,
      () => false,
    );
  }
  return Promise.resolve(false);
}

export function SavedComps() {
  const storedBoard = useTeamBuilderStore((s) => s.board);
  const storedBench = useTeamBuilderStore((s) => s.bench);
  const storedLevel = useTeamBuilderStore((s) => s.level);
  const storedGold = useTeamBuilderStore((s) => s.gold);
  const loadSnapshot = useTeamBuilderStore((s) => s.loadSnapshot);
  const storedComps = useSavedCompsStore((s) => s.comps);
  const saveComp = useSavedCompsStore((s) => s.saveComp);
  const removeComp = useSavedCompsStore((s) => s.removeComp);
  const { dict } = useDictionary();
  const t = dict.saved;

  // Persisted snapshots only apply after mount (SSR/first paint use blanks).
  const mounted = useMounted();
  const board = mounted ? storedBoard : [];
  const bench = mounted ? storedBench : [];
  const level = mounted ? storedLevel : 1;
  const gold = mounted ? storedGold : 0;
  const comps = mounted ? storedComps : [];

  const [name, setName] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  // Load a comp from a shared `?share=` link (client-only, no Suspense needed).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('share');
    if (!encoded) return;
    const payload = decodeCompShare(encoded);
    if (payload) {
      loadSnapshot(payload);
      setNotice(t.sharedLoaded);
    } else {
      setNotice(t.invalidLink);
    }
    params.delete('share');
    const clean = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState(null, '', clean);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const boardCount = board.filter(Boolean).length;

  const handleSave = () => {
    if (boardCount === 0) {
      setNotice(t.needChampion);
      return;
    }
    saveComp(name || `Comp ${comps.length + 1}`, { board, bench, level, gold });
    setName('');
    setNotice(t.saved);
  };

  const handleShareCurrent = async () => {
    if (typeof window === 'undefined') return;
    if (boardCount === 0) {
      setNotice(t.needChampion);
      return;
    }
    const encoded = encodeCompShare({ board, bench, level, gold });
    const url = `${window.location.origin}${window.location.pathname}?share=${encoded}`;
    const ok = await copyText(url);
    setNotice(ok ? t.shareCopied : t.clipboardFail);
  };

  const handleShareSaved = async (id: string) => {
    if (typeof window === 'undefined') return;
    const comp = comps.find((c) => c.id === id);
    if (!comp) return;
    const encoded = encodeCompShare(comp);
    const url = `${window.location.origin}${window.location.pathname}?share=${encoded}`;
    const ok = await copyText(url);
    setNotice(ok ? t.shareSavedCopied(comp.name) : t.clipboardFail);
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {t.title(comps.length)}
        </h3>
        <Button type="button" variant="outline" size="sm" onClick={() => void handleShareCurrent()}>
          {t.shareCurrent}
        </Button>
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.namePlaceholder}
          maxLength={40}
          aria-label={t.nameLabel}
          className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm text-[var(--foreground)] placeholder:text-muted-foreground focus:border-[var(--accent-gold)] focus:outline-none focus:shadow-[0_0_12px_-4px_var(--accent-gold)]"
        />
        <Button type="button" variant="primary" size="sm" onClick={handleSave}>
          {t.save}
        </Button>
      </div>

      {notice ? (
        <p role="status" className="mt-3 rounded-lg border border-[var(--accent-gold)]/40 bg-[var(--accent-gold)]/10 px-3 py-2 text-xs font-medium text-[var(--accent-gold-text)]">
          {notice}
        </p>
      ) : null}

      {comps.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--background)] px-4 py-5 text-center text-xs text-muted-foreground">
          {t.empty}
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {comps.map((comp) => {
            const count = comp.board.filter(Boolean).length;
            return (
              <li
                key={comp.id}
                className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                    {comp.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {t.summary(count, comp.level, comp.gold)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    loadSnapshot(comp);
                    setNotice(t.loaded(comp.name));
                  }}
                >
                  {t.load}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => void handleShareSaved(comp.id)}>
                  {t.copyLink}
                </Button>
                <button
                  type="button"
                  onClick={() => removeComp(comp.id)}
                  aria-label={t.delete(comp.name)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
                >
                  <span aria-hidden="true">{'\u00D7'}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
