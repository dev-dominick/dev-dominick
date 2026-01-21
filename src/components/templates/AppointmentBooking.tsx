'use client';

import { useState } from 'react';
import { Calendar, Clock, Check, X } from 'lucide-react';

export interface TimeSlot {
    id: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
    available: boolean;
    duration?: number; // minutes
}

interface AppointmentBookingProps {
    availableSlots: TimeSlot[];
    onBookAppointment: (slot: TimeSlot, contactInfo: {
        name: string;
        email: string;
        phone: string;
        notes: string;
    }) => Promise<void>;
    services?: { name: string; duration: number; price?: number }[];
    className?: string;
}

export default function AppointmentBooking({
    availableSlots,
    onBookAppointment,
    services = [],
    className = ''
}: AppointmentBookingProps) {
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [selectedService, setSelectedService] = useState(services[0]?.name || '');
    const [contactInfo, setContactInfo] = useState({
        name: '',
        email: '',
        phone: '',
        notes: ''
    });
    const [step, setStep] = useState<'select' | 'contact' | 'confirm' | 'success'>('select');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Group slots by date
    const slotsByDate = availableSlots.reduce((acc, slot) => {
        if (!acc[slot.date]) {
            acc[slot.date] = [];
        }
        acc[slot.date].push(slot);
        return acc;
    }, {} as Record<string, TimeSlot[]>);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const handleSlotSelect = (slot: TimeSlot) => {
        if (slot.available) {
            setSelectedSlot(slot);
            setStep('contact');
        }
    };

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep('confirm');
    };

    const handleConfirmBooking = async () => {
        if (!selectedSlot) return;

        setIsSubmitting(true);
        try {
            await onBookAppointment(selectedSlot, contactInfo);
            setStep('success');
        } catch (error) {
            console.error('Booking failed:', error);
            alert('Booking failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setContactInfo({
            ...contactInfo,
            [e.target.name]: e.target.value
        });
    };

    // Success State
    if (step === 'success') {
        return (
            <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center ${className}`}>
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Appointment Confirmed!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Your appointment has been scheduled for:<br />
                    <span className="font-semibold text-gray-900 dark:text-white">
                        {selectedSlot && formatDate(selectedSlot.date)} at {selectedSlot?.time}
                    </span>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    A confirmation email has been sent to {contactInfo.email}
                </p>
            </div>
        );
    }

    // Confirmation Step
    if (step === 'confirm' && selectedSlot) {
        return (
            <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 ${className}`}>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Confirm Your Appointment
                </h2>

                <div className="space-y-4 mb-6">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 mb-2">
                            <Calendar className="w-5 h-5" />
                            <span className="font-semibold">Date & Time</span>
                        </div>
                        <p className="text-gray-900 dark:text-white">
                            {formatDate(selectedSlot.date)} at {selectedSlot.time}
                        </p>
                    </div>

                    {selectedService && (
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <div className="flex items-center gap-2 text-purple-900 dark:text-purple-300 mb-2">
                                <Clock className="w-5 h-5" />
                                <span className="font-semibold">Service</span>
                            </div>
                            <p className="text-gray-900 dark:text-white">{selectedService}</p>
                        </div>
                    )}

                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="font-semibold text-gray-900 dark:text-white mb-2">Contact Information</p>
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <p>{contactInfo.name}</p>
                            <p>{contactInfo.email}</p>
                            <p>{contactInfo.phone}</p>
                            {contactInfo.notes && <p className="italic">"{contactInfo.notes}"</p>}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setStep('contact')}
                        className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Go Back
                    </button>
                    <button
                        onClick={handleConfirmBooking}
                        disabled={isSubmitting}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Booking...' : 'Confirm Booking'}
                    </button>
                </div>
            </div>
        );
    }

    // Contact Info Step
    if (step === 'contact' && selectedSlot) {
        return (
            <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 ${className}`}>
                <button
                    onClick={() => setStep('select')}
                    className="mb-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                    ← Back to time selection
                </button>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Your Information
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Selected: {formatDate(selectedSlot.date)} at {selectedSlot.time}
                </p>

                <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={contactInfo.name}
                            onChange={handleChange}
                            required
                            placeholder="Enter your full name"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={contactInfo.email}
                            onChange={handleChange}
                            required
                            placeholder="your.email@example.com"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Phone *
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={contactInfo.phone}
                            onChange={handleChange}
                            required
                            placeholder="(555) 123-4567"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>

                    {services.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Service
                            </label>
                            <select
                                value={selectedService}
                                onChange={(e) => setSelectedService(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                {services.map(service => (
                                    <option key={service.name} value={service.name}>
                                        {service.name} ({service.duration} min) {service.price && `- $${service.price}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Additional Notes (Optional)
                        </label>
                        <textarea
                            name="notes"
                            value={contactInfo.notes}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Any special requests or additional information..."
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Continue to Confirmation
                    </button>
                </form>
            </div>
        );
    }

    // Slot Selection Step
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 ${className}`}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Select an Available Time
            </h2>

            <div className="space-y-6">
                {Object.keys(slotsByDate).length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">
                            No available slots at this time. Please check back later.
                        </p>
                    </div>
                ) : (
                    Object.entries(slotsByDate).map(([date, slots]) => (
                        <div key={date}>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                {formatDate(date)}
                            </h3>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                {slots.map(slot => (
                                    <button
                                        key={slot.id}
                                        onClick={() => handleSlotSelect(slot)}
                                        disabled={!slot.available}
                                        className={`px-4 py-3 rounded-lg font-medium transition-all ${slot.available
                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 border-2 border-blue-200 dark:border-blue-800'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed line-through'
                                            }`}
                                    >
                                        {slot.time}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export { AppointmentBooking };
