import { useEffect, EffectCallback } from 'react';

export function useCondition(
  condition: boolean,
  trueEffect?: EffectCallback,
  falseEffect?: EffectCallback
): EffectCallback | void {
  useEffect(() => {
    if (condition) {
      if (trueEffect) {
        return trueEffect();
      }
    } else {
      if (falseEffect) {
        return falseEffect();
      }
    }
  }, [condition, trueEffect, falseEffect]);
}
