'use client';

import { Input, Button } from '@/components/ui';
import { Mail, Calendar, Clock } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: '',
    budget: '',
    message: '',
    bookCall: false,
    preferredDate: '',
    preferredTime: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // If booking a call, create appointment
      if (formData.bookCall && formData.preferredDate && formData.preferredTime) {
        const response = await fetch('/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: formData.preferredDate,
            time: formData.preferredTime,
            name: formData.name,
            email: formData.email,
            phone: '',
            notes: `Project: ${formData.projectType}, Budget: ${formData.budget}\n\n${formData.message}`,
            service: formData.projectType
          })
        });

        if (!response.ok) {
          throw new Error('Failed to book appointment');
        }
      }

      setSubmitted(true);

      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          name: '',
          email: '',
          projectType: '',
          budget: '',
          message: '',
          bookCall: false,
          preferredDate: '',
          preferredTime: '',
        });
      }, 3000);
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Failed to submit. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div className="min-h-screen bg-matrix-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-matrix-text-primary mb-4 font-mono">Contact</h1>
          <p className="text-xl text-matrix-text-secondary max-w-3xl mx-auto">Let's discuss your project and see how I can help</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2 p-8 rounded-lg border border-matrix-border/20 bg-matrix-darker">
            <h2 className="text-2xl font-bold text-matrix-text-primary mb-6 font-mono">Send a Message</h2>

            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-matrix-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 shadow-matrix">
                  <svg className="w-8 h-8 text-matrix-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-matrix-text-primary mb-2 font-mono">Message Sent!</h3>
                <p className="text-matrix-text-secondary">I'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="Your Name *"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                  />
                  <Input
                    label="Email Address *"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-matrix-text-secondary mb-1.5 font-mono">Project Type</label>
                    <select
                      name="projectType"
                      value={formData.projectType}
                      onChange={handleChange}
                      className="w-full h-10 px-4 rounded-md border border-matrix-border/30 bg-matrix-dark text-matrix-text-primary focus:outline-none focus:ring-2 focus:ring-matrix-border focus:border-matrix-primary transition-all duration-200 font-mono"
                    >
                      <option value="">Select a project type</option>
                      <option value="web-app">Web Application</option>
                      <option value="ecommerce">E-Commerce</option>
                      <option value="api">API Development</option>
                      <option value="dashboard">Dashboard/Analytics</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-matrix-text-secondary mb-1.5 font-mono">Budget Range</label>
                    <select
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className="w-full h-10 px-4 rounded-md border border-matrix-border/30 bg-matrix-dark text-matrix-text-primary focus:outline-none focus:ring-2 focus:ring-matrix-border focus:border-matrix-primary transition-all duration-200 font-mono"
                    >
                      <option value="">Select your budget</option>
                      <option value="under-5k">Under $5,000</option>
                      <option value="5k-10k">$5,000 - $10,000</option>
                      <option value="10k-25k">$10,000 - $25,000</option>
                      <option value="25k-plus">$25,000+</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-matrix-text-secondary mb-1.5 font-mono">Tell me about your project *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Describe your project goals, timeline, and any specific requirements..."
                    className="w-full px-4 py-3 rounded-md border border-matrix-border/30 bg-matrix-dark text-matrix-text-primary placeholder:text-matrix-text-muted focus:outline-none focus:ring-2 focus:ring-matrix-border focus:border-matrix-primary transition-all duration-200 font-mono resize-none"
                  />
                </div>

                <div className="border-t border-matrix-border/20 pt-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="bookCall"
                      checked={formData.bookCall}
                      onChange={(e) => setFormData({ ...formData, bookCall: e.target.checked })}
                      className="w-5 h-5 rounded bg-matrix-dark border-matrix-border text-matrix-primary focus:ring-2 focus:ring-matrix-border"
                    />
                    <span className="text-matrix-text-secondary font-mono">I'd like to schedule a consultation call</span>
                  </label>

                  {formData.bookCall && (
                    <div className="mt-4 grid md:grid-cols-2 gap-4 pl-8">
                      <Input
                        label="Preferred Date"
                        type="date"
                        name="preferredDate"
                        value={formData.preferredDate}
                        onChange={handleChange}
                      />
                      <Input
                        label="Preferred Time"
                        type="time"
                        name="preferredTime"
                        value={formData.preferredTime}
                        onChange={handleChange}
                      />
                    </div>
                  )}
                </div>

                <Button type="submit" size="lg" className="w-full">
                  Send Message
                </Button>
              </form>
            )}
          </div>

          {/* Contact Info Sidebar */}
          <div className="space-y-6">
            <div className="p-6 rounded-lg border border-matrix-border/20 bg-matrix-darker">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-matrix-primary/10 rounded-lg">
                  <Mail className="w-5 h-5 text-matrix-primary" />
                </div>
                <div>
                  <h3 className="text-matrix-text-primary font-semibold mb-1 font-mono">Email</h3>
                  <a href="mailto:dom@dev-dominick.com" className="text-matrix-text-secondary hover:text-matrix-primary transition-colors">
                    dom@dev-dominick.com
                  </a>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg border border-matrix-border/20 bg-matrix-darker">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-matrix-primary/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-matrix-primary" />
                </div>
                <div>
                  <h3 className="text-matrix-text-primary font-semibold mb-1 font-mono">Availability</h3>
                  <p className="text-matrix-text-secondary text-sm">Mon - Fri: 9 AM - 6 PM EST</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg border border-matrix-border/20 bg-matrix-darker">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-matrix-primary/10 rounded-lg">
                  <Clock className="w-5 h-5 text-matrix-primary" />
                </div>
                <div>
                  <h3 className="text-matrix-text-primary font-semibold mb-1 font-mono">Response Time</h3>
                  <p className="text-matrix-text-secondary text-sm">Usually within 24 hours</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg border border-matrix-border/20 bg-matrix-darker space-y-4">
              <h3 className="text-lg font-bold text-matrix-text-primary font-mono">FAQ</h3>
              <div>
                <h4 className="text-matrix-text-primary font-semibold mb-2 font-mono">How long does a project take?</h4>
                <p className="text-matrix-text-secondary text-sm">Typically 2-8 weeks depending on complexity.</p>
              </div>
              <div>
                <h4 className="text-matrix-text-primary font-semibold mb-2 font-mono">Do you offer support?</h4>
                <p className="text-matrix-text-secondary text-sm">Yes, all packages include post-launch support.</p>
              </div>
              <div>
                <h4 className="text-matrix-text-primary font-semibold mb-2 font-mono">Can you work with my team?</h4>
                <p className="text-matrix-text-secondary text-sm">Absolutely! I collaborate with designers and developers.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

