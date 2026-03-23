'use client'

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import dayjs from 'dayjs';
import getDentistAvailability, { AvailableSlot } from '../libs/getDentistAvailability';

interface EditBookingModalProps {
  open: boolean;
  booking: any;
  onClose: () => void;
  onSave: (bookingId: string, data: any) => Promise<void>;
}

export default function AdminEditBookingModal({
  open,
  booking,
  onClose,
  onSave,
}: EditBookingModalProps) {
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [status, setStatus] = useState('confirmed');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (booking && open) {
      setStatus(booking.status || 'confirmed');
      setNotes(booking.notes || '');
      setError('');
      setSelectedSlot(null);
      fetchSlots();
    }
  }, [booking, open]);

  const fetchSlots = async () => {
    const dentistId = booking?.dentist?._id || booking?.dentist;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const data: any = { status, notes };

      // If a new slot is selected, include date/time changes
      if (selectedSlot) {
        data.date = dayjs(selectedSlot.date).format('YYYY-MM-DD');
        data.startTime = selectedSlot.startTime;
        data.endTime = selectedSlot.endTime;
      }

      await onSave(booking._id, data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update booking');
    } finally {
      setSaving(false);
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle
          sx={{
            fontWeight: 800,
            fontSize: '1.4rem',
            color: '#1e3a5f',
            borderBottom: '1px solid #e5e7eb',
            pb: 2,
          }}
        >
          Edit Booking
        </DialogTitle>

        <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {error && (
            <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm text-center mt-2">
              {error}
            </div>
          )}

          {/* Dentist Info (read-only) */}
          <div className="bg-blue-50 p-3 rounded-lg mt-2">
            <p className="text-sm text-gray-500 font-bold">Dentist</p>
            <p className="text-lg font-bold text-blue-900">
              {booking?.dentist?.name || 'N/A'}
            </p>
          </div>

          {/* User Info (read-only) */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-500 font-bold">Patient</p>
            <p className="text-lg font-bold text-gray-800">
              {booking?.user?.name || 'N/A'}
            </p>
          </div>

          {/* Current Schedule (read-only) */}
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
            <p className="text-sm text-gray-500 font-bold mb-1">Current Schedule</p>
            <p className="text-sm font-medium text-gray-700">
              📅 {booking ? dayjs(booking.date).format('dddd, MMMM D, YYYY') : 'N/A'}
            </p>
            <p className="text-sm font-medium text-gray-700">
              🕐 {booking?.startTime || 'N/A'} - {booking?.endTime || 'N/A'}
            </p>
          </div>

          {/* Available Slots */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Reschedule to a New Slot (Optional)
            </label>

            {slotsLoading ? (
              <div className="flex justify-center items-center py-6">
                <CircularProgress size={24} />
                <span className="ml-3 text-gray-500 text-sm">Loading available slots...</span>
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500 text-sm font-medium">No available slots</p>
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-3 pr-1">
                {sortedDates.map((dateKey) => (
                  <div key={dateKey}>
                    <p className="text-xs font-bold text-blue-800 mb-1 sticky top-0 bg-white py-1">
                      📅 {dayjs(dateKey).format("ddd, MMM D, YYYY")}
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
                            className={`p-2 rounded-lg border-2 text-left transition-all ${
                              isSelected
                                ? "border-blue-500 bg-blue-50 text-blue-800 ring-2 ring-blue-200"
                                : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50/50"
                            }`}
                          >
                            <span className="text-xs font-bold">
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
          </div>

          <TextField
            label="Status"
            select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
            fullWidth
          >
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </TextField>

          <TextField
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            rows={3}
            fullWidth
            slotProps={{ htmlInput: { maxLength: 500 } }}
            helperText={`${notes.length}/500`}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            color="inherit"
            disabled={saving}
            sx={{ fontWeight: 700, borderRadius: '8px' }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            sx={{
              fontWeight: 700,
              borderRadius: '8px',
              bgcolor: '#2563eb',
              '&:hover': { bgcolor: '#1d4ed8' },
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
