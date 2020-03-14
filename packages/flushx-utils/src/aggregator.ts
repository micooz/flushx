export class Aggregator<K, T> {

  dataMap: Map<K, T[]> = new Map();

  aggregateBy(items: T[], iteratee: Iteratee<K, T>): Map<K, T[]> {
    let keys = [ ...this.dataMap.keys() ];

    // store input items to dataMap by iteratee return value
    for (const item of items) {
      const key: K = iteratee(item);
      if (!key) {
        continue;
      }

      const value = this.dataMap.get(key);

      if (!value) {
        this.dataMap.set(key, [ item ]);
      } else {
        value.push(item);
        // data of this key is changed, remove it from keys
        keys[keys.indexOf(key)] = null;
      }
    }

    // this keys is not changed, should be removed from dataMap
    keys = keys.filter(Boolean);

    // clean not changed keys
    for (const key of keys) {
      this.dataMap.delete(key);
    }

    return this.dataMap;
  }

  dispose(): void {
    this.dataMap.clear();
  }

}

export type Iteratee<K, T> = (item: T) => K;
