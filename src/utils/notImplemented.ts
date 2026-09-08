export class NotImplementedError extends Error {
  constructor(feature: string) {
    super(`${feature} is not implemented yet.`);
    this.name = 'NotImplementedError';
  }
}

export function notImplemented(feature: string): never {
  throw new NotImplementedError(feature);
}
