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
        className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-display text-equation uppercase text-ink md:gap-x-3"
        style={{ letterSpacing: 'var(--tracking-equation)' }}
      >
        <span>{left}</span>
        <span className="text-ink-muted" aria-hidden>
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
          {complete ? (
            <Link2 className="h-[1.15em] w-[1.15em] md:h-7 md:w-7" strokeWidth={1.75} aria-hidden />
          ) : (
            '?'
          )}
        </span>
        <span className="text-ink-muted" aria-hidden>
          →
        </span>
        <span>{right}</span>
      </p>
      {expansion ? (
        <p className="mt-1 font-mono text-caption uppercase text-ink-muted md:mt-2">{expansion}</p>
      ) : null}
    </header>
  );
}
