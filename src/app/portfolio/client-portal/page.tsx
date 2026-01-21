import Link from "next/link";
import { ArrowLeft, Calendar, CreditCard, FileText, Users, Github } from "lucide-react";
import { Button } from "@/components/ui";

export default function ClientPortalProject() {
  return (
    <div className="min-h-screen bg-matrix-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <Link href="/portfolio" className="inline-flex items-center gap-2 text-matrix-text-secondary hover:text-matrix-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Portfolio
        </Link>

        <div className="mb-16">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium border bg-matrix-primary/10 text-matrix-primary border-matrix-border mb-4">
            Beta Testing
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-matrix-text-primary mb-4 font-mono">
            Client Portal & Booking
          </h1>
          <p className="text-xl text-matrix-text-secondary max-w-3xl mb-6">
            All-in-one project management with scheduling, payments, document sharing, and client communication
          </p>
          <div className="flex gap-4">
            <Button size="lg">
              <Calendar className="w-4 h-4 mr-2" />
              Book Demo
            </Button>
            <Button variant="secondary" size="lg">
              <Github className="w-4 h-4 mr-2" />
              Documentation
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[
            { label: "Active Clients", value: "150+" },
            { label: "Bookings/Month", value: "800+" },
            { label: "Avg Response", value: "< 2min" },
            { label: "Payment Success", value: "99.2%" },
          ].map((stat) => (
            <div key={stat.label} className="p-6 rounded-lg border border-matrix-border/20 bg-matrix-darker">
              <p className="text-matrix-text-secondary text-sm mb-2">{stat.label}</p>
              <p className="text-matrix-text-primary text-2xl font-bold font-mono">{stat.value}</p>
            </div>
          ))}
        </div>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-matrix-text-primary mb-8 font-mono">Project Overview</h2>
          <div className="p-8 rounded-lg border border-matrix-border/20 bg-matrix-darker">
            <p className="text-matrix-text-secondary text-lg leading-relaxed mb-8">
              A comprehensive client management platform for service businesses. Combines appointment scheduling,
              secure payments, document sharing, and project tracking in one seamless experience.
            </p>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                {
                  icon: <Calendar className="w-8 h-8 text-matrix-primary" />,
                  title: "Smart Scheduling",
                  description: "Calendar integration with automated reminders"
                },
                {
                  icon: <CreditCard className="w-8 h-8 text-matrix-primary" />,
                  title: "Secure Payments",
                  description: "Stripe-powered invoicing"
                },
                {
                  icon: <FileText className="w-8 h-8 text-matrix-primary" />,
                  title: "Document Hub",
                  description: "Encrypted file sharing"
                },
                {
                  icon: <Users className="w-8 h-8 text-matrix-primary" />,
                  title: "Client Portal",
                  description: "Branded experience"
                },
              ].map((item) => (
                <div key={item.title} className="flex flex-col items-center text-center p-4 rounded-lg border border-matrix-border/10 bg-matrix-dark hover:border-matrix-border/30 transition-colors">
                  <div className="mb-4 p-4 bg-matrix-primary/10 rounded-xl shadow-matrix">
                    {item.icon}
                  </div>
                  <h3 className="text-matrix-text-primary font-semibold text-base mb-2 font-mono">{item.title}</h3>
                  <p className="text-matrix-text-secondary text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-matrix-text-primary mb-8 font-mono">Technology Stack</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                category: "Frontend",
                technologies: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS"]
              },
              {
                category: "Backend",
                technologies: ["NextAuth.js", "Prisma", "PostgreSQL", "tRPC"]
              },
              {
                category: "Integrations",
                technologies: ["Stripe", "Google Calendar", "SendGrid", "AWS S3"]
              },
            ].map((stack) => (
              <div key={stack.category} className="p-6 rounded-lg border border-matrix-border/20 bg-matrix-darker">
                <h3 className="text-matrix-primary font-semibold mb-4 font-mono">{stack.category}</h3>
                <ul className="space-y-2">
                  {stack.technologies.map((tech) => (
                    <li key={tech} className="flex items-center gap-2 text-matrix-text-secondary text-sm">
                      <span className="text-matrix-primary">▸</span>
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <div className="text-center p-12 rounded-lg border border-matrix-border/20 bg-matrix-darker">
          <h2 className="text-3xl font-bold text-matrix-text-primary mb-4 font-mono">Need a Client Portal?</h2>
          <p className="text-matrix-text-secondary text-lg mb-8 max-w-2xl mx-auto">
            I can build a custom client portal tailored to your business needs.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg">Schedule Consultation</Button>
            </Link>
            <Link href="/portfolio">
              <Button variant="secondary" size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Portfolio
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
