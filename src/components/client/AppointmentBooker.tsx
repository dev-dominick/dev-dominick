/*
 * Client-facing Appointment Booking Component
 * 
 * Displays admin's availability and lets clients book appointments.
 * Can be reused across all business apps.
 */

'use client';

import { useState, useEffect } from 'react';
import { Calendar } from '@/lib/ui';

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  enabled: boolean;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  date: string;
  time: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

interface AppointmentBookerProps {
  businessName?: string;
  availabilityStorageKey?: string;
  onBookingSubmit?: (appointment: Omit<Appointment, 'id' | 'status'>) => Promise<void>;
  appointmentsStorageKey?: string;
}

export function AppointmentBooker({
  businessName = 'Your Business',
  availabilityStorageKey = 'freelance_portfolio_availability',
  onBookingSubmit,
  appointmentsStorageKey = 'appointments',
}: AppointmentBookerProps) {
  const [availability, setAvailability] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Load admin's availability on mount
  useEffect(() => {
    const saved = localStorage.getItem(availabilityStorageKey);
    if (saved) {
      setAvailability(JSON.parse(saved));
    }
  }, [availabilityStorageKey]);

  // Generate available dates (next 60 days) as Date objects
  const getAvailableDates = (): Date[] => {
    const dates: Date[] = [];
    const dayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (let i = 1; i <= 60; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      date.setHours(0, 0, 0, 0); // Normalize time

      const dayName = dayMap[date.getDay()];
      const isOpen = availability.some(slot => slot.day === dayName && slot.enabled);

      if (isOpen) {
        dates.push(date);
      }
    }

    return dates;
  };

  // Get available times for selected date
  const getAvailableTimes = (): string[] => {
    if (!selectedDate) return [];

    // Parse date string to local Date object correctly
    const [year, month, day] = selectedDate.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
      date.getDay()
    ];

    const slot = availability.find(s => s.day === dayName && s.enabled);
    if (!slot) return [];

    const times: string[] = [];
    const [startH, startM] = slot.startTime.split(':').map(Number);
    const [endH, endM] = slot.endTime.split(':').map(Number);

    for (let h = startH; h <= endH; h++) {
      for (let m = 0; m < 60; m += 30) {
        if (h === endH && m > endM) break;
        if (h === startH && m < startM) continue;

        const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        times.push(time);
      }
    }

    return times;
  };

  const handleDateSelect = (date: Date) => {
    // Convert to local date string to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    setSelectedDate(`${year}-${month}-${day}`);
    setSelectedTime(''); // Reset time when date changes
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create local datetime by combining date and time
      // selectedDate is in YYYY-MM-DD format, selectedTime is HH:MM
      const [year, month, day] = selectedDate.split('-');
      const [hours, minutes] = selectedTime.split(':');

      const localDateTime = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes)
      );

      const appointmentData = {
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        date: localDateTime.toISOString(),
        duration: 60,
        notes: formData.notes || undefined,
      };

      // Call backend API
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/appointments/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to book appointment');
      }

      const result = await response.json();

      setSuccess(true);
      setFormData({ clientName: '', clientEmail: '', notes: '' });
      setSelectedDate('');
      setSelectedTime('');

      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Booking error:', err);
      setError(err instanceof Error ? err.message : 'Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const availableDates = getAvailableDates();
  const availableTimes = getAvailableTimes();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Book an Appointment</h2>
        <p className="text-gray-400">Choose a date and time that works for you</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg">
          ✓ Appointment booked successfully! Check your email for confirmation.
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
          ✗ {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Your Name</label>
          <input
            type="text"
            value={formData.clientName}
            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
            placeholder="John Doe"
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
          <input
            type="email"
            value={formData.clientEmail}
            onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
            placeholder="john@example.com"
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            required
          />
        </div>

        {/* Date Picker - Enterprise Calendar */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">Select Date</label>
          <Calendar
            selectedDate={selectedDate ? new Date(selectedDate.split('-')[0], parseInt(selectedDate.split('-')[1]) - 1, parseInt(selectedDate.split('-')[2])) : null}
            onDateSelect={handleDateSelect}
            availableDates={availableDates}
            className="w-full"
          />
        </div>

        {/* Time Picker */}
        {selectedDate && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Select Time
              <span className="ml-2 text-xs text-gray-500">
                {new Date(selectedDate.split('-')[0], parseInt(selectedDate.split('-')[1]) - 1, parseInt(selectedDate.split('-')[2])).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {availableTimes.map((time) => {
                const [hours, minutes] = time.split(':');
                const hour = parseInt(hours);
                const period = hour >= 12 ? 'PM' : 'AM';
                const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                const displayTime = `${displayHour}:${minutes} ${period}`;

                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${selectedTime === time
                      ? 'bg-blue-600 text-white ring-2 ring-blue-500'
                      : 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-blue-500 hover:bg-gray-750'
                      }`}
                  >
                    {displayTime}
                  </button>
                );
              })}
            </div>
            {availableTimes.length === 0 && (
              <p className="text-gray-400 text-sm">No available time slots for this date</p>
            )}
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Notes (Optional)</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Tell us about your project or needs..."
            rows={4}
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!selectedDate || !selectedTime || loading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all duration-300"
        >
          {loading ? 'Booking...' : 'Confirm Appointment'}
        </button>
      </form>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/50 rounded-xl p-6">
        <h3 className="text-blue-400 font-semibold mb-2">📅 How it works</h3>
        <ul className="text-gray-300 text-sm space-y-2">
          <li>✓ Select an available date from the calendar</li>
          <li>✓ Choose your preferred time slot</li>
          <li>✓ Enter your contact information</li>
          <li>✓ We'll send a confirmation to your email</li>
        </ul>
      </div>
    </div>
  );
}
