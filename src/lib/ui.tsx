/**
 * UI Component Exports
 * Central hub for all reusable UI components with theme-aware styling
 * All components use the unified color system defined in tailwind.config.ts
 */

// Re-export all components from @/components/ui
export { Button } from "@/components/ui/Button";
export type { ButtonProps } from "@/components/ui/Button";

export { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
export type { CardProps } from "@/components/ui/Card";

export { Input, InputWithIcon, Calendar, PasswordStrength, Textarea } from "@/components/ui/Input";
export type { InputProps, TextareaProps } from "@/components/ui/Input";

export { Modal } from "@/components/ui/modal";
export type { ModalProps } from "@/components/ui/modal";

export { Alert, ConfirmDialog } from "@/components/ui/alert";
export type { AlertProps, ConfirmDialogProps } from "@/components/ui/alert";

export { PriceCard } from "@/components/ui/price-card";
export type { PriceCardProps } from "@/components/ui/price-card";

export { Icon } from "@/components/ui/icon";
export type { IconProps } from "@/components/ui/icon";

export { DarkModeToggle } from "@/components/ui/dark-mode-toggle";
export { Container } from "@/components/ui/container";
export { Badge } from "@/components/ui/badge";
export { Section } from "@/components/ui/section";
export { PageHeader } from "@/components/ui/page-header";

export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonCard,
  SkeletonTable,
  SkeletonForm,
  SkeletonList,
} from "@/components/ui/skeleton";

export { ToastProvider, useToast } from "@/components/ui/toast";
export type { ToastType, ToastMessage } from "@/components/ui/toast";

// Utility for merging classNames with tailwind
export { cn } from "@/lib/utils";

