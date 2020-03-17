/* eslint-disable @typescript-eslint/no-explicit-any */
export type Callback<T> = () => T;

export type MemorizeFn<T> = (callback: Callback<T>, deps: any[]) => T;

export function memorize<T>(): MemorizeFn<T> {
  let previousDeps: any[] = [];
  let cachedValue: T;

  return (callback: Callback<T>, deps: any[]): T => {
    const updateDepsAndCache = (): T => {
      previousDeps = deps;
      return cachedValue = callback();
    };

    if (!cachedValue || previousDeps.length !== deps.length) {
      return updateDepsAndCache();
    }

    // shallow compare each dep
    for (let i = 0; i < deps.length; i += 1) {
      if (deps[i] !== previousDeps[i]) {
        return updateDepsAndCache();
      }
    }

    return cachedValue;
  };
}
