import { Container } from '@/lib/ui';
import { Card } from '@/lib/ui';
import { Button } from '@/lib/ui';
import Link from "next/link";

export default function NonnaRosaProject() {
  return (
    <div className="min-h-screen bg-slate-950 py-12">
      <Container>
        {/* Header */}
        <div className="mb-8">
          <Link href="/portfolio" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
            ← Back to Portfolio
          </Link>
          <h1 className="text-4xl font-bold text-white mb-4">Nonna Rosa Restaurant</h1>
          <p className="text-xl text-gray-400">
            Modern website redesign for Italian restaurant with online ordering and delivery tracking
          </p>
        </div>

        {/* Live Demo Link */}
        <div className="mb-8">
          <Link href="/demo/nonna-rosa" target="_blank">
            <Button className="bg-blue-600 hover:bg-blue-700">
              View Live Demo →
            </Button>
          </Link>
        </div>

        {/* Overview */}
        <Card className="mb-8 p-8 bg-slate-900 border-slate-800">
          <h2 className="text-2xl font-bold text-white mb-4">Project Overview</h2>
          <p className="text-gray-300 mb-4">
            Nonna Rosa Restaurant needed a modern, mobile-responsive website to replace their existing site. 
            The new platform features online ordering, real-time delivery tracking, and a streamlined menu 
            presentation that highlights their authentic Italian cuisine.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div>
              <p className="text-gray-500 text-sm">Client</p>
              <p className="text-white font-semibold">Nonna Rosa</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Type</p>
              <p className="text-white font-semibold">Restaurant Website</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Timeline</p>
              <p className="text-white font-semibold">2 weeks</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Status</p>
              <p className="text-green-400 font-semibold">In Progress</p>
            </div>
          </div>
        </Card>

        {/* Tech Stack */}
        <Card className="mb-8 p-8 bg-slate-900 border-slate-800">
          <h2 className="text-2xl font-bold text-white mb-4">Technology Stack</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-800 rounded-lg">
              <p className="text-white font-semibold">Next.js 16</p>
              <p className="text-sm text-gray-400">React framework</p>
            </div>
            <div className="p-4 bg-slate-800 rounded-lg">
              <p className="text-white font-semibold">TypeScript</p>
              <p className="text-sm text-gray-400">Type safety</p>
            </div>
            <div className="p-4 bg-slate-800 rounded-lg">
              <p className="text-white font-semibold">Tailwind CSS</p>
              <p className="text-sm text-gray-400">Styling</p>
            </div>
            <div className="p-4 bg-slate-800 rounded-lg">
              <p className="text-white font-semibold">Stripe</p>
              <p className="text-sm text-gray-400">Payment processing</p>
            </div>
            <div className="p-4 bg-slate-800 rounded-lg">
              <p className="text-white font-semibold">Vercel</p>
              <p className="text-sm text-gray-400">Deployment</p>
            </div>
            <div className="p-4 bg-slate-800 rounded-lg">
              <p className="text-white font-semibold">Prisma</p>
              <p className="text-sm text-gray-400">Database ORM</p>
            </div>
          </div>
        </Card>

        {/* Key Features */}
        <Card className="mb-8 p-8 bg-slate-900 border-slate-800">
          <h2 className="text-2xl font-bold text-white mb-6">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">🍕 Online Ordering</h3>
              <p className="text-gray-400">
                Integrated ordering system with real-time menu updates, cart management, and checkout flow
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">📍 Delivery Tracking</h3>
              <p className="text-gray-400">
                Live order tracking with SMS/email notifications and estimated delivery times
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">📱 Mobile-First Design</h3>
              <p className="text-gray-400">
                Fully responsive design optimized for smartphones and tablets
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">🎨 Custom Branding</h3>
              <p className="text-gray-400">
                Italian-inspired color palette and typography that reflects authentic cuisine
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">💳 Secure Payments</h3>
              <p className="text-gray-400">
                Stripe integration for credit cards, Apple Pay, and Google Pay
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">⚡ Fast Performance</h3>
              <p className="text-gray-400">
                Optimized images, lazy loading, and CDN delivery for instant page loads
              </p>
            </div>
          </div>
        </Card>

        {/* Results */}
        <Card className="p-8 bg-slate-900 border-slate-800">
          <h2 className="text-2xl font-bold text-white mb-4">Expected Results</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-400">100%</p>
              <p className="text-gray-400 mt-2">Mobile Responsive</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-green-400">&lt;2s</p>
              <p className="text-gray-400 mt-2">Page Load Time</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-purple-400">10mi</p>
              <p className="text-gray-400 mt-2">Delivery Radius</p>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
}
