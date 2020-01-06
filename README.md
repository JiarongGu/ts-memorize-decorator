# ts-memorize-decorator

decorator base caching, wich context can manage the cache itself

## Getting started

```bash
npm i ts-memorize-decorator
```

````javascript
import { MemorizeContext, memorize, memorizeAsync } from 'ts-memorize-decorator';

class CacheTest() {
  static context = new MemorizeContext();

  @memorize(CacheTest.context)
  getValue() {
    return 1 + 1;
  }
  
  @memorizeAsync(CacheTest.context)
  getValueAsync() {
    return Promise.resolve(1 + 1);
  }
  
  clearCache() {
    CacheTest.context.delete(this.getValue.name);
    CacheTest.context.delete(this.getValueAsync.name);
    
    // or CacheTest.context.clear();
  }
}
````
