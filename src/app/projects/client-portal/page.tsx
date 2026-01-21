import { Container, Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/lib/ui';
import Link from "next/link";

export default function ClientPortalPage() {
  return (
    <div className="min-h-screen bg-slate-950 py-12">
      <Container>
        <Link href="/#portfolio" className="text-blue-400 hover:text-blue-300 mb-8 inline-block">
          ← Back to Portfolio
        </Link>

        <div className="space-y-8">
          <div>
            <h1 className="text-5xl font-bold text-white mb-4">Client Portal & Booking System</h1>
            <p className="text-xl text-gray-400">Project management with scheduling and secure payments</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {["Next.js", "NextAuth", "Stripe", "Plaid", "PostgreSQL", "Prisma", "TailwindCSS"].map((tech) => (
                <Badge key={tech} variant="outline" className="border-blue-500/50 text-blue-400">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Project Overview</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <p>
                A full-featured client portal enabling appointment scheduling, project tracking, secure payments, and document sharing for service-based businesses.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Key Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  Calendar-based appointment scheduling
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  Stripe integration for secure payments
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  Plaid bank account linking
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  Document upload and sharing
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  Real-time notifications via email
                </li>
              </ul>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Link href="#contact">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Discuss Similar Project
              </Button>
            </Link>
            <Link href="/#portfolio">
              <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                View More Projects
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
