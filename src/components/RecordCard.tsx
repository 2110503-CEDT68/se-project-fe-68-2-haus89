'use client'

import React, { useState } from 'react';
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";

interface RecordCardProps {
  record: any;
}

export default function RecordCard({ record }: RecordCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (!record) return null;

  const handleOpenDetails = () => setDetailsOpen(true);
  const handleCloseDetails = () => setDetailsOpen(false);

  const recordDate = record.createdAt || record.date; 
  const displayDate = recordDate 
    ? new Date(recordDate).toLocaleDateString('th-TH') 
    : "N/A";

  const dentistName = record.dentist?.name || "Unknown Doctor";

  return (
    <>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-bold text-gray-500 mb-1">Dentist</p>
            <h2 className="text-2xl font-bold text-gray-900">{dentistName}</h2>
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
      </div>

      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
        <DialogTitle className="font-bold text-gray-800">
          Treatment Record Details
        </DialogTitle>
        <DialogContent className="flex flex-col gap-4 pt-4">
          
          <p className="text-sm text-gray-500 mb-2">
            Date: {displayDate} · Treated by: {dentistName}
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
    </>
  );
}