import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type {
  Announcements,
  DragEndEvent,
  DragOverEvent,
  DragPendingEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import { chainKeyboardCoordinates } from '../../utils/chainKeyboardCoordinates';
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import type { ChainScreen as ChainScreenContent, ChainStep } from '../../types/game';
import {
  SLOT_COUNT,
  countCorrectPositions,
  emptyBoard,
  isDestinationLocked,
  moveCard,
  resolveDestination,
  type Board,
} from '../../utils/board';
import { createRng, shuffleSteps } from '../../utils/shuffle';
import { POST_SUCCESS_CONTEXT, type ChainEducationId } from '../../data/education';
import { Button } from '../ui/Button';
import { AnchoredPopover } from '../ui/AnchoredPopover';
import { Toast } from '../ui/Toast';
import { ProgressRail } from '../ui/ProgressRail';
import { CardTray } from '../chain/CardTray';
import { ChainCard } from '../chain/ChainCard';
import { ChainSlot } from '../chain/ChainSlot';
import { ChainSpine } from '../chain/ChainSpine';
import { EquationHeader } from '../chain/EquationHeader';
import { PathwayAnimation } from '../anatomy/PathwayAnimation';
import { ChainContextScreen } from './ChainContextScreen';

type ChainScreenProps = {
  screen: ChainScreenContent;
  onComplete: () => void;
  onAttempt?: (screenId: string) => void;
};

type ToastState = {
  message: string;
  tone: 'error' | 'success';
};

function connectionOf(screen: ChainScreenContent): { phase: 1 | 2; connection: 1 | 2 } {
  if (screen.id === 'perio-to-dpoc') return { phase: 1, connection: 1 };
  if (screen.id === 'dpoc-to-perio') return { phase: 1, connection: 2 };
  if (screen.id === 'perio-to-aos') return { phase: 2, connection: 1 };
  return { phase: 2, connection: 2 };
}

function formatErrorToast(correctCount: number): string {
  if (correctCount <= 0) return 'Ainda não. Tente pensar no que dispara a cadeia.';
  if (correctCount === 1) return 'Ainda não. Uma etapa está no lugar certo.';
  return 'Ainda não. Duas etapas estão no lugar certo.';
}

function firstOutOfPlace(
  screen: ChainScreenContent,
  board: Board,
  lockedIds: ReadonlySet<string>,
): ChainStep | undefined {
  return [...screen.steps]
    .sort((a, b) => a.order - b.order)
    .find((step) => {
      if (lockedIds.has(step.id)) return false;
      return board.slots[step.order - 1] !== step.id;
    });
}

export function ChainScreen({ screen, onComplete, onAttempt }: ChainScreenProps) {
  const reducedMotion = useReducedMotion();
  const { phase, connection } = connectionOf(screen);
  const stepsById = useMemo(
    () => new Map(screen.steps.map((step) => [step.id, step])),
    [screen.steps],
  );

  const [board, setBoard] = useState<Board>(() =>
    emptyBoard(shuffleSteps(screen.steps, createRng(screen.id)).map((step) => step.id)),
  );
  const [lockedIds, setLockedIds] = useState<Set<string>>(() => new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState<'playing' | 'success' | 'context'>('playing');
  const [cascadeCount, setCascadeCount] = useState(0);
  const [shaking, setShaking] = useState(false);
  const [errorIds, setErrorIds] = useState<string[]>([]);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [hintVisible, setHintVisible] = useState(false);
  const [frozenHint, setFrozenHint] = useState<ChainStep | null>(null);
  const [hasPulsed, setHasPulsed] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [dndEpoch, setDndEpoch] = useState(0);
  const [liveMessage, setLiveMessage] = useState('');
  const [refusedSlot, setRefusedSlot] = useState<number | null>(null);
  const hintButtonRef = useRef<HTMLButtonElement>(null);
  const hintPanelId = useId();

  const boardRef = useRef(board);
  const lockedRef = useRef(lockedIds);
  const draggingRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const finishedRef = useRef(false);
  const [manualAdvance, setManualAdvance] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const suppressSelectRef = useRef(false);
  const suppressSelectTimer = useRef(0);

  const filled = board.slots.every((id) => id !== null);
  const isSuccess = status === 'success';

  if (filled && !hasPulsed) {
    setHasPulsed(true);
  }

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: chainKeyboardCoordinates }),
  );

  const announcements: Announcements = useMemo(
    () => ({
      onDragStart({ active }) {
        const label = stepsById.get(String(active.id))?.label ?? '';
        return `Cartão ${label} selecionado.`;
      },
      onDragOver({ active, over }) {
        const label = stepsById.get(String(active.id))?.label ?? '';
        if (!over) return `Cartão ${label} fora de uma zona válida.`;
        const dest = resolveDestination(String(over.id), boardRef.current);
        if (typeof dest === 'number') {
          return `Cartão ${label} sobre a posição ${dest + 1} de 4.`;
        }
        if (dest === 'tray') {
          return `Cartão ${label} sobre a bandeja de etapas.`;
        }
        return undefined;
      },
      onDragEnd({ active, over }) {
        const label = stepsById.get(String(active.id))?.label ?? '';
        if (!over) return `Cartão ${label} solto.`;
        const dest = resolveDestination(String(over.id), boardRef.current);
        if (typeof dest === 'number') {
          return `Cartão ${label} movido para a posição ${dest + 1} de 4.`;
        }
        if (dest === 'tray') return `Cartão ${label} devolvido à bandeja de etapas.`;
        return `Cartão ${label} solto.`;
      },
      onDragCancel({ active }) {
        const label = stepsById.get(String(active.id))?.label ?? '';
        return `Movimento cancelado. Cartão ${label} voltou à origem.`;
      },
    }),
    [stepsById],
  );

  useEffect(() => {
    boardRef.current = board;
    lockedRef.current = lockedIds;
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    const onResize = () => {
      if (!draggingRef.current) return;
      setDndEpoch((value) => value + 1);
      draggingRef.current = false;
      setActiveId(null);
      setOverId(null);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!isSuccess || reducedMotion) return;
    const intervalId = window.setInterval(() => {
      setCascadeCount((count) => {
        if (count >= SLOT_COUNT) {
          window.clearInterval(intervalId);
          return count;
        }
        return count + 1;
      });
    }, 90);
    return () => window.clearInterval(intervalId);
  }, [isSuccess, reducedMotion]);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onCompleteRef.current();
  }, []);

  const openContext = useCallback(() => {
    setStatus('context');
  }, []);

  useEffect(() => {
    if (status !== 'success' || reducedMotion || manualAdvance) return undefined;
    const delay = screen.reveal ? 2500 : 1800;
    const timeoutId = window.setTimeout(() => openContext(), delay);
    return () => window.clearTimeout(timeoutId);
  }, [status, reducedMotion, manualAdvance, screen.reveal, openContext]);

  useEffect(() => {
    if (errorIds.length === 0) return;
    const timeoutId = window.setTimeout(() => setErrorIds([]), 600);
    return () => window.clearTimeout(timeoutId);
  }, [errorIds]);

  useEffect(() => {
    if (!shaking) return;
    const timeoutId = window.setTimeout(() => setShaking(false), 320);
    return () => window.clearTimeout(timeoutId);
  }, [shaking]);

  useEffect(() => {
    if (refusedSlot === null) return;
    const timeoutId = window.setTimeout(() => setRefusedSlot(null), 420);
    return () => window.clearTimeout(timeoutId);
  }, [refusedSlot]);

  const dismissToast = useCallback(() => setToast(null), []);

  function refuseSlot(index: number) {
    setRefusedSlot(index);
    setLiveMessage(`Posição ${index + 1} está confirmada e não pode ser alterada.`);
  }

  function applyMove(cardId: string, dest: 'tray' | number) {
    setBoard((current) => moveCard(current, cardId, dest, lockedRef.current));
  }

  function suppressNextSelect() {
    suppressSelectRef.current = true;
    window.clearTimeout(suppressSelectTimer.current);
    suppressSelectTimer.current = window.setTimeout(() => {
      suppressSelectRef.current = false;
    }, 50);
  }

  function handleDragPending(event: DragPendingEvent) {
    setPendingId(String(event.id));
  }

  function handleDragAbort() {
    setPendingId(null);
  }

  function handleDragStart(event: DragStartEvent) {
    draggingRef.current = true;
    setPendingId(null);
    setActiveId(String(event.active.id));
    setSelectedId(null);
  }

  function handleDragOver(event: DragOverEvent) {
    setOverId(event.over ? String(event.over.id) : null);
  }

  function handleDragEnd(event: DragEndEvent) {
    draggingRef.current = false;
    suppressNextSelect();
    setPendingId(null);
    setActiveId(null);
    setOverId(null);
    const over = event.over;
    if (!over) return;
    const dest = resolveDestination(String(over.id), boardRef.current);
    if (dest === null) return;
    if (isDestinationLocked(boardRef.current, dest, lockedRef.current) && typeof dest === 'number') {
      refuseSlot(dest);
      return;
    }
    applyMove(String(event.active.id), dest);
  }

  function handleDragCancel() {
    draggingRef.current = false;
    suppressNextSelect();
    setPendingId(null);
    setActiveId(null);
    setOverId(null);
  }

  function handleSelect(cardId: string) {
    if (suppressSelectRef.current) return;
    if (isSuccess || lockedIds.has(cardId)) return;
    if (selectedId === cardId) {
      setSelectedId(null);
      return;
    }
    if (selectedId) {
      const targetSlot = board.slots.indexOf(cardId);
      if (targetSlot >= 0) {
        if (isDestinationLocked(board, targetSlot, lockedIds)) {
          refuseSlot(targetSlot);
          return;
        }
        applyMove(selectedId, targetSlot);
        setSelectedId(null);
        return;
      }
    }
    setSelectedId(cardId);
    const label = stepsById.get(cardId)?.label ?? '';
    setLiveMessage(
      `Cartão ${label} selecionado. Toque em uma posição da corrente para colocá-lo.`,
    );
  }

  function handlePlaceOnSlot(index: number) {
    if (!selectedId || isSuccess) return;
    if (isDestinationLocked(board, index, lockedIds)) {
      refuseSlot(index);
      return;
    }
    applyMove(selectedId, index);
    setSelectedId(null);
  }

  function handleReturnToTray() {
    if (!selectedId || isSuccess) return;
    if (board.slots.includes(selectedId)) {
      applyMove(selectedId, 'tray');
      setSelectedId(null);
    }
  }

  function handleVerify() {
    if (!filled || isSuccess) return;

    const orderById = new Map(screen.steps.map((step) => [step.id, step.order]));
    const correctCount = countCorrectPositions(board.slots, orderById);
    const flags = board.slots.map((id, index) => id !== null && orderById.get(id) === index + 1);

    if (correctCount === 4) {
      setStatus('success');
      setCascadeCount(reducedMotion ? SLOT_COUNT : 1);
      setSelectedId(null);
      setHintVisible(false);
      setFrozenHint(null);
      setLiveMessage(screen.successMessage);
      return;
    }

    setAttempts((count) => count + 1);
    onAttempt?.(screen.id);
    setHintVisible(false);
    setFrozenHint(null);

    const nextLocked = new Set<string>();
    if (correctCount >= 1) {
      board.slots.forEach((id, index) => {
        if (id && flags[index]) nextLocked.add(id);
      });
    }
    setLockedIds(nextLocked);

    const wrong = board.slots.filter((id, index) => id && !flags[index]) as string[];
    setErrorIds(wrong);
    if (!reducedMotion) setShaking(true);
    setToast({ message: formatErrorToast(correctCount), tone: 'error' });
    setLiveMessage(formatErrorToast(correctCount));
  }

  function handleHint() {
    if (attempts < 2 || isSuccess) return;
    if (hintVisible) {
      setHintVisible(false);
      return;
    }
    if (!frozenHint) {
      const step = firstOutOfPlace(screen, board, lockedIds);
      if (!step?.hint) return;
      setFrozenHint(step);
      setLiveMessage(`Dica: ${step.hint}`);
    } else {
      setLiveMessage(`Dica: ${frozenHint.hint}`);
    }
    setHintVisible(true);
  }

  function closeHint() {
    setHintVisible(false);
    hintButtonRef.current?.focus();
  }

  const overDest = overId ? resolveDestination(overId, board) : null;
  const activeStep = activeId ? stepsById.get(activeId) : undefined;
  const showHintLink = attempts >= 2 && !isSuccess;
  const hintText = hintVisible && frozenHint?.hint ? frozenHint.hint : null;
  const educationId = screen.id as ChainEducationId;
  const showTray =
    board.tray.length > 0 ||
    Boolean(activeId) ||
    (selectedId !== null && board.slots.includes(selectedId));
  const trackRef = useRef<HTMLDivElement>(null);
  const firstSlotRef = useRef<HTMLLIElement>(null);
  const lastSlotRef = useRef<HTMLLIElement>(null);
  const [spineInset, setSpineInset] = useState({ top: 0, bottom: 0 });

  useLayoutEffect(() => {
    const track = trackRef.current;
    const first = firstSlotRef.current;
    const last = lastSlotRef.current;
    if (!track || !first || !last) return undefined;

    function update() {
      if (!track || !first || !last) return;
      const bounds = track.getBoundingClientRect();
      const start = first.getBoundingClientRect();
      const end = last.getBoundingClientRect();
      const top = Math.max(0, Math.round(start.top + start.height / 2 - bounds.top));
      const bottom = Math.max(0, Math.round(bounds.bottom - (end.top + end.height / 2)));
      setSpineInset((current) =>
        current.top === top && current.bottom === bottom ? current : { top, bottom },
      );
    }

    update();
    const observer = new ResizeObserver(update);
    observer.observe(track);
    observer.observe(first);
    observer.observe(last);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [board.slots, status]);

  if (status === 'context' && educationId in POST_SUCCESS_CONTEXT) {
    return <ChainContextScreen screenId={educationId} onContinue={finish} />;
  }

  return (
    <DndContext
      key={dndEpoch}
      sensors={sensors}
      collisionDetection={closestCorners}
      accessibility={{
        announcements,
        screenReaderInstructions: {
          draggable:
            'Para pegar um cartão, pressione Espaço ou Enter. Use as setas para mover, Espaço para soltar e Escape para cancelar.',
        },
      }}
      onDragPending={handleDragPending}
      onDragAbort={handleDragAbort}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {isSuccess ? (
        <PathwayAnimation
          pathway={screen.pathway}
          successMessage={screen.successMessage}
          reveal={screen.reveal}
          reducedMotion={reducedMotion}
          showAdvance={reducedMotion || manualAdvance}
          onComplete={openContext}
          onInterrupt={() => setManualAdvance(true)}
        />
      ) : null}
      <div
        className="app-shell-chain flex flex-col bg-noite text-ink"
        aria-hidden={isSuccess || undefined}
        {...(isSuccess ? ({ inert: '' } as { inert: string }) : {})}
      >
        <div className="mx-auto flex min-h-0 w-full max-w-content flex-1 flex-col gap-2 md:gap-4 lg:gap-5 xl:gap-6">
          <ProgressRail
            current={phase === 1 ? connection - 1 : connection + 1}
            phase={phase}
            connection={connection}
          />

          {screen.prompt ? (
            <p className="shrink-0 text-center font-body text-body text-ink">{screen.prompt}</p>
          ) : null}

          <EquationHeader
            left={screen.equation.left}
            right={screen.equation.right}
            complete={isSuccess}
            reducedMotion={reducedMotion}
            focusOnMount
          />

          {screen.id === 'perio-to-dpoc' ? (
            <p
              className="hidden shrink-0 text-center text-ink-muted [@media(pointer:coarse)]:block"
              style={{ fontSize: 'var(--type-caption)', lineHeight: 1.45 }}
            >
              Toque em uma etapa e depois na posição
            </p>
          ) : null}

          <div className="grid min-h-0 min-w-0 w-full flex-1 grid-rows-[auto_minmax(0,1fr)] gap-2 md:gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:grid-rows-1 lg:gap-5 xl:gap-8">
            {showTray ? (
              <div className="min-w-0 w-full lg:col-start-2 lg:row-start-1">
                <CardTray isOver={overDest === 'tray'} onReturn={handleReturnToTray}>
                  {board.tray.map((cardId) => {
                    const step = stepsById.get(cardId);
                    if (!step) return null;
                    return (
                      <div key={cardId} className="min-w-0">
                        <ChainCard
                          step={step}
                          location="tray"
                          disabled={isSuccess}
                          isLocked={lockedIds.has(step.id)}
                          isSelected={selectedId === step.id}
                          isHeld={pendingId === step.id}
                          isError={errorIds.includes(step.id)}
                          onSelect={() => handleSelect(step.id)}
                        />
                      </div>
                    );
                  })}
                </CardTray>
              </div>
            ) : null}

            <section
              className={[
                'relative flex min-h-0 min-w-0 w-full flex-col overflow-hidden rounded-md border border-line bg-tecido p-2 md:p-4 lg:col-start-1 lg:row-start-1 lg:p-5',
                shaking ? 'animate-chain-shake' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-label="A corrente"
            >
              <h2 className="mb-1 shrink-0 font-mono text-caption uppercase text-ink-muted md:mb-4">A corrente</h2>
              <div
                ref={trackRef}
                className="relative grid min-h-0 grid-cols-[1.25rem_minmax(0,1fr)] overflow-hidden"
              >
                <ChainSpine
                  filled={isSuccess}
                  reducedMotion={reducedMotion}
                  top={spineInset.top}
                  bottom={spineInset.bottom}
                />
                <ol className="col-start-2 flex list-none flex-col gap-4 p-0">
                  {board.slots.map((cardId, index) => {
                    const step = cardId ? stepsById.get(cardId) : undefined;
                    const locked = Boolean(step && lockedIds.has(step.id));
                    const highlighted = isSuccess && index < cascadeCount;
                    return (
                      <li
                        key={`slot-${index}`}
                        ref={index === 0 ? firstSlotRef : index === SLOT_COUNT - 1 ? lastSlotRef : undefined}
                      >
                        <ChainSlot
                          index={index}
                          isEmpty={!step}
                          isOver={overDest === index}
                          isLocked={locked}
                          isRefused={refusedSlot === index}
                          occupiedLabel={step?.label}
                          onPlace={() => handlePlaceOnSlot(index)}
                        >
                          {step ? (
                            <ChainCard
                              step={step}
                              location="slot"
                              slotNumber={index + 1}
                              disabled={isSuccess}
                              isLocked={locked}
                              isSelected={selectedId === step.id}
                              isHeld={pendingId === step.id}
                              isCorrect={locked}
                              isError={errorIds.includes(step.id)}
                              isSuccess={highlighted}
                              reducedMotion={reducedMotion}
                              onSelect={() => handleSelect(step.id)}
                            />
                          ) : null}
                        </ChainSlot>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </section>
          </div>

          <div className="mt-auto flex shrink-0 flex-col items-center gap-2 md:gap-3">
            <Button
              variant="ready"
              disabled={!filled || isSuccess}
              pulseOnce={hasPulsed && filled && !isSuccess && !reducedMotion}
              onClick={handleVerify}
            >
              Verificar conexão
            </Button>

            {showHintLink ? (
              <Button
                ref={hintButtonRef}
                variant="secondary"
                aria-expanded={Boolean(hintText)}
                aria-controls={hintText ? hintPanelId : undefined}
                aria-haspopup="dialog"
                onClick={handleHint}
              >
                Ver dica
              </Button>
            ) : null}

            {hintText ? (
              <AnchoredPopover
                id={hintPanelId}
                text={hintText}
                anchorRef={hintButtonRef}
                onClose={closeHint}
                label="Dica"
                tone="hint"
              />
            ) : null}
          </div>
        </div>
      </div>

      <DragOverlay dropAnimation={reducedMotion ? null : undefined}>
        {activeStep ? <ChainCard step={activeStep} isOverlay /> : null}
      </DragOverlay>

      {toast ? <Toast message={toast.message} tone={toast.tone} onDismiss={dismissToast} /> : null}

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </div>
    </DndContext>
  );
}
