export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-matrix-black text-matrix-text-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 font-mono">Cookie Policy</h1>
        
        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4 font-mono">What Are Cookies?</h2>
            <p className="text-matrix-text-secondary">
              Cookies are small text files that are placed on your computer or mobile device when you visit our website. They help us remember your preferences and understand how you use our site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 font-mono">How We Use Cookies</h2>
            <p className="text-matrix-text-secondary">
              We use cookies for several purposes:
            </p>
            <ul className="list-disc list-inside text-matrix-text-secondary space-y-2 ml-4">
              <li><strong>Essential Cookies:</strong> Required for authentication, session management, and security</li>
              <li><strong>Performance Cookies:</strong> Help us understand how visitors use our site so we can improve performance</li>
              <li><strong>Preference Cookies:</strong> Remember your choices to personalize your experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 font-mono">Third-Party Cookies</h2>
            <p className="text-matrix-text-secondary">
              We may also allow third-party service providers (such as analytics and payment processors) to set cookies on your device. These cookies are governed by their respective privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 font-mono">Managing Cookies</h2>
            <p className="text-matrix-text-secondary">
              You can control and/or delete cookies as you wish. Most web browsers allow you to refuse cookies or alert you when cookies are being sent. For more information about how to manage cookies in your browser, visit:
            </p>
            <ul className="list-disc list-inside text-matrix-text-secondary space-y-2 ml-4">
              <li><a href="https://support.google.com/chrome/answer/95647" className="text-matrix-primary hover:underline">Chrome</a></li>
              <li><a href="https://support.apple.com/en-us/HT201265" className="text-matrix-primary hover:underline">Safari</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" className="text-matrix-primary hover:underline">Firefox</a></li>
              <li><a href="https://support.microsoft.com/en-us/windows/delete-and-manage-cookies" className="text-matrix-primary hover:underline">Edge</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 font-mono">Session Cookies</h2>
            <p className="text-matrix-text-secondary">
              Our site uses session-based cookies (NextAuth) to maintain your authenticated state. These are automatically deleted when you close your browser.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 font-mono">Changes to This Policy</h2>
            <p className="text-matrix-text-secondary">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by updating the date on this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 font-mono">Contact Us</h2>
            <p className="text-matrix-text-secondary">
              If you have questions about our cookie practices, please contact us at the email address provided on our contact page.
            </p>
          </section>

          <section>
            <p className="text-matrix-text-secondary text-sm mt-12 pt-6 border-t border-matrix-border/30">
              Last updated: January 2026
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
