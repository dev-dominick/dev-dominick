/**
 * Lightweight API client
 * No external dependencies - just fetch
 */

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

export const apiClient = {
  // Generic HTTP methods
  async get<T = unknown>(endpoint: string): Promise<T> {
    return request<T>(endpoint, { method: 'GET' });
  },

  async post<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    return request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async put<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    return request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async patch<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    return request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async delete<T = unknown>(endpoint: string): Promise<T> {
    return request<T>(endpoint, { method: 'DELETE' });
  },

  // Legacy specific methods (kept for backwards compatibility)
  async getExpenses() {
    return this.get('/api/app/business/expenses');
  },

  async createExpense(data: unknown) {
    return this.post('/api/app/business/expenses', data);
  },

  async getFinanceBalances() {
    return this.get('/api/finance/balances');
  },
};
