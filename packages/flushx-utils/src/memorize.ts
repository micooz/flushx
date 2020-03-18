/* eslint-disable @typescript-eslint/no-explicit-any */
export type Callback<T> = () => T;

export type MemorizeFn<T> = (callback: Callback<T>, deps: any[], contextKey: string) => T;

type MapValue<T> = {
  deps: any[];
  value: T;
};

type ContextKey = string;

export function memorize<T>(): MemorizeFn<T> {
  const map = new Map<ContextKey, MapValue<T>>();

  return function inner(callback: Callback<T>, deps: any[], contextKey: string): T {
    const updateDepsAndCache = (): T => {
      const newValue = callback();
      map.set(contextKey, {
        deps,
        value: newValue,
      });
      return newValue;
    };

    const { deps: previousDeps, value } = map.get(contextKey) || {};

    if (!value || previousDeps.length !== deps.length) {
      return updateDepsAndCache();
    }

    // shallow compare each dep
    for (let i = 0; i < deps.length; i += 1) {
      if (deps[i] !== previousDeps[i]) {
        return updateDepsAndCache();
      }
    }

    return value;
  };
}
