'use client';

import { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';
import { Button } from './button';
import { twMerge } from 'tailwind-merge';

export interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string | ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  };
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function Alert({
  type = 'info',
  title,
  message,
  action,
  dismissible = true,
  onDismiss,
  className,
}: AlertProps) {
  const icons = {
    success: <CheckCircle2 className="h-5 w-5" />,
    error: <AlertCircle className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
  };

  const styles = {
    success: {
      bg: 'bg-success-50 dark:bg-success-950/30',
      border: 'border-success-200 dark:border-success-800',
      icon: 'text-success-600 dark:text-success-400',
      title: 'text-success-900 dark:text-success-100',
      message: 'text-success-800 dark:text-success-200',
    },
    error: {
      bg: 'bg-danger-50 dark:bg-danger-950/30',
      border: 'border-danger-200 dark:border-danger-800',
      icon: 'text-danger-600 dark:text-danger-400',
      title: 'text-danger-900 dark:text-danger-100',
      message: 'text-danger-800 dark:text-danger-200',
    },
    warning: {
      bg: 'bg-warning-50 dark:bg-warning-950/30',
      border: 'border-warning-200 dark:border-warning-800',
      icon: 'text-warning-600 dark:text-warning-400',
      title: 'text-warning-900 dark:text-warning-100',
      message: 'text-warning-800 dark:text-warning-200',
    },
    info: {
      bg: 'bg-sky-50 dark:bg-sky-950/30',
      border: 'border-sky-200 dark:border-sky-800',
      icon: 'text-sky-600 dark:text-sky-400',
      title: 'text-sky-900 dark:text-sky-100',
      message: 'text-sky-800 dark:text-sky-200',
    },
  };

  const style = styles[type];

  return (
    <div
      role="alert"
      className={twMerge(
        'rounded-lg border px-4 py-4 sm:px-6',
        'animate-slideUp',
        style.bg,
        style.border,
        className
      )}
    >
      <div className="flex gap-4">
        {/* Icon */}
        <div className={twMerge('flex-shrink-0 pt-0.5', style.icon)}>
          {icons[type]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={twMerge('font-semibold text-sm sm:text-base', style.title)}>
            {title}
          </h3>
          {message && (
            <div className={twMerge('text-sm mt-1', style.message)}>
              {typeof message === 'string' ? message : message}
            </div>
          )}

          {/* Actions */}
          {action && (
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                variant={action.variant || 'primary'}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            </div>
          )}
        </div>

        {/* Close button */}
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className={twMerge(
              'flex-shrink-0 text-current opacity-50 hover:opacity-100',
              'transition-opacity duration-200',
              'rounded-md p-1'
            )}
            aria-label="Dismiss alert"
          >
            <XCircle className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string | ReactNode;
  type?: 'danger' | 'warning' | 'info';
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  type = 'warning',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isLoading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const variantMap = {
    danger: 'danger' as const,
    warning: 'warning' as const,
    info: 'primary' as const,
  };

  const iconMap = {
    danger: <AlertCircle className="h-12 w-12 text-danger-600 dark:text-danger-400" />,
    warning: <AlertTriangle className="h-12 w-12 text-warning-600 dark:text-warning-400" />,
    info: <Info className="h-12 w-12 text-sky-600 dark:text-sky-400" />,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      <div className="animate-scaleIn bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-w-sm w-full p-6 sm:p-8">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          {iconMap[type]}
        </div>

        {/* Title */}
        <h2
          id="dialog-title"
          className="text-xl font-bold text-center text-neutral-900 dark:text-neutral-100 mb-2"
        >
          {title}
        </h2>

        {/* Message */}
        <div
          id="dialog-description"
          className="text-sm text-center text-neutral-600 dark:text-neutral-400 mb-6"
        >
          {typeof message === 'string' ? message : message}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variantMap[type]}
            fullWidth
            loading={isLoading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
