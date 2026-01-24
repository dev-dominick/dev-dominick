import { Container, Button, PageHeader, Section, Card, CardContent } from '@/components/ui';
import Link from "next/link";
import { AlertCircle, MessageSquare } from "lucide-react";

export default function PaymentCancelledPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950">
      <Container className="py-16">
        <PageHeader
          title="Payment Cancelled"
          subtitle="No charges were made to your card"
          backHref="/"
          backLabel="Back to Home"
        />

        <Section>
          <div className="max-w-2xl mx-auto">
            <Card className="bg-linear-to-b from-amber-900/20 to-slate-900 border border-amber-600/30 backdrop-blur-sm">
              <CardContent className="p-12">
                <div className="text-center">
                  <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-6" />
                  <h2 className="text-3xl font-bold text-white mb-4">Payment Cancelled</h2>
                  <p className="text-gray-300 text-lg mb-8">
                    Your payment was cancelled and no charges were made. You can try again anytime or contact us with questions.
                  </p>

                  <div className="bg-gray-900/50 rounded-lg p-8 border border-gray-800 mb-8">
                    <h3 className="text-white font-bold text-lg mb-4">What would you like to do?</h3>
                    <div className="space-y-4">
                      <Link href="/pricing" className="block">
                        <button className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all">
                          Return to Pricing
                        </button>
                      </Link>
                      <Link href="/appointments" className="block">
                        <button className="w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all">
                          Schedule Free Consultation
                        </button>
                      </Link>
                      <a href="mailto:dominick@codeccloud.com" className="block">
                        <button className="w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2">
                          <MessageSquare className="w-5 h-5" />
                          Email Us
                        </button>
                      </a>
                    </div>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
                    <h4 className="text-white font-semibold mb-2">Have questions?</h4>
                    <p className="text-gray-300 text-sm mb-4">
                      We're here to help! Reach out anytime and we'll discuss your project needs.
                    </p>
                    <a 
                      href="mailto:dominick@codeccloud.com" 
                      className="text-blue-400 hover:text-blue-300 font-semibold"
                    >
                      dominick@codeccloud.com
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Section>
      </Container>
    </div>
  );
}
