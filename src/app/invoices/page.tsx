'use client';

import { InvoiceViewer, type Invoice } from '@/components/client/InvoiceViewer';

// Mock invoice data for demo
const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    date: '2024-01-15',
    dueDate: '2024-02-15',
    status: 'paid',
    clientName: 'Acme Corporation',
    clientEmail: 'billing@acme.com',
    amount: 2500,
    items: [
      {
        id: '1',
        description: 'Web Design Service',
        quantity: 1,
        unitPrice: 2000,
        amount: 2000,
      },
      {
        id: '2',
        description: 'Logo Design Revision',
        quantity: 2,
        unitPrice: 250,
        amount: 500,
      },
    ],
    notes: 'Thank you for your business!',
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    date: '2024-01-20',
    dueDate: '2024-02-20',
    status: 'viewed',
    clientName: 'Tech Startup Inc',
    clientEmail: 'finance@techstartup.com',
    amount: 4800,
    items: [
      {
        id: '1',
        description: 'Frontend Development (40 hours)',
        quantity: 40,
        unitPrice: 100,
        amount: 4000,
      },
      {
        id: '2',
        description: 'Testing & QA',
        quantity: 8,
        unitPrice: 100,
        amount: 800,
      },
    ],
    notes: 'Project: E-commerce Platform Phase 1',
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-003',
    date: '2024-01-25',
    dueDate: '2024-02-25',
    status: 'sent',
    clientName: 'Global Marketing Co',
    clientEmail: 'accounts@globalmarketing.com',
    amount: 3200,
    items: [
      {
        id: '1',
        description: 'Social Media Strategy Consultation',
        quantity: 4,
        unitPrice: 500,
        amount: 2000,
      },
      {
        id: '2',
        description: 'Content Creation (12 posts)',
        quantity: 12,
        unitPrice: 100,
        amount: 1200,
      },
    ],
  },
  {
    id: '4',
    invoiceNumber: 'INV-2024-004',
    date: '2024-01-10',
    dueDate: '2024-02-10',
    status: 'overdue',
    clientName: 'Creative Studio LLC',
    clientEmail: 'admin@creativestudio.com',
    amount: 1500,
    items: [
      {
        id: '1',
        description: 'Brand Identity Package',
        quantity: 1,
        unitPrice: 1500,
        amount: 1500,
      },
    ],
    notes: 'Due date has passed. Please arrange payment at your earliest convenience.',
  },
  {
    id: '5',
    invoiceNumber: 'INV-2024-005',
    date: '2024-01-28',
    dueDate: '2024-02-28',
    status: 'draft',
    clientName: 'Enterprise Solutions',
    clientEmail: 'procurement@enterprisesolutions.com',
    amount: 7500,
    items: [
      {
        id: '1',
        description: 'Custom Software Development',
        quantity: 1,
        unitPrice: 5000,
        amount: 5000,
      },
      {
        id: '2',
        description: 'Maintenance & Support (6 months)',
        quantity: 1,
        unitPrice: 2500,
        amount: 2500,
      },
    ],
    notes: 'Draft invoice - awaiting client approval',
  },
];

export default function InvoicesPage() {
  const handlePayment = async (invoiceId: string): Promise<void> => {
    // Simulate Stripe payment flow
    // In a real app, this would redirect to Stripe Checkout
    return new Promise((resolve) => {
      setTimeout(() => {
        alert('Payment flow would redirect to Stripe Checkout');
        resolve();
      }, 1000);
    });
  };

  const handleDownload = (invoiceId: string) => {
    // In a real app, this would generate and download a PDF
    alert('PDF download initiated for invoice: ' + invoiceId);
  };

  const handleEmail = async (invoiceId: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        alert('Invoice emailed to client');
        resolve();
      }, 1500);
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="px-4 py-12 sm:px-6 lg:px-8 border-b border-gray-800">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-2">Invoices</h1>
            <p className="text-gray-400">Manage all your invoices in one place</p>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <InvoiceViewer
              invoices={mockInvoices}
              onPayment={handlePayment}
              onDownload={handleDownload}
              onEmail={handleEmail}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
