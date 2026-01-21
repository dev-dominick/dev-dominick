'use client';

import Link from 'next/link';
import { useAdminAuth, useBusinessData, useBusinessForm, useModal } from '@/lib/hooks';
import { formatters } from '@/lib/utils';
import { DataView, FormError, LoadingSpinner } from '@/components/admin';
import { fetchExpenses, fetchExpenseSummary, createExpense } from '@/lib/actions/business';

interface Expense {
  id: string;
  category: string;
  subcategory?: string;
  amount: number;
  currency: string;
  description: string;
  vendor?: string;
  date: string;
  recurring: boolean;
  taxDeductible: boolean;
  notes?: string;
}

interface ExpenseSummary {
  grandTotal: number;
  summary: Array<{
    category: string;
    total: number;
    count: number;
  }>;
}

export default function ExpensesPage() {
  useAdminAuth();
  const { isOpen: showForm, open, close } = useModal();

  // Fetch expenses data
  const { data: expensesData, loading: loadingExpenses, refetch } = useBusinessData<{ expenses: Expense[] }>({
    endpoint: 'expenses?limit=100',
  });

  // Fetch summary data
  const { data: summary, loading: loadingSummary } = useBusinessData<ExpenseSummary>({
    endpoint: 'expenses/summary',
  });

  // Form management
  const {
    formData,
    handleChange,
    handleSubmit: onSubmit,
    loading: submitting,
    error,
  } = useBusinessForm({
    endpoint: 'expenses',
    initialValues: {
      category: 'infrastructure',
      subcategory: '',
      amount: '',
      description: '',
      vendor: '',
      date: new Date().toISOString().split('T')[0],
      recurring: false,
      frequency: '',
      taxDeductible: true,
      notes: '',
    },
    dataTransform: (data) => ({
      ...data,
      amount: parseFloat(data.amount),
      date: new Date(data.date).toISOString(),
    }),
    onSuccess: () => {
      alert('Expense recorded successfully!');
      close();
      refetch();
    },
  });

  const expenses = expensesData?.expenses || [];
  const loading = loadingExpenses || loadingSummary;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 to-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Expense Tracker</h1>
            <p className="text-gray-400">Track and categorize business expenses</p>
          </div>
          <button
            onClick={open}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-all"
          >
            + New Expense
          </button>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Total Expenses</div>
              <div className="text-2xl font-bold text-red-400">
                {formatters.currency(summary.grandTotal)}
              </div>
            </div>
            {summary.summary.slice(0, 3).map((item) => (
              <div key={item.category} className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1 capitalize">{item.category}</div>
                <div className="text-2xl font-bold text-white">
                  {formatters.currency(item.total)}
                </div>
                <div className="text-xs text-gray-500">{item.count} transactions</div>
              </div>
            ))}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Record New Expense</h2>
            <FormError error={error} />
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    required
                    disabled={submitting}
                  >
                    <option value="infrastructure">Infrastructure</option>
                    <option value="marketing">Marketing</option>
                    <option value="software">Software</option>
                    <option value="labor">Labor</option>
                    <option value="taxes">Taxes</option>
                    <option value="transaction_fees">Transaction Fees</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Amount (USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    placeholder="0.00"
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description *
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    placeholder="What was this expense for?"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Vendor
                  </label>
                  <input
                    type="text"
                    name="vendor"
                    value={formData.vendor}
                    onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    placeholder="Who did you pay?"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    placeholder="Select date"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-gray-300">
                    <input
                      type="checkbox"
                      name="recurring"
                      checked={formData.recurring}
                      onChange={handleChange}
                      className="w-5 h-5"
                      disabled={submitting}
                    />
                    Recurring Expense
                  </label>

                  <label className="flex items-center gap-2 text-gray-300">
                    <input
                      type="checkbox"
                      name="taxDeductible"
                      checked={formData.taxDeductible}
                      onChange={handleChange}
                      className="w-5 h-5"
                      disabled={submitting}
                    />
                    Tax Deductible
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? 'Recording...' : 'Record Expense'}
              </button>
            </form>
          </div>
        )}

        {/* Expense List */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Recent Expenses</h2>
          {loading ? (
            <div className="text-center text-gray-400 py-12">Loading...</div>
          ) : expenses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800 text-left">
                    <th className="py-3 px-4 text-gray-400 font-medium">Date</th>
                    <th className="py-3 px-4 text-gray-400 font-medium">Category</th>
                    <th className="py-3 px-4 text-gray-400 font-medium">Description</th>
                    <th className="py-3 px-4 text-gray-400 font-medium">Vendor</th>
                    <th className="py-3 px-4 text-gray-400 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-3 px-4 text-gray-300">
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block bg-gray-800 px-2 py-1 rounded text-sm text-gray-300">
                          {expense.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white">{expense.description}</td>
                      <td className="py-3 px-4 text-gray-400">{expense.vendor || '-'}</td>
                      <td className="py-3 px-4 text-right text-red-400 font-medium">
                        {formatters.currency(expense.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">No expenses recorded yet</div>
          )}
        </div>

        <div className="mt-8">
          <Link href="/admin/business-ops">
            <button className="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold py-3 rounded-lg transition-all">
              ← Back to Business Ops
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
