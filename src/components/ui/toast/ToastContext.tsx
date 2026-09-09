import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';

export interface ToastOptions {
  message: string;
  /** Auto-dismiss duration in ms. Defaults to 2500. */
  durationMs?: number;
}

interface ToastContextValue {
  showToast: (options: ToastOptions | string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export interface ToastState {
  id: number;
  message: string;
  durationMs: number;
}

export interface ToastController {
  toast: ToastState | null;
  showToast: (options: ToastOptions | string) => void;
  dismissToast: () => void;
}

/**
 * Shared toast state for the host + imperative API.
 * Kept in one module so screens can call `useToast()` without prop drilling.
 */
export function useToastController(): ToastController {
  const [toast, setToast] = useState<ToastState | null>(null);
  const sequence = useRef(0);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const showToast = useCallback((options: ToastOptions | string) => {
    const next = typeof options === 'string' ? {message: options} : options;
    const message = next.message.trim();
    if (!message) {
      return;
    }

    sequence.current += 1;
    setToast({
      id: sequence.current,
      message,
      durationMs: next.durationMs ?? 2500,
    });
  }, []);

  return {toast, showToast, dismissToast};
}

export function ToastProvider({
  children,
  value,
}: PropsWithChildren<{value: ToastContextValue}>) {
  const contextValue = useMemo(
    () => ({showToast: value.showToast}),
    [value.showToast],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider.');
  }
  return context;
}
