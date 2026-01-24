import { Container, Button, PageHeader, Section, Card, CardContent } from '@/components/ui';
import Link from "next/link";
import { CheckCircle, Mail, Calendar } from "lucide-react";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950">
      <Container className="py-16">
        <PageHeader
          title="Payment Successful"
          subtitle="Thank you for choosing Code Cloud"
          backHref="/"
          backLabel="Back to Home"
        />

        <Section>
          <div className="max-w-2xl mx-auto">
            <Card className="bg-linear-to-b from-emerald-900/30 to-slate-900 border border-emerald-500/50 backdrop-blur-sm">
              <CardContent className="p-12">
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
                  <h2 className="text-3xl font-bold text-white mb-4">Payment Confirmed!</h2>
                  <p className="text-gray-300 text-lg mb-8">
                    Your project is on our radar. Here's what happens next:
                  </p>

                  <div className="space-y-6">
                    {/* Step 1 */}
                    <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold">
                          1
                        </div>
                        <div className="text-left">
                          <h3 className="text-white font-bold mb-1">Invoice Sent</h3>
                          <p className="text-gray-400 text-sm">
                            You'll receive a receipt and invoice via email within minutes
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold">
                          2
                        </div>
                        <div className="text-left">
                          <h3 className="text-white font-bold mb-1">Consultation Call</h3>
                          <p className="text-gray-400 text-sm">
                            We'll reach out to schedule a project kickoff meeting (usually within 24 hours)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold">
                          3
                        </div>
                        <div className="text-left">
                          <h3 className="text-white font-bold mb-1">Project Kickoff</h3>
                          <p className="text-gray-400 text-sm">
                            We'll create your project timeline, agree on requirements, and get started!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 space-y-4">
                    <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <Mail className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                        <div className="text-left">
                          <h4 className="text-white font-semibold mb-1">Check Your Email</h4>
                          <p className="text-gray-300 text-sm">
                            We'll send you a receipt and next steps instructions
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-6">
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                        <div className="text-left">
                          <h4 className="text-white font-semibold mb-1">Questions?</h4>
                          <p className="text-gray-300 text-sm">
                            Contact us anytime at <a href="mailto:dominick@codeccloud.com" className="text-blue-400 hover:text-blue-300">dominick@codeccloud.com</a>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 space-y-3">
                    <Link href="/">
                      <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6">
                        Back to Home
                      </Button>
                    </Link>
                    <Link href="/appointments">
                      <Button 
                        size="lg" 
                        variant="outline"
                        className="w-full text-white border-gray-700 hover:bg-gray-800"
                      >
                        Schedule Consultation
                      </Button>
                    </Link>
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
