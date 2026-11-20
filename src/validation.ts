export function integer(value: number, name: string, minimum = 1): number {
  if (!Number.isInteger(value) || value < minimum || value > 512) {
    throw new RangeError(`${name} must be an integer between ${minimum} and 512.`);
  }
  return value;
}

export function choice<T extends string>(value: T, values: readonly T[], name: string): T {
  if (!values.includes(value)) throw new TypeError(`Invalid ${name}: ${String(value)}.`);
  return value;
}

export function nonempty(value: string, name: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${name} must be a non-empty string.`);
  return value;
}

export function booleanOption(value: boolean, name: string): boolean {
  if (typeof value !== 'boolean') throw new TypeError(`${name} must be a boolean.`);
  return value;
}

export function milliseconds(value: number, name: string, minimum: number): number {
  if (!Number.isFinite(value) || value < minimum || value > 2147483647) {
    throw new RangeError(`${name} must be a finite number between ${minimum} and 2147483647 milliseconds.`);
  }
  return value;
}

export function checkOptions(value: object): void {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Options must be an object.');
  for (const [name, option] of Object.entries(value)) {
    if (option === null) throw new TypeError(`${name} must not be null.`);
  }
}
