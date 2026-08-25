import { useEffect, useState } from 'react';

export function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(pointer: coarse)').matches;
  });

  useEffect(() => {
    const media = window.matchMedia('(pointer: coarse)');
    const onChange = () => setCoarse(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return coarse;
}
