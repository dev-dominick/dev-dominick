import { Container } from '@/components/ui';
import { AppointmentBooker } from "@/components/client/appointment-booker";
import Link from "next/link";

export default function AppointmentsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-black">
      {/* Navigation Breadcrumb */}
      <div className="border-b border-gray-800 bg-black/50 backdrop-blur">
        <Container>
          <div className="py-4">
            <Link href="/" className="text-gray-400 hover:text-gray-300 text-sm transition-colors">
              ← Back to Home
            </Link>
          </div>
        </Container>
      </div>

      {/* Main Content */}
      <Container className="py-20">
        <div className="max-w-2xl mx-auto">
          <AppointmentBooker 
            businessName="Freelance Services"
            availabilityStorageKey="freelance_portfolio_availability"
            appointmentsStorageKey="freelance_portfolio_appointments"
          />
        </div>
      </Container>

      {/* FAQ Section */}
      <Container className="py-16 border-t border-gray-800">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-8">Frequently Asked Questions</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-cyan-400 mb-2">How do I reschedule my appointment?</h4>
              <p className="text-gray-400">Send us an email at least 24 hours before your scheduled appointment time with your new preferred date and time.</p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-cyan-400 mb-2">What if I need to cancel?</h4>
              <p className="text-gray-400">You can cancel up to 24 hours before your appointment by replying to your confirmation email. Cancellations made within 24 hours may incur a fee.</p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-cyan-400 mb-2">Will I receive a confirmation?</h4>
              <p className="text-gray-400">Yes! A confirmation email will be sent to the address you provide with all appointment details and any preparation instructions.</p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-cyan-400 mb-2">What if no times are available?</h4>
              <p className="text-gray-400">Our schedule fills up quickly. Check back soon for new availability, or <Link href="/contact" className="text-blue-400 hover:text-blue-300">contact us</Link> to request a specific date.</p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
