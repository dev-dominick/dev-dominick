/*
 * Reusable Availability Scheduler Component
 * 
 * This component can be imported into any business app to provide
 * a consistent admin interface for managing availability schedules.
 */

'use client';

import { useState, useEffect } from 'react';

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  enabled: boolean;
}

interface AvailabilitySchedulerProps {
  businessName?: string;
  initialSlots?: TimeSlot[];
  onSave?: (slots: TimeSlot[]) => Promise<void>;
  storageKey?: string;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function AvailabilityScheduler({
  initialSlots,
  onSave,
  storageKey = 'availability_schedule',
}: AvailabilitySchedulerProps) {
  const [slots, setSlots] = useState<TimeSlot[]>(initialSlots || []);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  // Initialize slots on mount
  useEffect(() => {
    if (!mounted) {
      const defaultSlots: TimeSlot[] = DAYS_OF_WEEK.map(day => ({
        day,
        startTime: '09:00',
        endTime: '17:00',
        enabled: day !== 'Saturday' && day !== 'Sunday',
      }));

      // Try to load from localStorage first (client-side only)
      if (typeof window !== 'undefined') {
        const savedData = localStorage.getItem(storageKey);
        if (savedData) {
          try {
            setSlots(JSON.parse(savedData));
          } catch (e) {
            console.error('Failed to parse saved slots:', e);
            setSlots(defaultSlots);
          }
        } else {
          setSlots(defaultSlots);
        }
      } else {
        setSlots(defaultSlots);
      }
      setMounted(true);
    }
  }, [mounted, storageKey]);

  const handleTimeChange = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setSlots(newSlots);
    setSaved(false);
  };

  const handleEnabledChange = (index: number, enabled: boolean) => {
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], enabled };
    setSlots(newSlots);
    setSaved(false);
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      if (onSave) {
        await onSave(slots);
      } else {
        const jsonData = JSON.stringify(slots);
        localStorage.setItem(storageKey, jsonData);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save schedule';
      console.error('Save error:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Availability Schedule</h2>
        <p className="text-gray-400">Set your working hours for the calendar scheduler</p>
      </div>

      {/* Notifications */}
      {saved && (
        <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg animate-in fade-in">
          ✓ Schedule saved successfully
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
          ✗ {error}
        </div>
      )}

      {/* Schedule Grid */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-xl overflow-hidden backdrop-blur">
        {/* Header Row */}
        <div className="grid grid-cols-12 gap-0 border-b border-gray-800 bg-gray-950">
          <div className="col-span-3 px-6 py-4 text-sm font-semibold text-gray-300 border-r border-gray-800">
            Day
          </div>
          <div className="col-span-3 px-6 py-4 text-sm font-semibold text-gray-300 border-r border-gray-800">
            Start Time
          </div>
          <div className="col-span-3 px-6 py-4 text-sm font-semibold text-gray-300 border-r border-gray-800">
            End Time
          </div>
          <div className="col-span-3 px-6 py-4 text-sm font-semibold text-gray-300">
            Open
          </div>
        </div>

        {/* Slot Rows */}
        {slots.map((slot, index) => (
          <div
            key={slot.day}
            className="grid grid-cols-12 gap-0 border-b border-gray-800 last:border-b-0 hover:bg-gray-800/50 transition-colors"
          >
            <div className="col-span-3 px-6 py-4 flex items-center border-r border-gray-800">
              <span className="text-white font-medium">{slot.day}</span>
            </div>
            <div className="col-span-3 px-6 py-4 border-r border-gray-800">
              <input
                type="time"
                value={slot.startTime}
                onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                disabled={!slot.enabled}
                aria-label={`Start time for ${slot.day}`}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="col-span-3 px-6 py-4 border-r border-gray-800">
              <input
                type="time"
                value={slot.endTime}
                onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                disabled={!slot.enabled}
                aria-label={`End time for ${slot.day}`}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="col-span-3 px-6 py-4 flex items-center">
              {/* Toggle Switch */}
              <button
                onClick={() => handleEnabledChange(index, !slot.enabled)}
                aria-label={`Toggle availability for ${slot.day}`}
                className={`w-12 h-6 rounded-full transition-all duration-300 flex items-center px-1 ${slot.enabled ? 'bg-blue-600' : 'bg-gray-700'
                  }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 ${slot.enabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all duration-300"
      >
        {loading ? 'Saving...' : 'Save Schedule'}
      </button>

      {/* Info Section */}
      <div className="bg-blue-500/10 border border-blue-500/50 rounded-xl p-6">
        <h3 className="text-blue-400 font-semibold mb-2">💡 How it works</h3>
        <p className="text-gray-300 text-sm">
          Enable/disable days and set your available hours. These time slots will appear in your calendar scheduler for clients to book appointments.
        </p>
      </div>
    </div>
  );
}
