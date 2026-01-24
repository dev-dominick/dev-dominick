import { Container } from '@/components/ui';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-950 py-12">
      <Container>
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
            <p className="text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Information We Collect</h2>
              <p>
                When you contact us through our website, we collect information you provide such as your name, 
                email address, and project details. This information is used solely to respond to your inquiry 
                and provide our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Cookies</h2>
              <p>
                We use cookies to improve your browsing experience. These cookies help us understand how you 
                interact with our website and allow us to provide better service. You can choose to disable 
                cookies in your browser settings, though this may affect functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Analytics</h2>
              <p>
                We may use analytics tools to understand website traffic and user behavior. This data is 
                aggregated and does not personally identify individual visitors.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Data Security</h2>
              <p>
                We implement appropriate security measures to protect your personal information. However, 
                no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Contact</h2>
              <p>
                If you have questions about this privacy policy, please contact us at{' '}
                <a href="mailto:privacy@example.com" className="text-blue-400 hover:text-blue-300">
                  privacy@example.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </Container>
    </div>
  );
}
