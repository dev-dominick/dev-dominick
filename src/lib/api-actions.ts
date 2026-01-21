"use server";

/**
 * API Client Server Action
 * Wraps all API calls to backend from frontend
 * Prevents hardcoded API URLs and credentials in client code
 */

import { headers } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Safe API call handler
 * All frontend-to-backend communication goes through here
 */
export async function apiCall(
  endpoint: string,
  options: RequestInit = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const headersList = await headers();
  const token = headersList.get("authorization") || "";

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed: ${endpoint}`, error);
    throw new Error("Failed to communicate with server. Please try again.");
  }
}

/**
 * Business Operations API calls
 */
export async function getBusinessDashboard(period: string = "month") {
  return apiCall(`/api/business-ops/dashboard?period=${period}`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createExpense(expenseData: any) {
  return apiCall("/api/business-ops/expenses", {
    method: "POST",
    body: JSON.stringify(expenseData),
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createRevenue(revenueData: any) {
  return apiCall("/api/business-ops/revenue", {
    method: "POST",
    body: JSON.stringify(revenueData),
  });
}

/**
 * Auth API calls
 */
export async function loginUser(email: string, password: string) {
  return apiCall("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logoutUser() {
  return apiCall("/api/auth/logout", { method: "POST" });
}

/**
 * Contact form submission (backend-only, no hardcoded endpoint)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function submitContactForm(formData: any) {
  return apiCall("/api/contact", {
    method: "POST",
    body: JSON.stringify(formData),
  });
}

/**
 * Cart checkout
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createCheckoutSession(items: any[], total: number) {
  return apiCall("/api/checkout/session", {
    method: "POST",
    body: JSON.stringify({ items, total }),
  });
}
/**
 * Agent API calls
 * Proxy to backend Ollama/FastAPI agent endpoint
 */
export async function callAgent(
  prompt: string,
  model: string = "mistral",
  system: string = "",
  temperature: number = 0.7,
) {
  return apiCall("/api/agent", {
    method: "POST",
    body: JSON.stringify({ prompt, model, system, temperature }),
  });
}

export async function getAgentModels() {
  return apiCall("/api/agent", { method: "GET" });
}
