'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import getMe from '../../../libs/getMe';
import getDentist from '../../../libs/getDentist';
import addDentistSlot from '../../../libs/admin/addDentistSlot';
import deleteDentistSlot from '../../../libs/admin/deleteDentistSlot';
import createRecord from '../../../libs/admin/createRecord';

interface Slot {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  bookedBy?: string;    
  bookingId?: string;   
}

interface RecordForm {
  diagnosis: string;
  treatments: string;
  prescriptions: string;
  followUpDate: string;
  dentistNote: string;
}

export default function DentistSlotsPage() {
  const router = useRouter();
  const [dentist, setDentist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [saving, setSaving] = useState(false);


  // Record modal state
  const [recordSlot, setRecordSlot] = useState<Slot | null>(null);
  const [recordForm, setRecordForm] = useState<RecordForm>({
    diagnosis: '',
    treatments: '',
    prescriptions: '',
    followUpDate: '',
    dentistNote: '',
  });

  const fetchDentist = async () => {
    try {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      if (!token || role !== 'dentist') {
        router.push('/');
        return;
      }
      const me = await getMe(token);
      const id = me.data?._id || me._id;
      const data = await getDentist(id, token);
      setDentist(data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDentist();
  }, [router]);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token')!;
      await addDentistSlot(token, dentist._id, { date, startTime, endTime });
      setDate(''); setStartTime(''); setEndTime('');
      await fetchDentist();
    } catch (err: any) {
      alert(err.message || 'Failed to add slot');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlot = async (slotId: string, isBooked: boolean) => {
    const msg = isBooked
      ? "This slot is booked by a patient. Deleting it will cancel their booking. Proceed?"
      : "Delete this slot?";
    if (!window.confirm(msg)) return;
    try {
      const token = localStorage.getItem('token')!;
      await deleteDentistSlot(token, dentist._id, slotId);
      await fetchDentist();
    } catch (err: any) {
      alert(err.message || 'Failed to delete slot');
    }
  };

  const openRecordModal = (slot: Slot) => {
    setRecordSlot(slot);
    setRecordForm({ diagnosis: '', treatments: '', prescriptions: '', followUpDate: '', dentistNote: '' });
  };

  

  const handleCreateRecord = async () => {
    if (!recordSlot || !dentist || !recordSlot.bookedBy) return;
    try {
      const token = localStorage.getItem('token')!;

      await createRecord(token, {
        patient:      recordSlot.bookedBy,   
        dentist:      dentist._id,
        bookingId:    recordSlot.bookingId,  
        diagnosis:    recordForm.diagnosis,
        treatments:   recordForm.treatments,
        prescriptions: recordForm.prescriptions,
        followUpDate: recordForm.followUpDate,
        dentistNote:  recordForm.dentistNote,
      });

      alert('Record created!');
      setRecordSlot(null);
    } catch (err: any) {
      alert(err.message || 'Failed to create record');
    }
  };

  if (loading) return <main className="min-h-screen flex items-center justify-center text-gray-500 text-xl font-bold">Loading...</main>;
  if (error) return <main className="min-h-screen flex items-center justify-center text-red-500 text-xl font-bold">{error}</main>;

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-2xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-blue-900">My Available Slots</h1>
          <p className="text-gray-500 mt-1">{dentist?.name} · {dentist?.areaOfExpertise}</p>
        </div>

        {error && <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-6 font-bold">{error}</div>}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <h2 className="font-bold text-gray-800 mb-3 border-b pb-2">Current Slots</h2>
          {!dentist?.availableSlots?.length ? (
            <p className="text-sm text-gray-500 italic text-center py-6">No slots yet. Add one below.</p>
          ) : (
            <ul className="space-y-3 max-h-72 overflow-y-auto">
              {dentist.availableSlots.map((slot: Slot) => (
                <li key={slot._id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div>
                    <p className="font-bold text-gray-700 text-sm">{new Date(slot.date).toLocaleDateString()}</p>
                    <p className="text-gray-600 text-sm">{slot.startTime} – {slot.endTime}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${slot.isBooked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {slot.isBooked ? 'Booked' : 'Available'}
                    </span>
                    {slot.isBooked && (
                      <button
                        onClick={() => openRecordModal(slot)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded border border-blue-200"
                      >
                        + Record
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteSlot(slot._id, slot.isBooked)}
                      className="text-sm font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-blue-50 rounded-xl border border-blue-100 p-5">
          <h2 className="font-bold text-blue-900 mb-4">Add New Slot</h2>
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
              disabled={saving}
              sx={{ fontWeight: 700, borderRadius: '8px' }}
            >
              {saving ? 'Adding...' : '+ Add Slot'}
            </Button>
          </form>
        </div>

      </div>

      {/* Create Record Modal */}
      <Dialog open={!!recordSlot} onClose={() => setRecordSlot(null)} maxWidth="sm" fullWidth>
        <DialogTitle className="font-bold">Create Treatment Record</DialogTitle>
        <DialogContent className="flex flex-col gap-4 pt-4">
          {recordSlot && (
            <p className="text-sm text-gray-500 mb-2">
              Slot: {new Date(recordSlot.date).toLocaleDateString()} · {recordSlot.startTime} – {recordSlot.endTime}
            </p>
          )}
          <TextField
            label="Diagnosis"
            value={recordForm.diagnosis}
            onChange={(e) => setRecordForm(f => ({ ...f, diagnosis: e.target.value }))}
            size="small"
            fullWidth
            required
            multiline
            rows={2}
          />
          <TextField
            label="Treatments (comma-separated)"
            value={recordForm.treatments}
            onChange={(e) => setRecordForm(f => ({ ...f, treatments: e.target.value }))}
            size="small"
            fullWidth
            placeholder="e.g. Cleaning, Filling"
          />
          <TextField
            label="Prescriptions (comma-separated)"
            value={recordForm.prescriptions}
            onChange={(e) => setRecordForm(f => ({ ...f, prescriptions: e.target.value }))}
            size="small"
            fullWidth
            placeholder="e.g. Amoxicillin 500mg, Ibuprofen"
          />
          <TextField
            label="Follow-up Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={recordForm.followUpDate}
            onChange={(e) => setRecordForm(f => ({ ...f, followUpDate: e.target.value }))}
            size="small"
            fullWidth
          />
          <TextField
            label="Dentist Note"
            value={recordForm.dentistNote}
            onChange={(e) => setRecordForm(f => ({ ...f, dentistNote: e.target.value }))}
            size="small"
            fullWidth
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRecordSlot(null)}>Cancel</Button>
          <Button
            onClick={handleCreateRecord}
            variant="contained"
            disabled={!recordForm.diagnosis}
          >
            Create Record
          </Button>
        </DialogActions>
      </Dialog>
    </main>
  );
}
