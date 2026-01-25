/**
 * useNavActive Hook
 * Determines active navigation item and section based on current pathname
 *
 * Logic:
 * 1. First check for exact matches (item.exact === true && item.href === pathname)
 * 2. If no exact match, find longest startsWith match (sorted by href length descending)
 * 3. Return activeItem + activeSection
 */

"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { navConfig, type NavItem, type NavSection } from "@/lib/config/nav-config";

export interface ActiveNavState {
  /** Currently active navigation item */
  activeItem: NavItem | null;
  /** Currently active section */
  activeSection: NavSection | null;
}

export function useNavActive(): ActiveNavState {
  const pathname = usePathname();

  return useMemo(() => {
    let activeItem: NavItem | null = null;
    let activeSection: NavSection | null = null;

    // Step 1: Check for exact matches
    for (const section of navConfig.sections) {
      const exactMatch = section.items.find(
        (item) => item.exact && item.href === pathname
      );
      if (exactMatch) {
        activeItem = exactMatch;
        activeSection = section;
        return { activeItem, activeSection };
      }
    }

    // Step 2: Find longest startsWith match
    const allItems: Array<{ item: NavItem; section: NavSection }> = [];
    for (const section of navConfig.sections) {
      for (const item of section.items) {
        if (!item.exact) {
          allItems.push({ item, section });
        }
      }
    }

    // Sort by href length descending (longest first)
    allItems.sort((a, b) => b.item.href.length - a.item.href.length);

    // Find first match
    for (const { item, section } of allItems) {
      if (pathname.startsWith(item.href)) {
        activeItem = item;
        activeSection = section;
        break;
      }
    }

    return { activeItem, activeSection };
  }, [pathname]);
}
