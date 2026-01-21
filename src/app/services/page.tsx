import Link from "next/link";
import { Code, Database, Smartphone, TrendingUp, Shield, Zap } from "lucide-react";

export default function ServicesPage() {
  const services = [
    {
      icon: <Code className="w-8 h-8 text-matrix-primary" />,
      title: "Web Applications",
      description: "Custom Next.js and React applications built for scale and performance",
      features: ["React 19 & Next.js 16", "TypeScript", "Server Components", "SEO Optimized"],
      pricing: "Starting at $5,000"
    },
    {
      icon: <Database className="w-8 h-8 text-matrix-primary" />,
      title: "API Development",
      description: "Robust RESTful and GraphQL APIs with PostgreSQL and authentication",
      features: ["FastAPI / Node.js", "PostgreSQL / MongoDB", "JWT Auth", "Rate Limiting"],
      pricing: "Starting at $3,000"
    },
    {
      icon: <Smartphone className="w-8 h-8 text-matrix-primary" />,
      title: "E-Commerce Solutions",
      description: "Stripe-integrated shops with inventory management and analytics",
      features: ["Stripe Integration", "Cart & Checkout", "Order Management", "Analytics Dashboard"],
      pricing: "Starting at $7,500"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-matrix-primary" />,
      title: "Dashboard & Analytics",
      description: "Real-time data visualization and business intelligence platforms",
      features: ["Real-time Updates", "Custom Charts", "Data Export", "Multi-user Access"],
      pricing: "Starting at $4,000"
    },
    {
      icon: <Shield className="w-8 h-8 text-matrix-primary" />,
      title: "Security & Auth",
      description: "Enterprise-grade authentication and security implementations",
      features: ["NextAuth.js", "OAuth Providers", "2FA Support", "Role-based Access"],
      pricing: "Starting at $2,500"
    },
    {
      icon: <Zap className="w-8 h-8 text-matrix-primary" />,
      title: "Performance Optimization",
      description: "Speed up existing applications with advanced optimization techniques",
      features: ["Code Splitting", "Image Optimization", "Caching Strategy", "Load Testing"],
      pricing: "Starting at $3,500"
    },
  ];

  return (
    <div className="min-h-screen bg-matrix-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-matrix-text-primary mb-4 font-mono">Services</h1>
          <p className="text-xl text-matrix-text-secondary max-w-3xl mx-auto">Professional web development services tailored to your business needs</p>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-4 text-matrix-text-primary font-mono">What I Offer</h2>
          <p className="text-center text-matrix-text-secondary mb-12">Full-stack development services from concept to deployment</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.title} className="p-6 rounded-lg border border-matrix-border/20 bg-matrix-darker hover:border-matrix-border/40 hover:shadow-matrix transition-all duration-300 hover:scale-105">
                <div className="mb-4 p-4 bg-matrix-dark rounded-lg w-fit">
                  {service.icon}
                </div>
                <h3 className="text-matrix-text-primary text-xl mb-2 font-mono font-semibold">{service.title}</h3>
                <p className="text-matrix-text-secondary text-sm leading-relaxed mb-4">{service.description}</p>
                <ul className="space-y-2 mb-4">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-matrix-text-secondary text-sm">
                      <span className="text-matrix-primary mt-0.5">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="pt-4 border-t border-matrix-border/20">
                  <p className="text-matrix-primary font-semibold mb-4 font-mono">{service.pricing}</p>
                  <Link href="/contact" className="inline-flex w-full h-10 items-center justify-center rounded-md bg-matrix-primary text-matrix-black px-4 text-sm font-medium hover:bg-matrix-secondary hover:shadow-matrix transition-all duration-200 font-mono">
                    Get Started
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-4 text-matrix-text-primary font-mono">Development Process</h2>
          <p className="text-center text-matrix-text-secondary mb-12">How I work with clients</p>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Discovery", description: "Understand your goals and requirements" },
              { step: "2", title: "Design", description: "Create wireframes and technical architecture" },
              { step: "3", title: "Development", description: "Build with regular progress updates" },
              { step: "4", title: "Launch", description: "Deploy and provide ongoing support" },
            ].map((phase) => (
              <div key={phase.step} className="p-6 rounded-lg border border-matrix-border/20 bg-matrix-darker text-center">
                <div className="w-12 h-12 bg-matrix-primary rounded-full flex items-center justify-center text-matrix-black font-bold text-xl mx-auto mb-4 font-mono shadow-matrix">
                  {phase.step}
                </div>
                <h3 className="text-matrix-text-primary font-bold mb-2 font-mono">{phase.title}</h3>
                <p className="text-matrix-text-secondary text-sm">{phase.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-16 p-12 rounded-lg border border-matrix-border/20 bg-matrix-darker">
          <h2 className="text-4xl font-bold text-matrix-text-primary mb-4 font-mono">Ready to Start Your Project?</h2>
          <p className="text-matrix-text-secondary text-xl mb-8 max-w-2xl mx-auto">
            Schedule a free consultation to discuss your requirements
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/contact" className="inline-flex h-11 items-center justify-center rounded-md bg-matrix-primary text-matrix-black px-8 text-lg font-medium hover:bg-matrix-secondary hover:shadow-matrix transition-all duration-200 font-mono">
              Schedule Consultation
            </Link>
            <Link href="/pricing" className="inline-flex h-11 items-center justify-center rounded-md bg-matrix-dark text-matrix-text-primary border border-matrix-border px-8 text-lg font-medium hover:bg-matrix-gray hover:shadow-matrix transition-all duration-200 font-mono">
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
