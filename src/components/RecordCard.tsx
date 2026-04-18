'use client'

import React, { useState } from 'react';
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Alert } from "@mui/material";
import updateRecord from '../libs/updateRecord';

interface RecordCardProps {
  record: any;
  userRole?: string;
  onRecordUpdated?: () => void;
}

export default function RecordCard({ record, userRole, onRecordUpdated }: RecordCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editDiagnosis, setEditDiagnosis] = useState("");
  const [editTreatments, setEditTreatments] = useState("");
  const [editPrescriptions, setEditPrescriptions] = useState("");
  const [editFollowUpDate, setEditFollowUpDate] = useState("");
  const [editDentistNote, setEditDentistNote] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  if (!record) return null;

  const handleOpenDetails = () => setDetailsOpen(true);
  const handleCloseDetails = () => setDetailsOpen(false);
  
  // Show edit button only for dentist
  const showEditButton = userRole === 'dentist';

  const recordDate = record.createdAt || record.date; 
  const displayDate = recordDate 
    ? new Date(recordDate).toLocaleDateString('th-TH') 
    : "N/A";

  const dentistName = record.dentist?.name || "Unknown Doctor";
  const patientName = record.patient?.name || "Unknown Patient";

  const isDentistRole = userRole === 'dentist';
  const displayRoleLabel = isDentistRole ? "Patient" : "Dentist";
  const displayPersonName = isDentistRole ? patientName : dentistName;

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
            <p className="text-sm font-bold text-gray-500 mb-1">{displayRoleLabel}</p>
            <h2 className="text-2xl font-bold text-gray-900">{displayPersonName}</h2>
            <p className="text-blue-500 text-sm mt-1">Dental Treatment</p>
          </div>
          <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            COMPLETED
          </span>
        </div>

        <hr className="my-4 border-gray-100" />

        <div className="mb-6">
          <p className="text-sm font-bold text-gray-500 mb-1">Treatment Date</p>
          <p className="text-lg text-gray-800">{displayDate}</p>
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
      </div>

      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
        <DialogTitle className="font-bold text-gray-800">
          Treatment Record Details
        </DialogTitle>
        <DialogContent className="flex flex-col gap-4 pt-4">
          
          <p className="text-sm text-gray-500 mb-2">
            Date: {displayDate} · {isDentistRole ? `Patient: ${patientName}` : `Treated by: ${dentistName}`}
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
    </>
  );
}