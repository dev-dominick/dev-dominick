import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { Button } from '@/components/ui';
import { SIMPLE_CONSULTING_MODE } from '@/lib/config/flags'

export default function PortfolioPage() {
  if (SIMPLE_CONSULTING_MODE) {
    redirect('/')
  }

  const projects = [
    {
      name: "Nonna Rosa Restaurant",
      description: "Modern restaurant website with online ordering, delivery tracking, and mobile-responsive design",
      tech: ["Next.js 16", "TypeScript", "Tailwind CSS", "Stripe", "Prisma"],
      features: ["Online ordering", "Real-time delivery tracking", "Mobile-first design", "Secure payments"],
      link: "/portfolio/nonna-rosa-restaurant",
      status: "Live & In Production",
      statusColor: "bg-matrix-primary/10 text-matrix-primary border-matrix-border",
      icon: "🍝",
      metric: "+340% Orders",
      disabled: true,
    },
    {
      name: "Financial Analytics Dashboard",
      description: "Multi-portfolio tracking with tax reporting, rebalancing, and investment insights",
      tech: ["Next.js", "Prisma", "PostgreSQL", "Chart.js"],
      features: ["Portfolio aggregation", "Tax loss harvesting", "Performance analytics", "Real-time data"],
      link: "/portfolio/financial-analytics",
      status: "In Development",
      statusColor: "bg-matrix-primary/10 text-matrix-primary border-matrix-border",
      icon: "📊",
      metric: "15+ Portfolios"
    },
    {
      name: "Client Portal & Booking",
      description: "Project management system with scheduling, payments, and client communication",
      tech: ["Next.js", "NextAuth", "Stripe", "Plaid"],
      features: ["Appointment scheduling", "Secure payments", "Document sharing", "Client messaging"],
      link: "/portfolio/client-portal",
      status: "Beta Testing",
      statusColor: "bg-matrix-primary/10 text-matrix-primary border-matrix-border",
      icon: "📅",
      metric: "800+ Bookings"
    },
  ];

  return (
    <div className="min-h-screen bg-matrix-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-matrix-text-primary mb-4 font-mono">Portfolio</h1>
          <p className="text-xl text-matrix-text-secondary max-w-3xl mx-auto">A curated collection of enterprise-level projects showcasing modern web development, AI automation, and data analytics</p>
        </div>

        <div className="grid grid-cols-1 gap-10 mt-12">
          {projects.filter(p => !p.disabled).map((project) => (
            <div
              key={project.name}
              className="group p-8 rounded-lg border border-matrix-border/20 bg-matrix-darker hover:border-matrix-primary/40 hover:shadow-matrix-lg transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-linear-to-br from-matrix-primary/5 via-transparent to-matrix-primary/5 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="flex items-start justify-between gap-8 mb-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-5 mb-4">
                      <span className="text-5xl">{project.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <h3 className="text-3xl text-matrix-text-primary font-bold group-hover:text-matrix-primary transition-colors font-mono">
                            {project.name}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${project.statusColor}`}>
                            {project.status}
                          </span>
                        </div>
                        <p className="text-matrix-text-secondary text-lg leading-relaxed">{project.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-6">
                    <div className="text-right px-6 py-3 border border-matrix-border rounded-lg bg-matrix-primary/10">
                      <div className="text-3xl font-bold text-matrix-primary mb-1 font-mono">{project.metric}</div>
                      <div className="text-matrix-text-secondary text-sm uppercase tracking-wider">Performance</div>
                    </div>
                    <Link href={project.link}>
                      <Button size="lg">
                        View Details
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="space-y-8 pt-8 border-t border-matrix-border/20">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-matrix-primary mb-4 uppercase tracking-wider font-mono">
                      <Sparkles className="w-5 h-5" />
                      <span>Tech Stack</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {project.tech.map((tech) => (
                        <span
                          key={tech}
                          className="border border-matrix-border/50 text-matrix-text-primary hover:bg-matrix-primary/20 hover:border-matrix-primary transition-all px-4 py-2 text-sm font-medium rounded-md"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-matrix-primary mb-4 uppercase tracking-wider font-mono">Key Features</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {project.features.map((feature) => (
                        <div
                          key={feature}
                          className="flex items-start gap-2 text-matrix-text-primary text-sm bg-matrix-primary/10 border border-matrix-border/30 px-4 py-3 rounded-lg hover:border-matrix-primary transition-colors"
                        >
                          <span className="text-matrix-primary mt-0.5 text-base font-bold">✓</span>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-20 p-16 bg-matrix-darker border border-matrix-border/20 rounded-2xl shadow-matrix-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-matrix-primary/10 via-transparent to-matrix-primary/5" />
          <h2 className="text-4xl font-bold text-matrix-text-primary mb-6 relative z-10 font-mono">Ready to Build Something Amazing?</h2>
          <p className="text-matrix-text-secondary text-xl mb-10 max-w-2xl mx-auto relative z-10">
            Let&apos;s transform your vision into a high-performance, scalable solution
          </p>
          <Link href="/contact">
            <Button size="lg" className="relative z-10">
              Start Your Project
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
