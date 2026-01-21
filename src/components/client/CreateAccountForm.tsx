'use client';

import { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';

export interface CreateAccountFormData {
  name: string;
  email: string;
  businessName: string;
  businessType: string;
  message?: string;
}

interface CreateAccountFormProps {
  onSubmit?: (data: CreateAccountFormData) => Promise<void>;
  businessTypes?: string[];
}

export function CreateAccountForm({
  onSubmit,
  businessTypes = ['Service', 'Restaurant', 'Retail', 'Salon', 'Consulting', 'Other'],
}: CreateAccountFormProps) {
  const [formData, setFormData] = useState<CreateAccountFormData>({
    name: '',
    email: '',
    businessName: '',
    businessType: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Default: log to console
      }

      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        businessName: '',
        businessType: '',
        message: '',
      });

      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Get Started Today</h2>
        <p className="text-gray-400">Create an account to manage your business and invoices</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-emerald-400 font-semibold">Account request sent!</h3>
            <p className="text-emerald-300/80 text-sm mt-1">We&apos;ll contact you within 24 hours to activate your account.</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
          <p className="text-red-400 font-semibold">Error</p>
          <p className="text-red-300/80 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5 bg-gray-900/50 border border-gray-800 rounded-xl p-8 backdrop-blur-sm">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Your Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Doe"
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Email Address *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="john@example.com"
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            required
          />
        </div>

        {/* Business Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Business Name *</label>
          <input
            type="text"
            value={formData.businessName}
            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
            placeholder="Your Business"
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            required
          />
        </div>

        {/* Business Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Business Type *</label>
          <select
            value={formData.businessType}
            onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            required
          >
            <option value="">Select a business type...</option>
            {businessTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Additional Information</label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Tell us about your business and any special requirements..."
            rows={4}
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !formData.name || !formData.email || !formData.businessName || !formData.businessType}
          className="w-full bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating Account...
            </>
          ) : (
            <>
              <Mail className="w-5 h-5" />
              Create Account
            </>
          )}
        </button>
      </form>

      {/* Benefits */}
      <div className="grid md:grid-cols-3 gap-4 mt-8">
        <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4">
          <div className="text-blue-400 font-semibold mb-2">📧 Professional Invoices</div>
          <p className="text-gray-300 text-sm">Create and send branded invoices to your clients</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-lg p-4">
          <div className="text-emerald-400 font-semibold mb-2">💳 Online Payments</div>
          <p className="text-gray-300 text-sm">Accept payments directly from your invoices</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/50 rounded-lg p-4">
          <div className="text-purple-400 font-semibold mb-2">📊 Business Analytics</div>
          <p className="text-gray-300 text-sm">Track your income and business performance</p>
        </div>
      </div>
    </div>
  );
}
