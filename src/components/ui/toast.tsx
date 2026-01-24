'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

interface ToastContextType {
  toast: (message: Omit<ToastMessage, 'id'>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((message: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const duration = message.duration ?? (message.type === 'error' ? 5000 : 4000);

    setToasts((prev) => [...prev, { ...message, id }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-0 right-0 z-50 flex flex-col gap-3 p-4 sm:p-6 pointer-events-none">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onDismiss={() => onDismiss(toast.id)}
        />
      ))}
    </div>
  );
}

interface ToastProps extends ToastMessage {
  onDismiss: () => void;
}

function Toast({
  id,
  type,
  title,
  message,
  action,
  onDismiss,
}: ToastProps) {
  const icons = {
    success: <CheckCircle2 className="h-5 w-5 flex-shrink-0" />,
    error: <AlertCircle className="h-5 w-5 flex-shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 flex-shrink-0" />,
    info: <Info className="h-5 w-5 flex-shrink-0" />,
  };

  const styles = {
    success: {
      bg: 'bg-success-50 dark:bg-success-950',
      border: 'border-success-200 dark:border-success-800',
      icon: 'text-success-600 dark:text-success-400',
      text: 'text-success-900 dark:text-success-100',
      button: 'hover:bg-success-100 dark:hover:bg-success-900',
    },
    error: {
      bg: 'bg-danger-50 dark:bg-danger-950',
      border: 'border-danger-200 dark:border-danger-800',
      icon: 'text-danger-600 dark:text-danger-400',
      text: 'text-danger-900 dark:text-danger-100',
      button: 'hover:bg-danger-100 dark:hover:bg-danger-900',
    },
    warning: {
      bg: 'bg-warning-50 dark:bg-warning-950',
      border: 'border-warning-200 dark:border-warning-800',
      icon: 'text-warning-600 dark:text-warning-400',
      text: 'text-warning-900 dark:text-warning-100',
      button: 'hover:bg-warning-100 dark:hover:bg-warning-900',
    },
    info: {
      bg: 'bg-primary-50 dark:bg-primary-950',
      border: 'border-primary-200 dark:border-primary-800',
      icon: 'text-sky-600 dark:text-sky-400',
      text: 'text-primary-900 dark:text-primary-100',
      button: 'hover:bg-primary-100 dark:hover:bg-primary-900',
    },
  };

  const style = styles[type];

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={twMerge(
        'pointer-events-auto animate-slideUp rounded-lg border px-4 py-4 sm:px-5',
        'shadow-lg backdrop-blur-sm',
        'max-w-sm w-full',
        style.bg,
        style.border
      )}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className={twMerge('pt-0.5 flex-shrink-0', style.icon)}>
          {icons[type]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={twMerge('font-semibold text-sm', style.text)}>
            {title}
          </h3>
          {message && (
            <p className={twMerge('text-sm mt-1 opacity-90', style.text)}>
              {message}
            </p>
          )}

          {/* Action button */}
          {action && (
            <button
              onClick={action.onClick}
              className={twMerge(
                'mt-3 text-sm font-medium px-3 py-1.5 rounded-md',
                'transition-colors duration-200',
                style.text,
                style.button
              )}
            >
              {action.label}
            </button>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={onDismiss}
          className={twMerge(
            'flex-shrink-0 rounded-md p-1 transition-colors duration-200',
            style.button
          )}
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
