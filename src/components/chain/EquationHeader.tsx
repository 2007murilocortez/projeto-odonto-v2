import { useLayoutEffect, useRef } from 'react';
import { Link2 } from 'lucide-react';
import { ACRONYM_EXPANSIONS } from '../../data/screens';

type EquationHeaderProps = {
  left: string;
  right: string;
  complete: boolean;
  reducedMotion: boolean;
  focusOnMount?: boolean;
};

function expansionFor(side: string): string | undefined {
  if (side === 'DPOC' || side === 'AOS') return ACRONYM_EXPANSIONS[side];
  return undefined;
}

export function EquationHeader({
  left,
  right,
  complete,
  reducedMotion,
  focusOnMount = false,
}: EquationHeaderProps) {
  const headerRef = useRef<HTMLElement>(null);
  const expansion = expansionFor(right) ?? expansionFor(left);

  useLayoutEffect(() => {
    if (focusOnMount) headerRef.current?.focus();
  }, [focusOnMount]);

  return (
    <header ref={headerRef} tabIndex={-1} className="text-center outline-none">
      <p
        className="font-display text-equation uppercase text-ink"
        style={{ letterSpacing: 'var(--tracking-equation)' }}
      >
        <span>{left}</span>
        <span className="mx-3 text-ink-muted" aria-hidden>
          →
        </span>
        <span
          className={[
            'inline-flex h-[1.35em] w-[1.35em] items-center justify-center',
            complete ? 'text-oxigenio' : 'text-placa',
            !complete && !reducedMotion ? 'animate-question-pulse' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-label={complete ? 'conexão formada' : 'posição a descobrir'}
        >
          {complete ? <Link2 size={28} strokeWidth={1.75} aria-hidden /> : '?'}
        </span>
        <span className="mx-3 text-ink-muted" aria-hidden>
          →
        </span>
        <span>{right}</span>
      </p>
      {expansion ? (
        <p className="mt-2 font-mono text-caption uppercase text-ink-muted">{expansion}</p>
      ) : null}
    </header>
  );
}
