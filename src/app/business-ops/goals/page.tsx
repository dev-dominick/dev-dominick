'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdminAuth, useBusinessData, useBusinessForm, useModal } from '@/lib/hooks';
import { formatters } from '@/lib/utils';
import { DataView, FormError } from '@/components/admin';

interface Goal {
  id: string;
  type: string;
  name: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  status: string;
  priority: string;
  category?: string;
  progressPercent: number;
}

export default function GoalsPage() {
  useAdminAuth();
  const { isOpen: showForm, open, close } = useModal();
  const [filter, setFilter] = useState('all');

  const { data: goalsData, loading, refetch } = useBusinessData<{ goals: Goal[] }>({
    endpoint: filter !== 'all' ? `goals?status=${filter}` : 'goals',
  });

  const {
    formData,
    handleChange,
    handleSubmit: onSubmit,
    loading: submitting,
    error,
  } = useBusinessForm({
    endpoint: 'goals',
    initialValues: {
      type: 'revenue',
      name: '',
      description: '',
      targetValue: '',
      currentValue: '0',
      unit: 'USD',
      timeframe: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      priority: 'medium',
      category: 'financial',
    },
    dataTransform: (data) => ({
      ...data,
      targetValue: parseFloat(data.targetValue),
      currentValue: parseFloat(data.currentValue),
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
    }),
    onSuccess: () => {
      alert('Goal created successfully!');
      close();
      refetch();
    },
  });

  const goals = goalsData?.goals || [];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'green',
      in_progress: 'blue',
      at_risk: 'yellow',
      failed: 'red',
      achieved: 'green',
      missed: 'red',
    };
    return colors[status] || 'gray';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      critical: 'red',
      high: 'orange',
      medium: 'yellow',
      low: 'blue',
    };
    return colors[priority] || 'gray';
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 to-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Business Goals</h1>
            <p className="text-gray-400">Track and achieve your business objectives</p>
          </div>
          <button
            onClick={open}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-all"
          >
            + New Goal
          </button>
        </div>

        <div className="mb-6 flex gap-2 flex-wrap">
          {['all', 'in_progress', 'at_risk', 'achieved', 'missed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg transition-all ${filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
            >
              {status.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>

        {showForm && (
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Goal</h2>
            <FormError error={error} />
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Goal Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter goal name"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    required
                    disabled={submitting}
                  >
                    <option value="revenue">Revenue</option>
                    <option value="profit">Profit</option>
                    <option value="clients">Clients</option>
                    <option value="projects">Projects</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Target Value *</label>
                  <input
                    type="number"
                    name="targetValue"
                    value={formData.targetValue}
                    onChange={handleChange}
                    placeholder="Enter target value"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Current Value</label>
                  <input
                    type="number"
                    name="currentValue"
                    value={formData.currentValue}
                    onChange={handleChange}
                    placeholder="Enter current value"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Timeframe</label>
                  <select
                    name="timeframe"
                    value={formData.timeframe}
                    onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    disabled={submitting}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    disabled={submitting}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    placeholder="Select start date"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">End Date *</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    placeholder="Select end date"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Add optional description"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  disabled={submitting}
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={close}
                  className="px-6 py-2 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-all"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-all disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Your Goals</h2>

          <DataView
            data={goals}
            loading={loading}
            error=""
            emptyMessage="No goals found. Create your first goal to get started!"
          >
            {(goal) => (
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-white">{goal.name}</h3>
                    {goal.description && (
                      <p className="text-gray-400 text-sm mt-1">{goal.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${getPriorityColor(goal.priority)}-500/20 text-${getPriorityColor(goal.priority)}-400`}>
                      {goal.priority}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${getStatusColor(goal.status)}-500/20 text-${getStatusColor(goal.status)}-400`}>
                      {goal.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white font-medium">{formatters.percent(goal.progressPercent / 100)}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(goal.progressPercent, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Current</div>
                    <div className="text-white font-medium">
                      {goal.unit === 'USD' ? formatters.currency(goal.currentValue) : `${goal.currentValue} ${goal.unit}`}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Target</div>
                    <div className="text-white font-medium">
                      {goal.unit === 'USD' ? formatters.currency(goal.targetValue) : `${goal.targetValue} ${goal.unit}`}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Timeframe</div>
                    <div className="text-white font-medium capitalize">{goal.timeframe}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">End Date</div>
                    <div className="text-white font-medium">{formatters.date(goal.endDate)}</div>
                  </div>
                </div>
              </div>
            )}
          </DataView>
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
