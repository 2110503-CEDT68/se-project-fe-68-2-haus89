'use client'

import React, { useState, useEffect } from 'react';
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Alert } from "@mui/material";
import updateRecord from '../libs/updateRecord';
import deleteRecord from '../libs/admin/deleteRecord';

interface RecordCardProps {
  record: any;
  userRole?: string;
  onRecordUpdated?: () => void;
  onRecordDeleted?: () => void;
}

const getTodayDateString = () => {
  const today = new Date();
  const offset = today.getTimezoneOffset() * 60000;
  return new Date(today.getTime() - offset).toISOString().split("T")[0];
};

export default function RecordCard({ record, userRole, onRecordUpdated, onRecordDeleted }: RecordCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editDiagnosis, setEditDiagnosis] = useState("");
  const [editTreatments, setEditTreatments] = useState("");
  const [editPrescriptions, setEditPrescriptions] = useState("");
  const [editFollowUpDate, setEditFollowUpDate] = useState("");
  const [editDentistNote, setEditDentistNote] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const minFollowUpDate = getTodayDateString();

  useEffect(() => {
    if (userRole !== 'user' || !record._id) return;
    const seenAt: Record<string, string> = JSON.parse(localStorage.getItem('recordsSeenAt') || '{}');
    const lastViewedAt = seenAt[record._id];
    if (!lastViewedAt) {
      setIsNew(true);
    } else if (record.updatedAt && new Date(record.updatedAt) > new Date(lastViewedAt)) {
      setIsNew(true);
    }
  }, [record._id, record.updatedAt, userRole]);

  if (!record) return null;

  const handleOpenDetails = () => {
    setDetailsOpen(true);
    if (isNew) {
      const seenAt: Record<string, string> = JSON.parse(localStorage.getItem('recordsSeenAt') || '{}');
      seenAt[record._id] = new Date().toISOString();
      localStorage.setItem('recordsSeenAt', JSON.stringify(seenAt));
      setIsNew(false);
      window.dispatchEvent(new Event('recordsViewed'));
    }
  };
  const handleCloseDetails = () => setDetailsOpen(false);
  
  const showEditButton = userRole === 'dentist';
  const showDeleteButton = userRole === 'admin';

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem("token")!;
      await deleteRecord(token, record._id);
      alert("Record deleted successfully");
      setDeleteConfirmOpen(false);
      if (onRecordDeleted) onRecordDeleted();
    } catch (err: any) {
      alert(err.message || "Failed to delete record");
    } finally {
      setDeleting(false);
    }
  };

  const recordDate = record.createdAt || record.date; 
  const displayDate = recordDate 
    ? new Date(recordDate).toLocaleDateString('th-TH') 
    : "N/A";

  const dentistName = record.dentist?.name || "Unknown Doctor";
  const patientName = record.patient?.name || "Unknown Patient";

  const isDentistRole = userRole === 'dentist';
  const isAdminRole = userRole === 'admin';

  const handleEditClick = () => {
    setEditDiagnosis(record.diagnosis || "");
    setEditTreatments(
      Array.isArray(record.treatments)
        ? record.treatments.map((t: any) => t.procedureName || t).join(", ")
        : record.treatments || ""
    );
    setEditPrescriptions(
      Array.isArray(record.prescriptions)
        ? record.prescriptions.map((p: any) => p.medicationName || p).join(", ")
        : record.prescriptions || ""
    );
    setEditFollowUpDate(
      record.followUpDate
        ? new Date(record.followUpDate).toISOString().split("T")[0]
        : ""
    );
    setEditDentistNote(record.dentistNote || "");
    setEditError("");
    setEditModalOpen(true);
  };

  const handleEditSave = async () => {
    setEditError("");

    if (editFollowUpDate && editFollowUpDate < minFollowUpDate) {
      setEditError("Follow-up date cannot be in the past");
      return;
    }

    setEditSaving(true);

    try {
      const token = localStorage.getItem("token")!;
      await updateRecord(token, record._id, {
        diagnosis: editDiagnosis,
        treatments: editTreatments,
        prescriptions: editPrescriptions,
        followUpDate: editFollowUpDate,
        dentistNote: editDentistNote,
      });

      setEditModalOpen(false);
      setSuccessOpen(true);
      if (onRecordUpdated) {
        onRecordUpdated();
      }
    } catch (err: any) {
      setEditError(err.message || "Failed to update record");
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            {isAdminRole ? (
              <>
                <p className="text-sm font-bold text-gray-500 mb-1">Dentist</p>
                <h2 className="text-2xl font-bold text-gray-900">{dentistName}</h2>
                <p className="text-sm font-bold text-gray-500 mt-2 mb-1">Patient</p>
                <h3 className="text-xl font-bold text-gray-800">{patientName}</h3>
                <p className="text-blue-500 text-sm mt-1">Dental Treatment</p>
              </>
            ) : (
              <>
                <p className="text-sm font-bold text-gray-500 mb-1">{isDentistRole ? "Patient" : "Dentist"}</p>
                <h2 className="text-2xl font-bold text-gray-900">{isDentistRole ? patientName : dentistName}</h2>
                <p className="text-blue-500 text-sm mt-1">Dental Treatment</p>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isNew && (
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block" title="Updated" />
            )}
            <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              COMPLETED
            </span>
          </div>
        </div>

        <hr className="my-4 border-gray-100" />

        <div className="mb-6">
          <p className="text-sm font-bold text-gray-500 mb-1">Treatment Date</p>
          <p className="text-lg text-gray-800">{displayDate}</p>
          {record.updatedAt && (
            <p className="text-xs text-gray-400 mt-1">
              Last updated: {new Date(record.updatedAt).toLocaleString('th-TH')}
            </p>
          )}
        </div>

        <Button 
          variant="outlined" 
          color="primary" 
          fullWidth
          onClick={handleOpenDetails}
          sx={{ borderRadius: '8px', padding: '8px 0' }}
        >
          VIEW FULL RECORD
        </Button>

        {showEditButton && (
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            onClick={handleEditClick}
            sx={{ borderRadius: '8px', padding: '8px 0', marginTop: '12px' }}
          >
            EDIT
          </Button>
        )}
        {showDeleteButton && (
          <Button
            variant="outlined"
            color="error"
            fullWidth
            onClick={() => setDeleteConfirmOpen(true)}
            sx={{ borderRadius: '8px', padding: '8px 0', marginTop: '12px' }}
          >
            DELETE
          </Button>
        )}
      </div>

      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
        <DialogTitle className="font-bold text-gray-800">
          Treatment Record Details
        </DialogTitle>
        <DialogContent className="flex flex-col gap-4 pt-4">
          
          <p className="text-sm text-gray-500 mb-2">
            Date: {displayDate}
            {isAdminRole && (
              <> · Patient: {patientName} · Dentist: {dentistName}</>
            )}
            {isDentistRole && <> · Patient: {patientName}</>}
            {!isAdminRole && !isDentistRole && <> · Treated by: {dentistName}</>}
          </p>

          <TextField
            label="Diagnosis"
            value={record.diagnosis || "-"}
            InputProps={{ readOnly: true }} 
            size="small"
            fullWidth
            multiline
            rows={2}
          />
          <TextField
            label="Treatments"
            value={
              Array.isArray(record.treatments) 
                ? record.treatments.map((t: any) => t.procedureName).join(', ') 
                : record.treatments || "-"
            }
            InputProps={{ readOnly: true }}
            size="small"
            fullWidth
          />
          <TextField
            label="Prescriptions"
            value={
              Array.isArray(record.prescriptions) 
                ? record.prescriptions.map((p: any) => p.medicationName).join(', ') 
                : record.prescriptions || "-"
            }
            InputProps={{ readOnly: true }}
            size="small"
            fullWidth
          />
          <TextField
            label="Follow-up Date"
            value={record.followUpDate ? new Date(record.followUpDate).toLocaleDateString('th-TH') : "-"}
            InputProps={{ readOnly: true }}
            size="small"
            fullWidth
          />
          <TextField
            label="Dentist Note"
            value={record.dentistNote || "-"}
            InputProps={{ readOnly: true }}
            size="small"
            fullWidth
            multiline
            rows={2}
          />
          
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleCloseDetails} 
            variant="contained" 
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Record Modal */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="font-bold text-gray-800">
          Edit Dental Record
        </DialogTitle>
        <DialogContent className="flex flex-col gap-4 pt-4">
          {editError && <Alert severity="error">{editError}</Alert>}

          <p className="text-sm text-gray-500 mb-2">
            Date: {displayDate} · Patient : {patientName}
          </p>

          <TextField
            label="Diagnosis"
            value={editDiagnosis}
            onChange={(e) => setEditDiagnosis(e.target.value)}
            size="small"
            fullWidth
            multiline
            rows={3}
            placeholder="e.g. Cavity in molar tooth, need filling"
          />

          <TextField
            label="Treatments (comma-separated)"
            value={editTreatments}
            onChange={(e) => setEditTreatments(e.target.value)}
            size="small"
            fullWidth
            placeholder="e.g. Filling, Cleaning, Root Canal"
          />

          <TextField
            label="Prescriptions (comma-separated)"
            value={editPrescriptions}
            onChange={(e) => setEditPrescriptions(e.target.value)}
            size="small"
            fullWidth
            placeholder="e.g. Amoxicillin 500mg, Ibuprofen 400mg"
          />

          <TextField
            label="Follow-up Date"
            type="date"
            value={editFollowUpDate}
            onChange={(e) => setEditFollowUpDate(e.target.value)}
            inputProps={{ min: minFollowUpDate }}
            InputLabelProps={{ shrink: true }}
            size="small"
            fullWidth
          />

          <TextField
            label="Dentist Note"
            value={editDentistNote}
            onChange={(e) => setEditDentistNote(e.target.value)}
            size="small"
            fullWidth
            multiline
            rows={3}
            placeholder="Additional notes for your record"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setEditModalOpen(false)} color="inherit" disabled={editSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleEditSave}
            variant="contained"
            color="primary"
            disabled={editSaving}
            sx={{ minWidth: "100px" }}
          >
            {editSaving ? <CircularProgress size={24} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#dc2626' }}>Delete Record</DialogTitle>
        <DialogContent>
          <p className="text-gray-600">Are you sure you want to delete this record?</p>
          <p className="text-red-500 text-sm font-bold mt-3">This action cannot be undone.</p>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit" disabled={deleting}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={successOpen} onClose={() => setSuccessOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle className="font-bold text-gray-800">Record Updated</DialogTitle>
        <DialogContent>
          <p className="text-gray-600">The dental record has been updated successfully.</p>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setSuccessOpen(false)} variant="contained" color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
