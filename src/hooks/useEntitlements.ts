"use client";

import { useContext } from "react";
import {
  EntitlementContext,
  EntitlementContextType,
} from "@/contexts/EntitlementContext";

export function useEntitlements(): EntitlementContextType {
  const context = useContext(EntitlementContext);
  if (context === undefined) {
    throw new Error("useEntitlements must be used within EntitlementProvider");
  }
  return context;
}
