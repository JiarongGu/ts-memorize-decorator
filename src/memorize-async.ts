import { MemorizeContext } from './memorize-context';

export const memorizeAsync = (context: MemorizeContext, defaultKey?: string) => (
  _: Object, key: String, descriptor: TypedPropertyDescriptor<any>
) => {
  const getter = descriptor.get;
  const method = descriptor.value;
  const valid = getter || method;

  if (!valid) {
    return descriptor;
  }

  const methodKey = defaultKey || key;

  if (method) {
    descriptor.value = function () {
      return context.tryGetRecursiveAsync(methodKey, Array.from(arguments), () =>
        method.apply(this, arguments as any)
      );
    };
    Object.defineProperties(descriptor.value, Object.getOwnPropertyDescriptors(method));
  }

  if (getter) {
    descriptor.get = function () {
      return context.tryGetAsync(methodKey, () => getter.apply(this));
    };
    Object.defineProperties(descriptor.get, Object.getOwnPropertyDescriptors(getter));
  }
  return descriptor;
};
