'use client'

import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, CircularProgress } from "@mui/material";
import dayjs from 'dayjs';
import cancelBooking from '../libs/cancelBooking';
import rescheduleBooking from '../libs/rescheduleBooking';
import getDentistAvailability, { AvailableSlot } from '../libs/getDentistAvailability';

interface BookingCardProps {
  booking: any;
  onBookingUpdate?: () => void;
}

export default function BookingCard({ booking, onBookingUpdate }: BookingCardProps) {
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState("");

  if (!booking) return null;

  const fetchSlots = async () => {
    const dentistId = booking.dentist?._id || booking.dentist;
    if (!dentistId) return;

    setSlotsLoading(true);
    try {
      const token = localStorage.getItem("token") || undefined;
      const availableSlots = await getDentistAvailability(dentistId, token);
      const now = dayjs();
      setSlots(
        availableSlots.filter(
          (slot) => !slot.isBooked && dayjs(slot.date).isAfter(now, "day")
        )
      );
    } catch (err: any) {
      setError(err.message || "Failed to load available slots");
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleOpenReschedule = () => {
    setRescheduleOpen(true);
    setSelectedSlot(null);
    setError("");
    fetchSlots();
  };

  const handleCloseReschedule = () => {
    setRescheduleOpen(false);
    setSelectedSlot(null);
    setSlots([]);
    setError("");
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    setCanceling(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        return;
      }

      await cancelBooking(token, booking._id);
      if (onBookingUpdate) {
        onBookingUpdate();
      }
    } catch (err: any) {
      setError(err.message || "Failed to cancel booking");
    } finally {
      setCanceling(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedSlot) {
      setError("Please select a time slot");
      return;
    }

    setRescheduleLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        return;
      }

      await rescheduleBooking(token, booking._id, {
        date: dayjs(selectedSlot.date).format("YYYY-MM-DD"),
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
      });

      handleCloseReschedule();
      if (onBookingUpdate) {
        onBookingUpdate();
      }
    } catch (err: any) {
      setError(err.message || "Failed to reschedule booking");
    } finally {
      setRescheduleLoading(false);
    }
  };

  // Group slots by date
  const groupedSlots = slots.reduce(
    (groups, slot) => {
      const dateKey = dayjs(slot.date).format("YYYY-MM-DD");
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(slot);
      return groups;
    },
    {} as Record<string, AvailableSlot[]>
  );

  const sortedDates = Object.keys(groupedSlots).sort();

  return (
    <>
      {error && !rescheduleOpen && (
        <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-sm text-gray-500 font-bold mb-1">Dentist</p>
            <h2 className="text-2xl font-bold text-gray-800">{booking.dentist?.name || "คุณหมอ"}</h2>
            <p className="text-blue-600">{booking.dentist?.areaOfExpertise || "ทันตแพทย์"}</p>
          </div>
          <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
            {booking.status || "CONFIRMED"}
          </span>
        </div>

        <hr className="my-6 border-gray-100" />

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-sm text-gray-500 font-bold mb-1">Date</p>
            <p className="text-lg font-medium text-gray-800">
              {new Date(booking.date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-bold mb-1">Time</p>
            <p className="text-lg font-medium text-gray-800">
              {booking.startTime} - {booking.endTime}
            </p>
          </div>
        </div>

        {booking.notes && (
          <div className="mb-8">
            <p className="text-sm text-gray-500 font-bold mb-2">Notes</p>
            <p className="text-gray-700">{booking.notes}</p>
          </div>
        )}

        <div className="flex gap-4">
          <Button 
            variant="outlined" 
            color="primary" 
            fullWidth
            onClick={handleOpenReschedule}
            disabled={canceling}
          >
            Reschedule
          </Button>
          <Button 
            variant="outlined" 
            color="error" 
            fullWidth
            onClick={handleCancel}
            disabled={canceling}
          >
            {canceling ? "Canceling..." : "Cancel Booking"}
          </Button>
        </div>
      </div>

      {rescheduleOpen && (
        <Dialog open={rescheduleOpen} onClose={handleCloseReschedule} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#1e3a5f' }}>
            Reschedule Appointment
          </DialogTitle>
          <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && (
              <div className="bg-red-100 text-red-600 p-3 rounded-lg">
                {error}
              </div>
            )}

            <label className="block text-sm font-bold text-gray-700">
              Select New Time Slot *
            </label>

            {slotsLoading ? (
              <div className="flex justify-center items-center py-8">
                <CircularProgress size={28} />
                <span className="ml-3 text-gray-500 text-sm">Loading available slots...</span>
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500 font-medium">No available slots</p>
                <p className="text-gray-400 text-sm mt-1">
                  This dentist has no open time slots at the moment.
                </p>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-3 pr-1 pl-4">
                {sortedDates.map((dateKey) => (
                  <div key={dateKey}>
                    <p className="text-sm font-bold text-blue-800 mb-2 sticky top-0 bg-white py-1">
                      📅 {dayjs(dateKey).format("dddd, MMMM D, YYYY")}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {groupedSlots[dateKey].map((slot, idx) => {
                        const isSelected =
                          selectedSlot &&
                          dayjs(selectedSlot.date).format("YYYY-MM-DD") === dateKey &&
                          selectedSlot.startTime === slot.startTime &&
                          selectedSlot.endTime === slot.endTime;

                        return (
                          <button
                            key={`${dateKey}-${idx}`}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-3 rounded-lg border-2 text-left transition-all ${
                              isSelected
                                ? "border-blue-500 bg-blue-50 text-blue-800 ring-2 ring-blue-200"
                                : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50/50"
                            }`}
                          >
                            <span className="text-sm font-bold">
                              🕐 {slot.startTime} - {slot.endTime}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DialogContent>

          <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
            <Button
              variant="outlined"
              fullWidth
              onClick={handleCloseReschedule}
              disabled={rescheduleLoading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleReschedule}
              disabled={rescheduleLoading || !selectedSlot}
            >
              {rescheduleLoading ? "Rescheduling..." : "Confirm"}
            </Button>
          </div>
        </Dialog>
      )}
    </>
  );
}