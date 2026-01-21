"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { twMerge } from "tailwind-merge";

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
                <Dialog.Overlay className="fixed inset-0 bg-matrix-black/80 backdrop-blur-sm" />
                <Dialog.Content
                    className={twMerge(
                        "fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-matrix-border/40 bg-matrix-darker p-6 shadow-matrix-lg",
                        className
                    )}
                >
                    {title && (
                        <Dialog.Title className="text-lg font-semibold text-matrix-text-primary font-mono">
                            {title}
                        </Dialog.Title>
                    )}
                    {description && (
                        <Dialog.Description className="mt-1 text-sm text-matrix-text-secondary">
                            {description}
                        </Dialog.Description>
                    )}
                    <div className="mt-4">{children}</div>
                    <Dialog.Close asChild>
                        <button className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-matrix-primary text-matrix-black px-4 text-sm font-medium hover:bg-matrix-secondary hover:shadow-matrix transition-all font-mono">
                            Close
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
