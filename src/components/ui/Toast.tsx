import { useEffect } from 'react';

type ToastTone = 'error' | 'success';

type ToastProps = {
  message: string;
  tone: ToastTone;
  onDismiss: () => void;
};

export function Toast({ message, tone, onDismiss }: ToastProps) {
  useEffect(() => {
    const timeoutId = window.setTimeout(onDismiss, 3200);
    return () => window.clearTimeout(timeoutId);
  }, [message, onDismiss]);

  const borderColor = tone === 'error' ? 'var(--inflamacao)' : 'var(--oxigenio)';

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-50 w-[min(92vw,28rem)] -translate-x-1/2 rounded-md bg-tecido-alto px-4 py-3 font-body text-card text-ink shadow-lift"
      style={{ borderLeft: `3px solid ${borderColor}` }}
    >
      {message}
    </div>
  );
}
