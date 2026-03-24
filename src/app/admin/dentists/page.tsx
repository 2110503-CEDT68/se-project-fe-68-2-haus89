'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import getDentists from '../../../libs/getDentists'; 
import createDentist from '../../../libs/admin/createDentist';
import updateDentist from '../../../libs/admin/updateDentist';
import deleteDentist from '../../../libs/admin/deleteDentist';
import AdminDentistModal from '../../../components/AdminDentistModal';
import AdminSlotModal from '../../../components/AdminSlotModal';

export default function AdminDentistsPage() {
  const router = useRouter();
  const [dentists, setDentists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDentist, setEditingDentist] = useState<any>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingDentist, setDeletingDentist] = useState<any>(null);
  
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [selectedDentistForSlots, setSelectedDentistForSlots] = useState<any>(null);

  const fetchDentistsList = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }
        
        const data = await getDentists(token);
        const newDentistsArray = data.data?.dentists || data.data || [];
        
        setDentists(newDentistsArray);
  
        setSelectedDentistForSlots((prev: any) => prev ? newDentistsArray.find((d: any) => d._id === prev._id) || prev : null);
        setEditingDentist((prev: any) => prev ? newDentistsArray.find((d: any) => d._id === prev._id) || prev : null);
  
      } catch (err: any) {
        setError(err.message || 'Failed to load dentists');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchDentistsList();
  }, [router]);

  const handleSaveDentist = async (formData: any) => {
    try {
      const token = localStorage.getItem('token')!;
      if (editingDentist) {
        await updateDentist(token, editingDentist._id, formData);
        alert('Dentist updated successfully!');
      } else {
        await createDentist(token, formData);
        alert('Dentist created successfully!');
      }
      setModalOpen(false);
      fetchDentistsList(); 
    } catch (err: any) {
      alert(err.message || 'Failed to save dentist');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingDentist) return;
    try {
      const token = localStorage.getItem('token')!;
      await deleteDentist(token, deletingDentist._id);
      
      setDentists(prev => prev.filter(d => d._id !== deletingDentist._id));
      setDeleteDialogOpen(false);
      setDeletingDentist(null);
      alert('Dentist deleted successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to delete dentist');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-900">Manage Dentists</h1>
            <p className="text-gray-500 mt-1">Add, update, or remove dentists</p>
          </div>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ fontWeight: 700, borderRadius: '8px', px: 3, py: 1.5 }}
            onClick={() => {
              setEditingDentist(null);
              setModalOpen(true);
            }}
          >
            + Add New Dentist
          </Button>
        </div>

        {error && <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-6 font-bold">{error}</div>}

        {loading ? (
          <div className="text-center text-gray-500 text-xl font-bold mt-20">กำลังโหลดข้อมูล...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {dentists.map((dentist) => (
              <div key={dentist._id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md overflow-hidden">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-blue-900 truncate">{dentist.name}</h3>
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                      {dentist.yearsOfExperience} Yrs Exp
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-600 mb-4">{dentist.areaOfExpertise}</p>
                  
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 space-y-1">
                    <p>📧 {dentist.email}</p>
                    <p>📱 {dentist.phone}</p>
                  </div>
                </div>

                <div className="px-5 pb-4 flex gap-2">
                  <Button 
                      variant="outlined" color="primary" size="small" fullWidth sx={{ fontWeight: 700, borderRadius: '6px' }}
                      onClick={() => {
                        setSelectedDentistForSlots(dentist);
                        setSlotModalOpen(true);
                      }}
                    >
                      ⏰ Slots ({dentist.availableSlots?.length || 0})
                    </Button>
                  <Button 
                    variant="outlined" color="info" size="small" fullWidth sx={{ fontWeight: 700, borderRadius: '6px' }}
                    onClick={() => {
                      setEditingDentist(dentist);
                      setModalOpen(true);
                    }}
                  >
                    ✏️ Edit
                  </Button>
                  <Button 
                    variant="outlined" color="error" size="small" fullWidth sx={{ fontWeight: 700, borderRadius: '6px' }}
                    onClick={() => {
                      setDeletingDentist(dentist);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    🗑️ Del
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      <AdminDentistModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        dentist={editingDentist} 
        onSave={handleSaveDentist} 
      />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: 800, color: '#dc2626' }}>Delete Dentist</DialogTitle>
        <DialogContent>
          Are you sure you want to delete <b>{deletingDentist?.name}</b>? <br/>
          <span className="text-red-500 text-sm">Warning: This will also delete all their bookings!</span>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined" color="inherit">Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>
      
      <AdminSlotModal
          open={slotModalOpen}
          onClose={() => setSlotModalOpen(false)}
          dentist={selectedDentistForSlots}
          onRefresh={fetchDentistsList} 
        />
            
    </main>
  );
}