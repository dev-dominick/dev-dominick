/**
 * Navigation Configuration Types
 * Type definitions for app shell navigation
 */

import { LucideIcon } from "lucide-react";

export type NavRole = "user" | "admin";
export type NavGroup =
  | "Overview"
  | "Finance"
  | "Operations"
  | "Reports"
  | "Admin";

export interface NavItem {
  /** Display label */
  label: string;
  /** Navigation path */
  href: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Group bucket for sidebar organization */
  group: NavGroup;
  /** Exact path match for active state (default: false) */
  exact?: boolean;
  /** Roles that can see this item (default: both) */
  roles?: NavRole[];
  /** Optional badge text */
  badge?: string;
  /** Optional badge variant */
  badgeVariant?: "default" | "primary" | "success" | "warning" | "danger";
  /** Flag feature as coming soon */
  comingSoon?: boolean;
}

export interface NavSection {
  /** Section title */
  title: NavGroup;
  /** Navigation items in this section */
  items: NavItem[];
}

export interface NavConfig {
  /** All navigation sections */
  sections: NavSection[];
}

export interface ActiveNavState {
  /** Currently active navigation item */
  activeItem: NavItem | null;
  /** Currently active section */
  activeSection: NavSection | null;
}
