/**
 * useModal Hook
 * Manages modal/dialog open/close state
 */

import { useState, useCallback } from "react";

interface UseModalOptions {
  initialOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

/**
 * Hook to manage modal/dialog state
 */
export function useModal({
  initialOpen = false,
  onOpen,
  onClose,
}: UseModalOptions = {}) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback(() => {
    setIsOpen(true);
    onOpen?.();
  }, [onOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return { isOpen, open, close, toggle };
}
