import { useLayoutEffect, useRef } from 'react';
import { POST_SUCCESS_CONTEXT, type ChainEducationId } from '../../data/education';
import { Button } from '../ui/Button';
import { GlossaryScope, GlossaryText } from '../ui/GlossaryText';

type ChainContextScreenProps = {
  screenId: ChainEducationId;
  onContinue: () => void;
};

export function ChainContextScreen({ screenId, onContinue }: ChainContextScreenProps) {
  const continueRef = useRef<HTMLButtonElement>(null);
  const text = POST_SUCCESS_CONTEXT[screenId];

  useLayoutEffect(() => {
    continueRef.current?.focus();
  }, []);

  return (
    <main className="app-shell flex flex-col items-center justify-center bg-noite text-ink">
      <div className="flex w-full max-w-xl flex-col gap-6">
        <p className="font-body text-body text-ink">
          <GlossaryScope>
            <GlossaryText text={text} />
          </GlossaryScope>
        </p>
        <Button ref={continueRef} onClick={onContinue}>
          Continuar
        </Button>
      </div>
    </main>
  );
}
