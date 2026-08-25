import { motion } from 'framer-motion';
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useTokenColors } from '../../hooks/useTokenColors';
import type { Pathway } from '../../types/game';
import { Button } from '../ui/Button';
import { LungGlyph } from './LungGlyph';
import { SleepApneaGlyph } from './SleepApneaGlyph';
import { ToothGlyph } from './ToothGlyph';
import { curvePath, sampleCurve, type Point } from './pathGeometry';

type PathwayAnimationProps = {
  pathway: Pathway;
  successMessage: string;
  reveal?: { symbol: string; caption: string };
  reducedMotion: boolean;
  showAdvance?: boolean;
  onComplete: () => void;
  onInterrupt?: () => void;
};

function useNarrowLayout(): boolean {
  const [narrow, setNarrow] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches,
  );

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const onChange = () => setNarrow(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return narrow;
}

function ariaFor(pathway: Pathway): string {
  switch (pathway) {
    case 'tooth-to-lung':
      return 'Trajeto da periodontite ao pulmão pela circulação sistêmica';
    case 'lung-to-tooth':
      return 'Trajeto do pulmão à periodontite pela circulação sistêmica';
    case 'tooth-to-apnea':
      return 'Trajeto da periodontite à apneia obstrutiva do sono pela circulação sistêmica';
    case 'apnea-to-tooth':
      return 'Trajeto da apneia obstrutiva do sono à periodontite pela circulação sistêmica';
  }
}

function Halo({ point, color, pulse }: { point: Point; color: string; pulse: boolean }) {
  return (
    <circle
      cx={point.x}
      cy={point.y}
      r={42}
      fill={color}
      className={pulse ? 'animate-halo-pulse' : undefined}
      style={{ opacity: pulse ? undefined : 0.2 }}
    />
  );
}

function PathParticles({
  points,
  fromColor,
  toColor,
  delay,
  loop,
}: {
  points: Point[];
  fromColor: string;
  toColor: string;
  delay: number;
  loop: boolean;
}) {
  const start = points[0];
  if (!start) return null;

  return (
    <motion.circle
      r="4"
      initial={{ cx: start.x, cy: start.y, fill: fromColor }}
      animate={{
        cx: points.map((point) => point.x),
        cy: points.map((point) => point.y),
        fill: loop ? fromColor : [fromColor, toColor],
      }}
      transition={{
        duration: loop ? 4.8 : 0.55,
        delay,
        ease: loop ? 'linear' : [0.22, 0.61, 0.36, 1],
        repeat: loop ? Infinity : 0,
      }}
    />
  );
}

function RevealTitle({ symbol, reducedMotion }: { symbol: string; reducedMotion: boolean }) {
  const [left, right] = symbol.split('⇄').map((part) => part.trim());
  return (
    <p
      className="font-display text-display-lg text-ink"
      style={{ lineHeight: 'var(--leading-display)' }}
    >
      {left}{' '}
      {reducedMotion ? (
        <span className="text-oxigenio">⇄</span>
      ) : (
        <motion.span
          className="inline-block text-oxigenio"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.15, 1] }}
          transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
        >
          ⇄
        </motion.span>
      )}{' '}
      {right}
    </p>
  );
}

export function PathwayAnimation({
  pathway,
  successMessage,
  reveal,
  reducedMotion,
  showAdvance = false,
  onComplete,
  onInterrupt,
}: PathwayAnimationProps) {
  const narrow = useNarrowLayout();
  const titleId = useId();
  const overlayRef = useRef<HTMLDivElement>(null);
  const advanceRef = useRef<HTMLButtonElement>(null);
  const colors = useTokenColors();
  const reverse = pathway === 'lung-to-tooth' || pathway === 'apnea-to-tooth';
  const apnea = pathway === 'tooth-to-apnea' || pathway === 'apnea-to-tooth';

  const oral: Point = narrow ? { x: 200, y: 68 } : { x: 128, y: 118 };
  const resp: Point = narrow ? { x: 200, y: 228 } : { x: 672, y: 118 };
  const origin = reverse ? resp : oral;
  const dest = reverse ? oral : resp;
  const bow = narrow ? 70 : 86;
  const mainBow = reverse ? -bow : bow;
  const returnBow = reverse ? bow : -bow;
  const mainPath = curvePath(origin, dest, mainBow);
  const returnPath = curvePath(dest, origin, returnBow);
  const mainPoints = sampleCurve(origin, dest, mainBow);
  const returnPoints = sampleCurve(dest, origin, returnBow);

  const [originOn, setOriginOn] = useState(reducedMotion);
  const [pathOn, setPathOn] = useState(reducedMotion);
  const [particlesOn, setParticlesOn] = useState(false);
  const [destOn, setDestOn] = useState(reducedMotion);
  const [messageOn, setMessageOn] = useState(reducedMotion);
  const [revealOn, setRevealOn] = useState(reducedMotion && Boolean(reveal));
  const [returnDrawn, setReturnDrawn] = useState(reducedMotion);

  const atEnd = messageOn && (!reveal || revealOn);

  const jumpToEnd = useCallback(() => {
    setOriginOn(true);
    setPathOn(true);
    setDestOn(true);
    setMessageOn(true);
    setParticlesOn(false);
    setReturnDrawn(true);
    if (reveal) setRevealOn(true);
  }, [reveal]);

  useLayoutEffect(() => {
    if (showAdvance) {
      advanceRef.current?.focus();
    } else {
      overlayRef.current?.focus();
    }
  }, [showAdvance]);

  useEffect(() => {
    if (reducedMotion) return undefined;
    const timers = [
      window.setTimeout(() => setOriginOn(true), 0),
      window.setTimeout(() => setPathOn(true), 250),
      window.setTimeout(() => setParticlesOn(true), 400),
      window.setTimeout(() => setDestOn(true), 900),
      window.setTimeout(() => setMessageOn(true), 1150),
      window.setTimeout(() => {
        if (reveal) setRevealOn(true);
      }, 1400),
    ];
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [reducedMotion, reveal]);

  useEffect(() => {
    if (!revealOn) return undefined;
    const timeoutId = window.setTimeout(() => setReturnDrawn(true), 30);
    return () => window.clearTimeout(timeoutId);
  }, [revealOn]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (atEnd) {
        onComplete();
        return;
      }
      jumpToEnd();
      return;
    }

    if (event.key !== 'Tab') return;
    const root = overlayRef.current;
    if (!root) return;
    const focusable = [...root.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])')].filter(
      (node) => !node.hasAttribute('disabled') && node.tabIndex !== -1,
    );
    if (focusable.length === 0) {
      event.preventDefault();
      root.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  const viewBox = narrow ? '0 0 400 300' : '0 0 800 260';
  const pathTransition = reducedMotion
    ? 'opacity 200ms var(--ease-out)'
    : 'stroke-dashoffset 550ms var(--ease-out)';
  const loopParticles = revealOn && !reducedMotion;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-40 flex max-h-dvh items-center justify-center overflow-y-auto pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
      style={{ backgroundColor: 'var(--backdrop)' }}
      role="dialog"
      aria-modal="true"
      aria-label={ariaFor(pathway)}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      onPointerDown={(event) => {
        if ((event.target as HTMLElement).closest('button')) return;
        onInterrupt?.();
      }}
    >
      <div className="flex w-full max-w-content flex-col items-center gap-3 md:gap-5">
        <svg
          viewBox={viewBox}
          className="w-full max-h-[42dvh] text-ink md:max-h-none"
          role="img"
          aria-label={ariaFor(pathway)}
        >
          {originOn ? (
            <Halo point={origin} color="var(--inflamacao)" pulse={!reducedMotion} />
          ) : null}
          {destOn ? <Halo point={dest} color="var(--oxigenio)" pulse={!reducedMotion} /> : null}

          <path
            d={mainPath}
            fill="none"
            stroke="var(--oxigenio)"
            strokeWidth="1.75"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={reducedMotion || pathOn ? 0 : 1}
            style={{
              transition: pathTransition,
              opacity: pathOn || reducedMotion ? 1 : 0,
            }}
          />

          {revealOn ? (
            <path
              d={returnPath}
              fill="none"
              stroke="var(--oxigenio)"
              strokeWidth="1.75"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={returnDrawn ? 0 : 1}
              style={{
                transition: pathTransition,
                opacity: 1,
              }}
            />
          ) : null}

          {particlesOn && !reducedMotion && !revealOn
            ? [0, 1, 2].map((index) => (
                <PathParticles
                  key={`go-${index}`}
                  points={mainPoints}
                  fromColor={colors.inflamacao}
                  toColor={colors.oxigenio}
                  delay={index * 0.12}
                  loop={false}
                />
              ))
            : null}

          {loopParticles
            ? [0, 1].map((index) => (
                <g key={`loop-${index}`}>
                  <PathParticles
                    points={mainPoints}
                    fromColor={colors.oxigenio}
                    toColor={colors.oxigenio}
                    delay={index * 2.4}
                    loop
                  />
                  <PathParticles
                    points={returnPoints}
                    fromColor={colors.inflamacao}
                    toColor={colors.inflamacao}
                    delay={index * 2.4}
                    loop
                  />
                </g>
              ))
            : null}

          <g
            style={{
              opacity: (reverse ? destOn : originOn) ? 1 : 0,
              transform: `scale(${(reverse ? destOn : originOn) ? 1 : 0.94})`,
              transformOrigin: `${oral.x}px ${oral.y}px`,
              transition: reducedMotion
                ? 'opacity 200ms var(--ease-out)'
                : 'opacity 350ms var(--ease-out), transform 350ms var(--ease-out)',
            }}
          >
            <ToothGlyph x={oral.x} y={oral.y} />
          </g>

          <g
            style={{
              opacity: (reverse ? originOn : destOn) ? 1 : 0,
              transform: `scale(${(reverse ? originOn : destOn) ? 1 : 0.94})`,
              transformOrigin: `${resp.x}px ${resp.y}px`,
              transition: reducedMotion
                ? 'opacity 200ms var(--ease-out)'
                : 'opacity 350ms var(--ease-out), transform 350ms var(--ease-out)',
            }}
          >
            {apnea ? <SleepApneaGlyph x={resp.x} y={resp.y} /> : <LungGlyph x={resp.x} y={resp.y} />}
          </g>

          <text
            x={narrow ? 200 : 400}
            y={narrow ? 156 : 246}
            textAnchor="middle"
            fill="var(--ink-muted)"
            fontFamily="var(--font-mono)"
            fontSize="13"
            letterSpacing="0.09em"
          >
            circulação sistêmica
          </text>
        </svg>

        <div aria-live="polite" aria-atomic="true" className="min-h-[3rem] text-center">
          {messageOn && !revealOn ? (
            <p
              id={titleId}
              className={`font-body text-body text-oxigenio ${reducedMotion ? '' : 'animate-success-in'}`}
            >
              {successMessage}
            </p>
          ) : null}
          {revealOn && reveal ? (
            <div id={titleId} className="flex flex-col items-center gap-2">
              <RevealTitle symbol={reveal.symbol} reducedMotion={reducedMotion} />
              <p className="font-mono text-caption uppercase text-ink-muted">{reveal.caption}</p>
            </div>
          ) : null}
        </div>

        {showAdvance ? (
          <Button ref={advanceRef} onClick={onComplete}>
            Avançar
          </Button>
        ) : null}
      </div>
    </div>
  );
}
