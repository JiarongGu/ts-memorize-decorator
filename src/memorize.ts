import { MemorizeContext } from './memorize-context';

export const memorize = (context: MemorizeContext, defaultKey?: string) => (
  _: Object, key: String, descriptor: TypedPropertyDescriptor<any>
) => {
  const getter = descriptor.get;
  const method = descriptor.value;

  if (!getter && !method) {
    return descriptor;
  }

  const methodKey = defaultKey || key;

  if (method) {
    descriptor.value = function () {
      return context.tryGetRecursive(methodKey, Array.from(arguments), () => method.apply(this, arguments as any));
    };
    Object.defineProperties(descriptor.value, Object.getOwnPropertyDescriptors(method));
  }

  if (getter) {
    descriptor.get = function () {
      return context.tryGet(methodKey, () => getter.apply(this));
    };
    Object.defineProperties(descriptor.get, Object.getOwnPropertyDescriptors(getter));
  }

  return descriptor;
};
