'use client'

import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";

interface RecordCardProps {
  record: any;
}

export default function RecordCard({ record }: RecordCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (!record) return null;

  const handleOpenDetails = () => setDetailsOpen(true);
  const handleCloseDetails = () => setDetailsOpen(false);

  return (
    <>
      <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 mb-6 transition hover:shadow-lg">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-sm text-gray-500 font-bold mb-1">Dentist</p>
            <h2 className="text-2xl font-bold text-gray-800">{record.dentist?.name || "Unknown Doctor"}</h2>
            <p className="text-blue-600">Dental Treatment</p>
          </div>
          <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
            COMPLETED
          </span>
        </div>

        <hr className="my-6 border-gray-100" />

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-sm text-gray-500 font-bold mb-1">Treatment Date</p>
            <p className="text-lg font-medium text-gray-800">
              {record.createdAt ? new Date(record.createdAt).toLocaleDateString() : "N/A"}
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <Button 
            variant="outlined" 
            color="primary" 
            fullWidth
            onClick={handleOpenDetails}
          >
            View Full Record
          </Button>
        </div>
      </div>

      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#1e3a5f' }}>
          Treatment Details
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 font-semibold">Treated by: <span className="text-blue-800">{record.dentist?.name}</span></p>
            <p className="text-sm text-gray-600 font-semibold">Date: <span className="text-blue-800">{record.createdAt ? new Date(record.createdAt).toLocaleDateString() : ""}</span></p>
          </div>

          <div>
            <h3 className="text-md font-bold text-gray-800 border-b pb-2 mb-2">Treatment Notes</h3>
            <p className="text-gray-700 whitespace-pre-line">
              {record.treatmentNotes || "No treatment notes provided."}
            </p>
          </div>

          <div>
            <h3 className="text-md font-bold text-gray-800 border-b pb-2 mb-2">Prescriptions</h3>
            {record.prescriptions && record.prescriptions.length > 0 ? (
              <ul className="list-disc list-inside text-gray-700">
                {record.prescriptions.map((med: string, index: number) => (
                  <li key={index}>{med}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No prescriptions.</p>
            )}
          </div>

          <div>
            <h3 className="text-md font-bold text-gray-800 border-b pb-2 mb-2">Attachments</h3>
            {record.attachments ? (
              <a href={record.attachments} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                View Attached Document
              </a>
            ) : (
              <p className="text-gray-500 italic">No attachments.</p>
            )}
          </div>

        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="contained" color="primary" onClick={handleCloseDetails}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}