/**
 * Lightweight API client
 * No external dependencies - just fetch
 */

export const apiClient = {
  async getExpenses() {
    const res = await fetch('/api/app/business/expenses');
    return res.json();
  },

  async createExpense(data: any) {
    const res = await fetch('/api/app/business/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getFinanceBalances() {
    const res = await fetch('/api/finance/balances');
    return res.json();
  },
};
