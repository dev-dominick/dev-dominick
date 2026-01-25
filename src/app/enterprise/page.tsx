'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, Clock, TrendingUp, Activity, AlertCircle, RefreshCw, LogOut, CheckCircle } from 'lucide-react';

interface AppointmentStats {
  total: number;
  pending: number;
  confirmed: number;
  revenue: number;
  upcoming?: number;
  completed?: number;
  conversion_rate?: number;
}

interface FinancialData {
  revenue: number;
  revenue_count?: number;
  expenses: number;
  profit_margin: number;
}

interface ProjectsData {
  active: number;
}

interface BusinessOpsStats {
  expenses_total: number;
  revenue_total: number;
  profit_margin: number;
  goals_completed: number;
  financial?: FinancialData;
  projects?: ProjectsData;
}

interface ResourceStats {
  percent: number;
}

interface PaymentStats {
  total_processed: number;
  total_processed_24h?: number;
  successful: number;
  pending: number;
  status?: string;
  error?: string;
  recent_charges?: number;
  successful_sessions?: number;
}

interface SystemStats {
  uptime_hours: number;
  api_calls_total: number;
  cache_hit_rate: number;
  status?: string;
  cpu?: ResourceStats;
  memory?: ResourceStats;
  disk?: ResourceStats;
  platform?: string;
}

interface AutomationStats {
  tasks_completed: number;
  success_rate: number;
  time_saved_hours: number;
}

interface DashboardData {
  timestamp: string;
  period_days: number;
  appointments: AppointmentStats;
  business_ops: BusinessOpsStats;
  payments: PaymentStats;
  system: SystemStats;
  automation: AutomationStats;
}

export default function EnterpriseDashboard() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [autoActions, setAutoActions] = useState<string[]>([]);

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth');
    if (!auth) {
      router.push('/admin');
      return;
    }

    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [router]);

  const fetchDashboard = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/enterprise/dashboard?days=30`
      );

      if (!response.ok) throw new Error('Failed to fetch dashboard');

      const data = await response.json();
      setDashboard(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    router.push('/admin');
  };

  const triggerAction = async (action: string) => {
    try {
      setAutoActions([...autoActions, action]);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/enterprise/actions/${action}`,
        { method: 'POST' }
      );

      if (response.ok) {
        const result = await response.json();
        fetchDashboard();
      }
    } catch (err) {
      console.error(`Error triggering ${action}:`, err);
    } finally {
      setAutoActions(autoActions.filter(a => a !== action));
    }
  };

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-950 to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin">
            <Zap className="w-12 h-12 text-blue-400 mx-auto" />
          </div>
          <p className="text-gray-400">Loading Enterprise Dashboard...</p>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
      </div>
    );
  }

  const systemStatus = dashboard.system?.status === 'healthy' ? 'healthy' : 'warning';

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 to-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-5xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Enterprise Dashboard
            </h1>
            <p className="text-gray-400 mt-2">Complete control over your business operations</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchDashboard}
              disabled={refreshing}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white rounded-lg font-medium flex items-center gap-2 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium flex items-center gap-2 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* System Status Alert */}
        {systemStatus === 'warning' && (
          <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-yellow-400 font-semibold">System Resources High</p>
              <p className="text-yellow-300 text-sm">CPU: {dashboard.system.cpu?.percent ?? 0}% | Memory: {dashboard.system.memory?.percent ?? 0}%</p>
            </div>
          </div>
        )}

        {/* Primary Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Appointments */}
          <MetricCard
            icon={<Clock className="w-6 h-6" />}
            label="Upcoming Appointments"
            value={dashboard.appointments.upcoming ?? 0}
            subtext={`${dashboard.appointments.completed ?? 0} completed`}
            color="blue"
          />

          {/* Revenue */}
          <MetricCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Revenue (30d)"
            value={`$${(dashboard.business_ops.financial?.revenue ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
            subtext={`${dashboard.business_ops.financial?.revenue_count ?? 0} transactions`}
            color="green"
          />

          {/* Payments */}
          <MetricCard
            icon={<Activity className="w-6 h-6" />}
            label="Stripe Transactions"
            value={dashboard.payments.recent_charges ?? 0}
            subtext={`$${(dashboard.payments.total_processed_24h ?? 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}`}
            color="purple"
          />

          {/* System Health */}
          <MetricCard
            icon={<Zap className="w-6 h-6" />}
            label="System Health"
            value={systemStatus === 'healthy' ? '✓ Healthy' : '⚠ Warning'}
            subtext={`${dashboard.system.uptime_hours.toFixed(1)}h uptime`}
            color={systemStatus === 'healthy' ? 'green' : 'yellow'}
          />
        </div>

        {/* Appointments & Business Ops Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Appointments Details */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-400" />
                Appointments
              </h2>
              <Link href="/admin/appointments">
                <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">View All →</button>
              </Link>
            </div>
            <div className="space-y-3">
              <MetricRow label="Total" value={dashboard.appointments.total} />
              <MetricRow label="Upcoming" value={dashboard.appointments.upcoming ?? 0} highlight={true} />
              <MetricRow label="Completed" value={dashboard.appointments.completed ?? 0} />
              <MetricRow label="Conversion Rate" value={`${(dashboard.appointments.conversion_rate ?? 0).toFixed(1)}%`} />
            </div>
          </div>

          {/* Business Ops Details */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-400" />
                Business Ops
              </h2>
              <Link href="/admin/business-ops">
                <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">View All →</button>
              </Link>
            </div>
            <div className="space-y-3">
              <MetricRow
                label="Revenue"
                value={`$${(dashboard.business_ops.financial?.revenue ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
              />
              <MetricRow
                label="Expenses"
                value={`$${(dashboard.business_ops.financial?.expenses ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
              />
              <MetricRow
                label="Profit Margin"
                value={`${(dashboard.business_ops.financial?.profit_margin ?? 0).toFixed(1)}%`}
                highlight={(dashboard.business_ops.financial?.profit_margin ?? 0) > 25}
              />
              <MetricRow label="Active Projects" value={dashboard.business_ops.projects?.active ?? 0} />
            </div>
          </div>
        </div>

        {/* Payments & System Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payments */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Activity className="w-6 h-6 text-purple-400" />
                Stripe Payments
              </h2>
              {dashboard.payments.status === 'connected' && (
                <span className="flex items-center gap-1 text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Connected
                </span>
              )}
            </div>
            {dashboard.payments.status === 'error' ? (
              <p className="text-red-400 text-sm">{dashboard.payments.error}</p>
            ) : (
              <div className="space-y-3">
                <MetricRow label="Recent Charges" value={dashboard.payments.recent_charges ?? 0} />
                <MetricRow
                  label="24h Revenue"
                  value={`$${(dashboard.payments.total_processed_24h ?? 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}`}
                  highlight={true}
                />
                <MetricRow label="Successful Sessions" value={dashboard.payments.successful_sessions ?? 0} />
              </div>
            )}
          </div>

          {/* System Health */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Zap className="w-6 h-6 text-yellow-400" />
                System Health
              </h2>
              <Link href="/admin/system-status">
                <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">Details →</button>
              </Link>
            </div>
            <div className="space-y-3">
              <HealthBar label="CPU" value={dashboard.system.cpu?.percent ?? 0} max={100} />
              <HealthBar label="Memory" value={dashboard.system.memory?.percent ?? 0} max={100} />
              <HealthBar label="Disk" value={dashboard.system.disk?.percent ?? 0} max={100} />
              <MetricRow label="Uptime" value={`${dashboard.system.uptime_hours.toFixed(1)} hours`} />
              <MetricRow label="Platform" value={dashboard.system.platform ?? 'Unknown'} />
            </div>
          </div>
        </div>

        {/* Automation Controls */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-cyan-400" />
            Automation Controls
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionButton
              label="Sync Business Ops"
              description="Sync revenue, expenses, goals"
              action="sync-business-ops"
              isLoading={autoActions.includes('sync-business-ops')}
              onClick={() => triggerAction('sync-business-ops')}
            />
            <ActionButton
              label="Reconcile Payments"
              description="Match Stripe transactions"
              action="reconcile-payments"
              isLoading={autoActions.includes('reconcile-payments')}
              onClick={() => triggerAction('reconcile-payments')}
            />
            <ActionButton
              label="Refresh Scheduler"
              description="Update availability slots"
              action="refresh-scheduler"
              isLoading={autoActions.includes('refresh-scheduler')}
              onClick={() => triggerAction('refresh-scheduler')}
            />
            <ActionButton
              label="Send Reminders"
              description="Email appointment reminders"
              action="send-reminders"
              isLoading={autoActions.includes('send-reminders')}
              onClick={() => triggerAction('send-reminders')}
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickLink href="/admin/scheduler" icon="📅" label="Scheduler" />
          <QuickLink href="/admin/appointments" icon="📋" label="Appointments" />
          <QuickLink href="/admin/business-ops" icon="📊" label="Business Ops" />
          <QuickLink href="/pricing" icon="💳" label="Pricing/Stripe" />
        </div>
      </div>
    </div>
  );
}

// ============================================
// Component Helpers
// ============================================

function MetricCard({
  icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext: string;
  color: 'blue' | 'green' | 'purple' | 'yellow';
}) {
  const colors = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    yellow: 'text-yellow-400',
  };

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 backdrop-blur-sm hover:border-gray-700 transition-all">
      <div className={`${colors[color]} mb-3`}>{icon}</div>
      <p className="text-gray-400 text-sm mb-2">{label}</p>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-gray-500 text-xs">{subtext}</p>
    </div>
  );
}

function MetricRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
      <span className="text-gray-400">{label}</span>
      <span className={`font-semibold ${highlight ? 'text-green-400' : 'text-white'}`}>{value}</span>
    </div>
  );
}

function HealthBar({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const percent = (value / max) * 100;
  const color = percent > 80 ? 'bg-red-500' : percent > 60 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-medium">{value.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function ActionButton({
  label,
  description,
  action,
  isLoading,
  onClick,
}: {
  label: string;
  description: string;
  action: string;
  isLoading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 border border-gray-700 rounded-lg p-4 text-left transition-all group space-y-2"
    >
      <div className="text-white font-semibold group-hover:text-blue-400 transition-colors flex items-center gap-2">
        {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
        {label}
      </div>
      <p className="text-gray-500 text-sm">{description}</p>
    </button>
  );
}

function QuickLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <Link href={href}>
      <button className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg p-4 text-center transition-all group space-y-2 w-full">
        <div className="text-3xl">{icon}</div>
        <div className="text-white font-medium group-hover:text-blue-400 transition-colors text-sm">
          {label}
        </div>
      </button>
    </Link>
  );
}
