'use client'

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem
} from '@mui/material';

const EXPERTISE_OPTIONS = [
  "General Dentistry",
  "Orthodontics",
  "Periodontology",
  "Endodontics",
  "Prosthodontics",
  "Oral Surgery",
  "Pediatric Dentistry",
  "Cosmetic Dentistry",
];

export default function AdminDentistModal({ open, onClose, dentist, onSave }: any) {
  const [formData, setFormData] = useState({
    name: '',
    yearsOfExperience: '',
    areaOfExpertise: 'General Dentistry',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (dentist) {
      setFormData({
        name: dentist.name,
        yearsOfExperience: dentist.yearsOfExperience,
        areaOfExpertise: dentist.areaOfExpertise,
        email: dentist.email,
        phone: dentist.phone,
      });
    } else {
      setFormData({
        name: '',
        yearsOfExperience: '',
        areaOfExpertise: 'General Dentistry',
        email: '',
        phone: '',
      });
    }
  }, [dentist, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 800, color: '#1e3a8a' }}>
          {dentist ? 'Edit Dentist' : 'Add New Dentist'}
        </DialogTitle>
        <DialogContent dividers className="flex flex-col gap-4">
          
          <TextField
            required
            name="name"
            label="Full Name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
          />

          <div className="flex gap-4">
            <TextField
              required
              name="yearsOfExperience"
              label="Years of Experience"
              type="number"
              InputProps={{ inputProps: { min: 0, max: 100 } }}
              value={formData.yearsOfExperience}
              onChange={handleChange}
              fullWidth
            />
            
            <TextField
              required
              select
              name="areaOfExpertise"
              label="Area of Expertise"
              value={formData.areaOfExpertise}
              onChange={handleChange}
              fullWidth
            >
              {EXPERTISE_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </div>

          <TextField
            required
            name="email"
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            required
            name="phone"
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            fullWidth
          />

        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} variant="outlined" color="inherit" sx={{ fontWeight: 700, borderRadius: '8px' }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" sx={{ fontWeight: 700, borderRadius: '8px' }}>
            {dentist ? 'Save Changes' : 'Create Dentist'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}