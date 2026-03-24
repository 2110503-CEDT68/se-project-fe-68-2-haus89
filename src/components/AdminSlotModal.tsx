'use client'

import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Button, TextField } from '@mui/material';
import addDentistSlot from '../libs/admin/addDentistSlot';
import deleteDentistSlot from '../libs/admin/deleteDentistSlot';

export default function AdminSlotModal({ open, onClose, dentist, onRefresh }: any) {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);

  if (!dentist) return null;

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token')!;
      await addDentistSlot(token, dentist._id, { date, startTime, endTime });
      
      setDate(''); setStartTime(''); setEndTime('');
      
      onRefresh(); 
    } catch (err: any) {
      alert(err.message || 'Failed to add slot');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlot = async (slotId: string, isBooked: boolean) => {
    const confirmMsg = isBooked 
      ? 'This slot is already booked by a patient!\nIf you delete this slot, the patient\'s booking will also be cancelled. Do you want to proceed?' 
      : 'Are you sure you want to delete this available slot?';

    if (!window.confirm(confirmMsg)) return;

    try {
      const token = localStorage.getItem('token')!;
      await deleteDentistSlot(token, dentist._id, slotId);
      onRefresh(); 
    } catch (err: any) {
      alert(err.message || 'Failed to delete slot');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, color: '#1e3a8a', display: 'flex', justifyContent: 'space-between' }}>
        <span> Manage Slots: {dentist.name}</span>
        <Button onClick={onClose} color="inherit" size="small" sx={{ minWidth: 'auto', p: 0 }}>❌</Button>
      </DialogTitle>
      
      <DialogContent dividers className="flex flex-col gap-6">
        
        <div>
          <h4 className="font-bold text-gray-800 mb-3 border-b pb-2">Current Available Slots</h4>
          {dentist.availableSlots?.length === 0 ? (
            <p className="text-sm text-gray-500 italic text-center py-4 bg-gray-50 rounded-lg">No available slots in the system</p>
          ) : (
            <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {dentist.availableSlots?.map((slot: any) => (
                <li key={slot._id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div>
                    <p className="font-bold text-gray-700 text-sm">
                       {new Date(slot.date).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600 text-sm">
                       {slot.startTime} - {slot.endTime}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {slot.isBooked ? (
                      <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">Booked</span>
                    ) : (
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">Available</span>
                    )}
                    
                    <button 
                      onClick={() => handleDeleteSlot(slot._id, slot.isBooked)}
                      className="text-sm font-bold text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded "
                      title="Delete Slot"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <h4 className="font-bold text-blue-900 mb-3">Add New Slot</h4>
          <form onSubmit={handleAddSlot} className="flex flex-col gap-4">
            <TextField
              required
              label="Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              size="small"
              fullWidth
            />
            <div className="flex gap-4">
              <TextField
                required
                label="Start Time"
                type="time"
                InputLabelProps={{ shrink: true }}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                size="small"
                fullWidth
              />
              <TextField
                required
                label="End Time"
                type="time"
                InputLabelProps={{ shrink: true }}
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                size="small"
                fullWidth
              />
            </div>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              disabled={loading}
              sx={{ fontWeight: 700, borderRadius: '8px', mt: 1 }}
            >
              {loading ? 'Adding...' : '+ Add Slot'}
            </Button>
          </form>
        </div>

      </DialogContent>
    </Dialog>
  );
}