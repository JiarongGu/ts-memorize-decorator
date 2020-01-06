export class MemorizeContext {
  public cache: Map<any, any>; // save non-promise values and contexts
  public promiseCache: Map<any, any>; // save promise processing value

  constructor(cache?: Map<any, any>, promiseCache?: Map<any, any>) {
    this.cache = cache || new Map();
    this.promiseCache = promiseCache || new Map();
  }

  public get<K = any>(key: K) {
    return this.cache.get(key) || this.promiseCache.get(key);
  }

  public delete<K = any>(key: K) {
    return this.cache.delete(key) || this.promiseCache.delete(key);
  }

  public clear() {
    this.cache.clear();
    this.promiseCache.clear();
  }

  public tryGet<K = any, V = any>(key: K, get: () => V) {
    let value = this.cache.get(key);
    if (!value) this.cache.set(key, value = get());
    return value;
  }

  // to recursive cache if there is multiple layer of keys
  public tryGetRecursive<K = any, V = any>(defaultKey: K, keys: Array<K>, get: () => V) {
    if (keys.length == 0) {
      // if we have no recursive keys, this should behave same as tryGet
      return this.tryGet(defaultKey, get);
    }
    const nextDefaultKey = keys[0];
    const nextKeys = keys.slice(1);
    const nextContext = this.tryGet(nextDefaultKey, () => new MemorizeContext());
    return nextContext.tryRecursiveGet(nextDefaultKey, nextKeys, get);
  }

  // try get cached value within promise
  public tryGetAsync<K = any, V = any>(key: K, get: () => Promise<V>): Promise<V> {
    // if we have a non-promise cache
    const value = this.cache.get(key);
    if (value) return Promise.resolve(value);

    // if there is any waiting promise
    let promiseValue = this.promiseCache.get(key);
    if (!promiseValue) {
      // save to promise cache
      this.promiseCache.set(key, promiseValue = get());

      // save to non-promise cache if promise completed
      promiseValue.then(value => {
        this.cache.set(key, value);
      }).finally(() => {
        // remove from promise cache
        this.promiseCache.delete(key);
      });
    }
    return promiseValue;
  }

  public tryGetRecursiveAsync<K = any, V = any>(defaultKey: K, keys: Array<K>, get: () => Promise<V>): Promise<V> {
    if (keys.length == 0) {
      return this.tryGetAsync(defaultKey, get);
    }
    const nextDefaultKey = keys[0];
    const nextKeys = keys.slice(1);
    const nextContext = this.tryGet(nextDefaultKey, () => new MemorizeContext());
    return nextContext.tryGetRecursiveAsync(nextDefaultKey, nextKeys, get);
  }
}