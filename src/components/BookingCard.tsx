'use client'

import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent } from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import cancelBooking from '../libs/cancelBooking';
import rescheduleBooking from '../libs/rescheduleBooking';

interface BookingCardProps {
  booking: any;
  onBookingUpdate?: () => void;
}

export default function BookingCard({ booking, onBookingUpdate }: BookingCardProps) {
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedStartTime, setSelectedStartTime] = useState<Dayjs | null>(null);
  const [selectedEndTime, setSelectedEndTime] = useState<Dayjs | null>(null);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState("");

  if (!booking) return null;

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
    if (!selectedDate || !selectedStartTime || !selectedEndTime) {
      setError("Please select date and time");
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
        date: selectedDate.format("YYYY-MM-DD"),
        startTime: selectedStartTime.format("HH:mm"),
        endTime: selectedEndTime.format("HH:mm"),
      });

      setRescheduleOpen(false);
      setSelectedDate(null);
      setSelectedStartTime(null);
      setSelectedEndTime(null);
      if (onBookingUpdate) {
        onBookingUpdate();
      }
    } catch (err: any) {
      setError(err.message || "Failed to reschedule booking");
    } finally {
      setRescheduleLoading(false);
    }
  };

  return (
    <>
      {error && (
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
            onClick={() => setRescheduleOpen(true)}
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
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Dialog open={rescheduleOpen} onClose={() => {
            setRescheduleOpen(false);
            setSelectedDate(null);
            setSelectedStartTime(null);
            setSelectedEndTime(null);
            setError("");
          }} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#1e3a5f' }}>
              Reschedule Appointment
            </DialogTitle>
            <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {error && (
                <div className="bg-red-100 text-red-600 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Select New Date *</label>
                <DatePicker
                  value={selectedDate}
                  onChange={setSelectedDate}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Start Time *</label>
                  <TimePicker
                    value={selectedStartTime}
                    onChange={setSelectedStartTime}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                      },
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">End Time *</label>
                  <TimePicker
                    value={selectedEndTime}
                    onChange={setSelectedEndTime}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                      },
                    }}
                  />
                </div>
              </div>
            </DialogContent>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  setRescheduleOpen(false);
                  setSelectedDate(null);
                  setSelectedStartTime(null);
                  setSelectedEndTime(null);
                  setError("");
                }}
                disabled={rescheduleLoading}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleReschedule}
                disabled={rescheduleLoading || !selectedDate || !selectedStartTime || !selectedEndTime}
              >
                {rescheduleLoading ? "Rescheduling..." : "Confirm"}
              </Button>
            </div>
          </Dialog>
        </LocalizationProvider>
      )}
    </>
  );
}