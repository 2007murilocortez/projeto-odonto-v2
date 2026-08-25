import { forwardRef, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ready';

type ButtonProps = {
  variant?: ButtonVariant;
  pulseOnce?: boolean;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    pulseOnce = false,
    children,
    className = '',
    disabled,
    type = 'button',
    onClick,
    ...props
  },
  ref,
) {
  const isDisabled = Boolean(disabled);

  const variantClass =
    variant === 'secondary'
      ? 'inline-flex min-h-11 min-w-11 items-center justify-center bg-transparent px-3 py-0 text-ink-muted hover:underline'
      : variant === 'ready'
        ? isDisabled
          ? 'inline-flex min-h-11 items-center justify-center rounded-md px-5 py-3 bg-line text-ink-disabled cursor-not-allowed'
          : 'inline-flex min-h-11 items-center justify-center rounded-md border border-line px-5 py-3 bg-tecido-alto text-ink'
        : isDisabled
          ? 'inline-flex min-h-11 items-center justify-center rounded-md px-5 py-3 bg-line text-ink-disabled cursor-not-allowed'
          : 'inline-flex min-h-11 items-center justify-center rounded-md px-5 py-3 bg-oxigenio text-noite';

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (isDisabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  }

  return (
    <button
      ref={ref}
      {...props}
      type={type}
      aria-disabled={isDisabled || undefined}
      onClick={handleClick}
      className={[
        'font-body text-body',
        pulseOnce && !isDisabled ? 'animate-verify-once' : '',
        isDisabled ? 'pointer-events-none' : '',
        variantClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ fontWeight: 'var(--weight-button)' }}
    >
      {children}
    </button>
  );
});
