const toString = Object.prototype.toString;

export function is(val: unknown, type: string): boolean {
  return toString.call(val) === `[object ${type}]`;
}

export function isDef<T = unknown>(val?: T): val is T {
  return typeof val !== 'undefined';
}

export function isUnDef<T = unknown>(val?: T): val is T {
  return !isDef(val);
}

export function isObject(val: unknown): val is Record<string, unknown> {
  return val !== null && is(val, 'Object');
}

export function isString(val: unknown): val is string {
  return is(val, 'String');
}

export function isNumber(val: unknown): val is number {
  return is(val, 'Number');
}

export function isBoolean(val: unknown): val is boolean {
  return is(val, 'Boolean');
}

export function isFunction(val: unknown): val is (...args: unknown[]) => unknown {
  return typeof val === 'function';
}

export function isArray(val: unknown): val is unknown[] {
  return Array.isArray(val);
}

export function isEmpty(val: unknown): boolean {
  if (isArray(val) || isString(val)) return val.length === 0;
  if (val instanceof Map || val instanceof Set) return val.size === 0;
  if (isObject(val)) return Object.keys(val).length === 0;
  return false;
}

export function isNullOrUnDef(val: unknown): val is null | undefined {
  return val === null || val === undefined;
}
