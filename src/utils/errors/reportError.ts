/**
 * Development-only technical logging.
 * Never log secrets (tokens, passwords, API keys, full credentials).
 * Production: silent (ready for Crashlytics/Sentry wiring later).
 */

const SECRET_KEY_PATTERN =
  /(password|passwd|token|api[_-]?key|authorization|secret|credential)/i;

function sanitizeMeta(
  meta?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!meta) {
    return undefined;
  }

  const next: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    if (SECRET_KEY_PATTERN.test(key)) {
      next[key] = '[redacted]';
      continue;
    }

    if (typeof value === 'string' && value.length > 500) {
      next[key] = `${value.slice(0, 500)}…`;
      continue;
    }

    next[key] = value;
  }

  return next;
}

function summarizeError(error: unknown): {
  name?: string;
  message: string;
  code?: string;
} {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as {code: unknown}).code === 'string'
  ) {
    const code = (error as {code: string}).code;
    const message =
      error instanceof Error
        ? error.message
        : typeof (error as {message?: unknown}).message === 'string'
          ? ((error as unknown as {message: string}).message)
          : 'Unknown error';
    return {
      name: error instanceof Error ? error.name : undefined,
      message,
      code,
    };
  }

  if (error instanceof Error) {
    return {name: error.name, message: error.message};
  }

  return {message: String(error)};
}

/**
 * Report a technical failure for diagnostics.
 * Always call this instead of bare console.error for app errors.
 */
export function reportError(
  scope: string,
  error: unknown,
  meta?: Record<string, unknown>,
): void {
  if (!__DEV__) {
    return;
  }

  const summary = summarizeError(error);
  const safeMeta = sanitizeMeta(meta);

  // Technical logs are intentionally gated; keep console usage explicit.
  console.error(`[${scope}]`, summary, safeMeta ?? '');
}

/**
 * Optional non-error diagnostic (dev only).
 */
export function reportWarning(
  scope: string,
  message: string,
  meta?: Record<string, unknown>,
): void {
  if (!__DEV__) {
    return;
  }

  console.warn(`[${scope}]`, message, sanitizeMeta(meta) ?? '');
}
