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
      // Save contact message
      const contactResponse = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: '',
          subject: formData.projectType || 'Website Inquiry',
          message: `Project: ${formData.projectType}\nBudget: ${formData.budget}\n\n${formData.message}`,
        }),
      });

      if (!contactResponse.ok) {
        throw new Error('Failed to submit contact form');
      }

      // If booking a call, create appointment
      if (formData.bookCall && formData.preferredDate && formData.preferredTime) {
        const appointmentResponse = await fetch('/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: formData.preferredDate,
            time: formData.preferredTime,
            name: formData.name,
            email: formData.email,
            notes: `Project: ${formData.projectType}, Budget: ${formData.budget}`,
          }),
        });

        if (!appointmentResponse.ok) {
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
    <div className="min-h-screen bg-neutral-950 pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-neutral-50 mb-4">Get in Touch</h1>
          <p className="text-xl text-neutral-400 max-w-3xl mx-auto">Have questions about our services? Need help choosing the right solution? Let's talk.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2 p-8 rounded-2xl border border-neutral-800 bg-neutral-900 shadow-lg">
            <h2 className="text-2xl font-bold text-neutral-50 mb-6">Send a Message</h2>

            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-sky-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-neutral-50 mb-2">Message Sent!</h3>
                <p className="text-neutral-400">I'll get back to you within 24 hours.</p>
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
                    <label className="block text-sm font-medium text-neutral-400 mb-1.5">Project Type</label>
                    <select
                      name="projectType"
                      value={formData.projectType}
                      onChange={handleChange}
                      title="Project type"
                      className="w-full h-10 px-4 rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-50 focus:outline-none focus:border-sky-400 transition-all"
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
                    <label className="block text-sm font-medium text-neutral-400 mb-1.5">Budget Range</label>
                    <select
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      title="Budget range"
                      className="w-full h-10 px-4 rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-50 focus:outline-none focus:border-sky-400 transition-all"
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
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">Tell me about your project *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Describe your project goals, timeline, and any specific requirements..."
                    className="w-full px-4 py-3 rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-50 placeholder:text-neutral-500 focus:outline-none focus:border-sky-400 transition-all resize-none"
                  />
                </div>

                <div className="border-t border-neutral-700 pt-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="bookCall"
                      checked={formData.bookCall}
                      onChange={(e) => setFormData({ ...formData, bookCall: e.target.checked })}
                      className="w-5 h-5 rounded bg-neutral-800 border-neutral-600 text-sky-400 focus:ring-2 focus:ring-sky-400/20"
                    />
                    <span className="text-neutral-400">I'd like to schedule a consultation call</span>
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
            <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-sky-500/10 rounded-lg">
                  <Mail className="w-5 h-5 text-neutral-400" />
                </div>
                <div>
                  <h3 className="text-neutral-50 font-semibold mb-1">Email</h3>
                  <a href="mailto:dom@dev-dominick.com" className="text-neutral-400 hover:text-sky-400 transition-colors">
                    dom@dev-dominick.com
                  </a>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-sky-500/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-neutral-400" />
                </div>
                <div>
                  <h3 className="text-neutral-50 font-semibold mb-1">Availability</h3>
                  <p className="text-neutral-400 text-sm">Mon - Fri: 9 AM - 6 PM EST</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-sky-500/10 rounded-lg">
                  <Clock className="w-5 h-5 text-neutral-400" />
                </div>
                <div>
                  <h3 className="text-neutral-50 font-semibold mb-1">Response Time</h3>
                  <p className="text-neutral-400 text-sm">Usually within 24 hours</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900 space-y-4">
              <h3 className="text-lg font-bold text-neutral-50">FAQ</h3>
              <div>
                <h4 className="text-neutral-50 font-semibold mb-2">How long does a project take?</h4>
                <p className="text-neutral-400 text-sm">Typically 2-8 weeks depending on complexity.</p>
              </div>
              <div>
                <h4 className="text-neutral-50 font-semibold mb-2">Do you offer support?</h4>
                <p className="text-neutral-400 text-sm">Yes, all packages include post-launch support.</p>
              </div>
              <div>
                <h4 className="text-neutral-50 font-semibold mb-2">Can you work with my team?</h4>
                <p className="text-neutral-400 text-sm">Absolutely! I collaborate with designers and developers.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

