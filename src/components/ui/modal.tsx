"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { twMerge } from "tailwind-merge";
import { X } from "lucide-react";

export interface ModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onOpenChange, title, description, children, className }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content
          className={twMerge(
            "fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)] p-6 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200",
            className
          )}
        >
          <Dialog.Close asChild>
            <button
              className="absolute right-4 top-4 p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-overlay)] transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </Dialog.Close>
          {title && (
            <Dialog.Title className="text-lg font-semibold text-[var(--text-primary)]">
              {title}
            </Dialog.Title>
          )}
          {description && (
            <Dialog.Description className="mt-2 text-sm text-[var(--text-secondary)]">
              {description}
            </Dialog.Description>
          )}
          <div className="mt-4">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Confirmation modal variant for approve/reject actions
export interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: 'danger' | 'warning' | 'success' | 'default';
  loading?: boolean;
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  variant = 'default',
  loading = false,
}: ConfirmModalProps) {
  const variantStyles = {
    danger: 'bg-[var(--error)] hover:bg-[var(--error)]/90 text-white',
    warning: 'bg-[var(--warning)] hover:bg-[var(--warning)]/90 text-black',
    success: 'bg-[var(--success)] hover:bg-[var(--success)]/90 text-white',
    default: 'bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-black',
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)] p-6 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200">
          <Dialog.Title className="text-lg font-semibold text-[var(--text-primary)]">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-[var(--text-secondary)]">
            {description}
          </Dialog.Description>
          <div className="mt-6 flex gap-3 justify-end">
            <Dialog.Close asChild>
              <button
                className="px-4 py-2 rounded-md text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-overlay)] border border-[var(--border-default)] transition-colors"
                disabled={loading}
              >
                {cancelLabel}
              </button>
            </Dialog.Close>
            <button
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
              disabled={loading}
              className={twMerge(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50",
                variantStyles[variant]
              )}
            >
              {loading ? 'Processing...' : confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
