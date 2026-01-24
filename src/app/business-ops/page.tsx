'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdminAuth, useBusinessData } from '@/lib/hooks';
import { formatters } from '@/lib/formatters';

interface DashboardData {
  timestamp: string;
  financial: {
    revenue: number;
    expenses: number;
    profit: number;
    profitMargin: number;
  };
  projects: {
    active: number;
  };
  goals: {
    active: number;
    onTrack: number;
    atRisk: number;
  };
}

export default function BusinessOpsPage() {
  const { logout } = useAdminAuth();
  const [period, setPeriod] = useState('month');

  const { data: dashboard, loading } = useBusinessData<DashboardData>({
    endpoint: `business-ops/dashboard?period=${period}`,
    refetchInterval: 60000, // Refetch every minute
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 to-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Business Operations Dashboard</h1>
            <p className="text-gray-400">Financial Tracking & Analytics</p>
          </div>
          <button
            onClick={logout}
            className="text-gray-400 hover:text-gray-300 text-sm transition-colors px-4 py-2"
          >
            Logout
          </button>
        </div>

        {/* Period Selector */}
        <div className="mb-8 flex gap-2">
          {['week', 'month', 'quarter', 'year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${period === p
                ? 'bg-sky-500 text-white'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading dashboard...</div>
        ) : dashboard ? (
          <div className="space-y-6">

            {/* Financial Overview */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Financial Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  label="Revenue"
                  value={formatters.currency(dashboard.financial.revenue)}
                  trend="up"
                  color="green"
                />
                <MetricCard
                  label="Expenses"
                  value={formatters.currency(dashboard.financial.expenses)}
                  trend="neutral"
                  color="red"
                />
                <MetricCard
                  label="Profit"
                  value={formatters.currency(dashboard.financial.profit)}
                  trend={dashboard.financial.profit > 0 ? 'up' : 'down'}
                  color={dashboard.financial.profit > 0 ? 'green' : 'red'}
                />
                <MetricCard
                  label="Profit Margin"
                  value={formatters.percent(dashboard.financial.profitMargin / 100)}
                  trend={dashboard.financial.profitMargin > 20 ? 'up' : 'neutral'}
                  color={dashboard.financial.profitMargin > 20 ? 'green' : 'yellow'}
                />
              </div>
            </div>

            {/* Projects & Goals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Projects</h2>
                <div className="space-y-4">
                  <MetricCard
                    label="Active Projects"
                    value={dashboard.projects.active.toString()}
                    trend="neutral"
                    color="blue"
                  />
                  <Link href="/admin/business-ops/projects">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-all">
                      Manage Projects →
                    </button>
                  </Link>
                </div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Goals</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{dashboard.goals.active}</div>
                      <div className="text-sm text-gray-400">Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{dashboard.goals.onTrack}</div>
                      <div className="text-sm text-gray-400">On Track</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-400">{dashboard.goals.atRisk}</div>
                      <div className="text-sm text-gray-400">At Risk</div>
                    </div>
                  </div>
                  <Link href="/admin/business-ops/goals">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-all">
                      Manage Goals →
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <ActionButton
                href="/admin/business-ops/expenses"
                label="Track Expenses"
                icon="💰"
              />
              <ActionButton
                href="/admin/business-ops/revenue"
                label="Record Revenue"
                icon="💵"
              />
              <ActionButton
                href="/admin/business-ops/tax"
                label="Tax Records"
                icon="📊"
              />
              <ActionButton
                href="/admin/business-ops/reports"
                label="View Reports"
                icon="📈"
              />
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-12">No data available</div>
        )}

        {/* Navigation */}
        <div className="mt-8">
          <Link href="/admin/scheduler">
            <button className="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold py-3 rounded-lg transition-all">
              ← Back to Admin Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  trend,
  color,
}: {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
  color: 'green' | 'red' | 'blue' | 'yellow';
}) {
  const colorClasses = {
    green: 'text-green-400',
    red: 'text-red-400',
    blue: 'text-blue-400',
    yellow: 'text-yellow-400',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
      <div className="text-sm text-gray-400 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${colorClasses[color]} flex items-center gap-2`}>
        {value}
        <span className="text-sm">{trendIcons[trend]}</span>
      </div>
    </div>
  );
}

function ActionButton({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link href={href}>
      <button className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg p-4 text-left transition-all group">
        <div className="text-3xl mb-2">{icon}</div>
        <div className="text-white font-medium group-hover:text-blue-400 transition-colors">
          {label}
        </div>
      </button>
    </Link>
  );
}
