'use client';

import { useState } from 'react';
import { Download, Mail, Printer, Eye, CreditCard } from 'lucide-react';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue';
  clientName: string;
  clientEmail: string;
  amount: number;
  items: InvoiceItem[];
  notes?: string;
}

interface InvoiceViewerProps {
  invoices: Invoice[];
  onPayment?: (invoiceId: string) => Promise<void>;
  onDownload?: (invoiceId: string) => void;
  onEmail?: (invoiceId: string) => Promise<void>;
}

const statusConfig = {
  draft: { label: 'Draft', color: 'gray', bgColor: 'bg-gray-500/10', textColor: 'text-gray-400', borderColor: 'border-gray-500/50' },
  sent: { label: 'Sent', color: 'blue', bgColor: 'bg-blue-500/10', textColor: 'text-blue-400', borderColor: 'border-blue-500/50' },
  viewed: { label: 'Viewed', color: 'cyan', bgColor: 'bg-cyan-500/10', textColor: 'text-cyan-400', borderColor: 'border-cyan-500/50' },
  paid: { label: 'Paid', color: 'emerald', bgColor: 'bg-emerald-500/10', textColor: 'text-emerald-400', borderColor: 'border-emerald-500/50' },
  overdue: { label: 'Overdue', color: 'red', bgColor: 'bg-red-500/10', textColor: 'text-red-400', borderColor: 'border-red-500/50' },
};

export function InvoiceViewer({ invoices, onPayment, onDownload, onEmail }: InvoiceViewerProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(invoices?.[0] || null);
  const [loading, setLoading] = useState<string | null>(null);

  const handlePayment = async (invoiceId: string) => {
    setLoading(invoiceId);
    try {
      if (onPayment) {
        await onPayment(invoiceId);
      }
    } finally {
      setLoading(null);
    }
  };

  const handleEmail = async (invoiceId: string) => {
    setLoading(invoiceId);
    try {
      if (onEmail) {
        await onEmail(invoiceId);
      }
    } finally {
      setLoading(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Your Invoices</h2>
        <p className="text-gray-400">View, pay, and manage your invoices</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Invoice List */}
        <div className="lg:col-span-1 space-y-2">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider px-4 py-2">Recent Invoices</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {invoices.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <p>No invoices yet</p>
              </div>
            ) : (
              invoices.map((invoice) => {
                const status = statusConfig[invoice.status];
                const isSelected = selectedInvoice?.id === invoice.id;

                return (
                  <button
                    key={invoice.id}
                    onClick={() => setSelectedInvoice(invoice)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'bg-blue-500/10 border-blue-500/50'
                        : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="font-medium text-white">{invoice.invoiceNumber}</div>
                      <div className={`text-xs font-semibold px-2 py-1 rounded ${status.bgColor} ${status.textColor}`}>
                        {status.label}
                      </div>
                    </div>
                    <div className="text-sm text-gray-400 mb-1">{invoice.clientName}</div>
                    <div className="text-sm font-semibold text-white">{formatCurrency(invoice.amount)}</div>
                    <div className="text-xs text-gray-500 mt-1">Due {formatDate(invoice.dueDate)}</div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Invoice Details */}
        <div className="lg:col-span-2">
          {selectedInvoice ? (
            <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 border border-gray-800 rounded-xl p-8 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between pb-6 border-b border-gray-800">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Invoice</div>
                  <h3 className="text-2xl font-bold text-white">{selectedInvoice.invoiceNumber}</h3>
                  <div className="mt-3 space-y-1 text-sm text-gray-400">
                    <div>Issued: {formatDate(selectedInvoice.date)}</div>
                    <div>Due: {formatDate(selectedInvoice.dueDate)}</div>
                  </div>
                </div>
                <div className={`text-right`}>
                  <div className={`text-lg font-bold ${statusConfig[selectedInvoice.status].textColor} mb-2`}>
                    {statusConfig[selectedInvoice.status].label}
                  </div>
                  <div className="text-3xl font-bold text-white">{formatCurrency(selectedInvoice.amount)}</div>
                </div>
              </div>

              {/* Client Info */}
              <div className="grid grid-cols-2 gap-6 pb-6 border-b border-gray-800">
                <div>
                  <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">Bill To</div>
                  <div className="text-white font-semibold">{selectedInvoice.clientName}</div>
                  <div className="text-gray-400 text-sm">{selectedInvoice.clientEmail}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">From</div>
                  <div className="text-white font-semibold">Your Business</div>
                  <div className="text-gray-400 text-sm">contact@yourbusiness.com</div>
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-2 pb-6 border-b border-gray-800">
                <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2 text-right">Quantity</div>
                  <div className="col-span-2 text-right">Unit Price</div>
                  <div className="col-span-2 text-right">Amount</div>
                </div>
                {selectedInvoice.items.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 text-sm text-gray-300 py-2 px-2 hover:bg-gray-800/30 rounded">
                    <div className="col-span-6">{item.description}</div>
                    <div className="col-span-2 text-right">{item.quantity}</div>
                    <div className="col-span-2 text-right">{formatCurrency(item.unitPrice)}</div>
                    <div className="col-span-2 text-right font-semibold text-white">{formatCurrency(item.amount)}</div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex justify-end pb-6 border-b border-gray-800">
                <div className="w-40 space-y-2">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>{formatCurrency(selectedInvoice.amount)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-white pt-2 border-t border-gray-700">
                    <span>Total</span>
                    <span>{formatCurrency(selectedInvoice.amount)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedInvoice.notes && (
                <div className="pb-6 border-b border-gray-800">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Notes</div>
                  <p className="text-gray-300 text-sm">{selectedInvoice.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-4">
                {selectedInvoice.status !== 'paid' && (
                  <button
                    onClick={() => handlePayment(selectedInvoice.id)}
                    disabled={loading === selectedInvoice.id}
                    className="flex-1 min-w-40 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    {loading === selectedInvoice.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Pay Now
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={() => onDownload?.(selectedInvoice.id)}
                  className="flex-1 min-w-40 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>

                <button
                  onClick={() => handleEmail(selectedInvoice.id)}
                  disabled={loading === selectedInvoice.id}
                  className="flex-1 min-w-40 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {loading === selectedInvoice.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Email
                    </>
                  )}
                </button>

                <button className="flex-1 min-w-40 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2">
                  <Printer className="w-4 h-4" />
                  Print
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12 text-center">
              <Eye className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Select an invoice to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
