'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Users } from 'lucide-react';

interface Appointment {
  id: string;
  customerName: string;
  customerEmail: string;
  datetime: string;
  status: string;
  notes?: string;
}

interface TimeSlot {
  id: string;
  date: string;
  time: string;
  available: boolean;
  duration?: number;
}

export default function AdminScheduler() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [appointmentsRes, slotsRes] = await Promise.all([
        fetch('/api/appointments'),
        fetch('/api/appointments/slots')
      ]);

      const appointmentsData = await appointmentsRes.json();
      const slotsData = await slotsRes.json();

      setAppointments(appointmentsData.appointments || []);
      setSlots(slotsData.slots || []);
    } catch (error) {
      console.error('Error loading scheduler data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const upcomingAppointments = appointments
    .filter(apt => new Date(apt.datetime) > new Date())
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

  const pastAppointments = appointments
    .filter(apt => new Date(apt.datetime) <= new Date())
    .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Scheduler
        </h1>
        <p className="text-gray-400">
          Manage your appointments and availability
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-white">Upcoming</h3>
          </div>
          <p className="text-3xl font-bold text-blue-400">{upcomingAppointments.length}</p>
        </div>

        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-green-400" />
            <h3 className="font-semibold text-white">Available Slots</h3>
          </div>
          <p className="text-3xl font-bold text-green-400">
            {slots.filter(s => s.available).length}
          </p>
        </div>

        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-white">Past Meetings</h3>
          </div>
          <p className="text-3xl font-bold text-purple-400">{pastAppointments.length}</p>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          Upcoming Appointments
        </h2>
        {upcomingAppointments.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            No upcoming appointments
          </p>
        ) : (
          <div className="space-y-4">
            {upcomingAppointments.map(appointment => (
              <div
                key={appointment.id}
                className="p-4 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-white">
                      {appointment.customerName}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {appointment.customerEmail}
                    </p>
                    {appointment.notes && (
                      <p className="text-sm text-gray-500 mt-2 italic">
                        {appointment.notes}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">
                      {formatDateTime(appointment.datetime)}
                    </p>
                    <span className="inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full bg-green-900/30 text-green-300">
                      {appointment.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Past Appointments
          </h2>
          <div className="space-y-3">
            {pastAppointments.slice(0, 5).map(appointment => (
              <div
                key={appointment.id}
                className="p-3 border border-gray-700 rounded-lg opacity-75"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-white">
                      {appointment.customerName}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {appointment.customerEmail}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatDateTime(appointment.datetime)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

