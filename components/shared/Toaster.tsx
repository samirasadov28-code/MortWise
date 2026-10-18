'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useTranslation } from '@/lib/i18n/I18nProvider';

export type ToastKind = 'info' | 'success' | 'error';

export interface ToastInput {
  kind?: ToastKind;
  message: string;
  /** Auto-dismiss after N ms. Pass 0 for sticky. Defaults to 4000. */
  durationMs?: number;
}

interface Toast extends Required<Omit<ToastInput, 'durationMs'>> {
  id: string;
  durationMs: number;
}

type Listener = () => void;

let toasts: Toast[] = [];
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): Toast[] {
  return toasts;
}

function getServerSnapshot(): Toast[] {
  return [];
}

/**
 * Imperative API — call from anywhere (event handlers, fetch error catch
 * blocks). The mounted <Toaster /> picks them up via useSyncExternalStore.
 */
export function showToast(input: ToastInput): string {
  const toast: Toast = {
    id:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind: input.kind ?? 'info',
    message: input.message,
    durationMs: input.durationMs ?? 4000,
  };
  toasts = [...toasts, toast];
  emit();
  return toast.id;
}

export function dismissToast(id: string): void {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

const KIND_CLASS: Record<ToastKind, string> = {
  info: 'bg-[#2a2520] text-white border-[#2a2520]',
  success: 'bg-[#4a7c96] text-white border-[#4a7c96]',
  error: 'bg-red-600 text-white border-red-700',
};

/**
 * Mount once near the root of the tree. Renders a stack of toasts in the
 * bottom-right; handles auto-dismiss timers and subscribes to the imperative
 * store above.
 */
export default function Toaster() {
  const { t } = useTranslation();
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <div
      role="region"
      aria-label={t('toast.regionAriaLabel')}
      aria-live="polite"
      className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 max-w-sm pointer-events-none"
    >
      {items.map((toast) => (
        <ToastItem key={toast.id} toast={toast} dismissLabel={t('toast.dismissAriaLabel')} />
      ))}
    </div>
  );
}

function ToastItem({ toast, dismissLabel }: { toast: Toast; dismissLabel: string }) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (toast.durationMs <= 0) return;
    const id = window.setTimeout(() => {
      setClosing(true);
      window.setTimeout(() => dismissToast(toast.id), 150);
    }, toast.durationMs);
    return () => window.clearTimeout(id);
  }, [toast.id, toast.durationMs]);

  return (
    <div
      role="status"
      className={`pointer-events-auto px-4 py-3 rounded-lg shadow-lg border text-sm font-medium transition-opacity duration-150 ${
        KIND_CLASS[toast.kind]
      } ${closing ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="flex items-start gap-3">
        <span className="flex-1 leading-relaxed">{toast.message}</span>
        <button
          type="button"
          onClick={() => dismissToast(toast.id)}
          aria-label={dismissLabel}
          className="text-base leading-none opacity-70 hover:opacity-100"
        >
          ×
        </button>
      </div>
    </div>
  );
}
