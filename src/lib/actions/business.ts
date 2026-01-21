/**
 * Server Actions for Business Operations
 * All API calls to business endpoints (server-side only)
 * Credentials stored securely on server, not exposed to client
 */

"use server";

import { revalidatePath } from "next/cache";

const API_URL = process.env.API_URL || "http://localhost:8000";
const API_KEY = process.env.API_KEY || "";

async function businessFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}/api/business/${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error ${response.status}: ${error}`);
  }

  return response.json();
}

// ============================================================================
// EXPENSES
// ============================================================================

export async function fetchExpenses(limit = 100) {
  return businessFetch(`expenses?limit=${limit}`);
}

export async function fetchExpenseSummary() {
  return businessFetch("expenses/summary");
}

export async function createExpense(data: {
  category: string;
  subcategory?: string;
  amount: number;
  description: string;
  vendor?: string;
  date: string;
  recurring: boolean;
  taxDeductible: boolean;
  notes?: string;
}) {
  const result = await businessFetch("expenses", {
    method: "POST",
    body: JSON.stringify(data),
  });

  revalidatePath("/admin/business-ops/expenses");

  return result;
}

export async function updateExpense(
  id: string,
  data: Partial<{
    category: string;
    subcategory: string;
    amount: number;
    description: string;
    vendor: string;
    date: string;
    recurring: boolean;
    taxDeductible: boolean;
    notes: string;
  }>
) {
  const result = await businessFetch(`expenses/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  revalidatePath("/admin/business-ops/expenses");

  return result;
}

export async function deleteExpense(id: string) {
  await businessFetch(`expenses/${id}`, {
    method: "DELETE",
  });

  revalidatePath("/admin/business-ops/expenses");
}

// ============================================================================
// GOALS
// ============================================================================

export async function fetchGoals(status?: string) {
  const params = status ? `?status=${status}` : "";
  return businessFetch(`goals${params}`);
}

export async function createGoal(data: {
  type: string;
  name: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  priority: string;
  category?: string;
}) {
  const result = await businessFetch("goals", {
    method: "POST",
    body: JSON.stringify(data),
  });

  revalidatePath("/admin/business-ops/goals");

  return result;
}

export async function updateGoal(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    targetValue: number;
    currentValue: number;
    status: string;
    priority: string;
  }>
) {
  const result = await businessFetch(`goals/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  revalidatePath("/admin/business-ops/goals");

  return result;
}

export async function updateGoalProgress(
  id: string,
  newValue: number,
  notes?: string
) {
  const result = await businessFetch(`goals/${id}/update`, {
    method: "POST",
    body: JSON.stringify({ newValue, notes }),
  });

  revalidatePath("/admin/business-ops/goals");

  return result;
}

export async function deleteGoal(id: string) {
  await businessFetch(`goals/${id}`, {
    method: "DELETE",
  });

  revalidatePath("/admin/business-ops/goals");
}

// ============================================================================
// REVENUE
// ============================================================================

export async function fetchRevenue() {
  return businessFetch("revenue");
}

export async function fetchRevenueSummary() {
  return businessFetch("revenue/summary");
}

export async function createRevenue(data: {
  source: string;
  amount: number;
  currency: string;
  description?: string;
  date: string;
  recurring: boolean;
  frequency?: string;
  notes?: string;
}) {
  const result = await businessFetch("revenue", {
    method: "POST",
    body: JSON.stringify(data),
  });

  revalidatePath("/admin/business-ops/revenue");
  revalidatePath("/admin/business-ops");

  return result;
}

// ============================================================================
// PROJECTS
// ============================================================================

export async function fetchProjects() {
  return businessFetch("projects");
}

export async function createProject(data: {
  name: string;
  description?: string;
  budget?: number;
  status: string;
  startDate: string;
  endDate?: string;
}) {
  const result = await businessFetch("projects", {
    method: "POST",
    body: JSON.stringify(data),
  });

  revalidatePath("/admin/business-ops");

  return result;
}

export async function addTimeEntry(
  projectId: string,
  data: {
    date: string;
    hours: number;
    description: string;
  }
) {
  const result = await businessFetch(`projects/${projectId}/time`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  revalidatePath("/admin/business-ops");

  return result;
}

// ============================================================================
// TAX RECORDS
// ============================================================================

export async function fetchTaxRecords() {
  return businessFetch("tax-records");
}

export async function fetchTaxSummary(year: number) {
  return businessFetch(`tax-records/summary/${year}`);
}

export async function createTaxRecord(data: {
  type: string;
  category: string;
  amount: number;
  currency: string;
  date: string;
  description: string;
  documentation?: string;
}) {
  const result = await businessFetch("tax-records", {
    method: "POST",
    body: JSON.stringify(data),
  });

  revalidatePath("/admin/business-ops/tax");

  return result;
}
