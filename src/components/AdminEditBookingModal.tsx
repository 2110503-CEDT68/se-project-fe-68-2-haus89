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
  IconButton,
} from '@mui/material';

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
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [status, setStatus] = useState('confirmed');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (booking) {
      const bookingDate = new Date(booking.date);
      const yyyy = bookingDate.getFullYear();
      const mm = String(bookingDate.getMonth() + 1).padStart(2, '0');
      const dd = String(bookingDate.getDate()).padStart(2, '0');
      setDate(`${yyyy}-${mm}-${dd}`);
      setStartTime(booking.startTime || '');
      setEndTime(booking.endTime || '');
      setStatus(booking.status || 'confirmed');
      setNotes(booking.notes || '');
      setError('');
    }
  }, [booking]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await onSave(booking._id, {
        date: new Date(date).toISOString(),
        startTime,
        endTime,
        status,
        notes,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update booking');
    } finally {
      setSaving(false);
    }
  };

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

          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="Start Time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="End Time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
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
