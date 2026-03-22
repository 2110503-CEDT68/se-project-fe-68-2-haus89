'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import getMe from '../../../libs/getMe';
import getAllBookings from '../../../libs/admin/getAllBookings';
import updateBooking from '../../../libs/admin/updateBooking';
import deleteBooking from '../../../libs/admin/deleteBooking';
import AdminEditBookingModal from '../../../components/AdminEditBookingModal';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit modal state
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Delete confirmation state
  const [deletingBooking, setDeletingBooking] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Verify admin role
        const meData = await getMe(token);
        const role = meData.data?.role || meData.role;
        if (role !== 'admin') {
          alert('Access denied. Admin only.');
          router.push('/');
          return;
        }

        // Fetch all bookings
        const bookingsData = await getAllBookings(token);
        const bookingsArray =
          bookingsData.data?.bookings ||
          bookingsData.data ||
          [];
        setBookings(bookingsArray);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  const handleEditClick = (booking: any) => {
    setEditingBooking(booking);
    setEditModalOpen(true);
  };

  const handleEditSave = async (bookingId: string, data: any) => {
    const token = localStorage.getItem('token')!;
    await updateBooking(token, bookingId, data);

    // Refresh list
    const bookingsData = await getAllBookings(token);
    const bookingsArray =
      bookingsData.data?.bookings ||
      bookingsData.data ||
      [];
    setBookings(bookingsArray);
  };

  const handleDeleteClick = (booking: any) => {
    setDeletingBooking(booking);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingBooking) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('token')!;
      await deleteBooking(token, deletingBooking._id);

      // Remove from local state
      setBookings((prev) => prev.filter((b) => b._id !== deletingBooking._id));
      setDeleteDialogOpen(false);
      setDeletingBooking(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete booking');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { bg: 'bg-green-100', text: 'text-green-700', chip: 'success' as const };
      case 'completed':
        return { bg: 'bg-blue-100', text: 'text-blue-700', chip: 'primary' as const };
      case 'cancelled':
        return { bg: 'bg-red-100', text: 'text-red-700', chip: 'error' as const };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', chip: 'default' as const };
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              Manage all booking appointments
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold">
              {bookings.length} Booking{bookings.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-6 text-center font-bold">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="text-center text-gray-500 text-xl font-bold mt-20">
            กำลังโหลดข้อมูล...
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow-md border border-gray-100 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              No bookings found
            </h2>
            <p className="text-gray-500">
              ยังไม่มีการจองคิวในระบบ
            </p>
          </div>
        ) : (
          /* Bookings Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {bookings.map((booking) => {
              const statusColor = getStatusColor(booking.status);
              return (
                <div
                  key={booking._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-5 pb-0">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">
                          Dentist
                        </p>
                        <h3 className="text-lg font-bold text-blue-900 truncate">
                          {booking.dentist?.name || 'N/A'}
                        </h3>
                        <p className="text-sm text-blue-500 truncate">
                          {booking.dentist?.areaOfExpertise || ''}
                        </p>
                      </div>
                      <Chip
                        label={booking.status?.toUpperCase() || 'N/A'}
                        color={statusColor.chip}
                        size="small"
                        sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                      />
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="px-5 py-3">
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-xs text-gray-400 font-bold mb-1">Patient</p>
                      <p className="text-sm font-bold text-gray-800">
                        {booking.user?.name || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {booking.user?.email || ''}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-400 font-bold mb-1">Date</p>
                        <p className="text-sm font-medium text-gray-700">
                          {new Date(booking.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-bold mb-1">Time</p>
                        <p className="text-sm font-medium text-gray-700">
                          {booking.startTime} - {booking.endTime}
                        </p>
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-400 font-bold mb-1">Notes</p>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {booking.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="px-5 pb-4 pt-2 flex gap-3">
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      fullWidth
                      onClick={() => handleEditClick(booking)}
                      sx={{ fontWeight: 700, borderRadius: '8px', textTransform: 'none' }}
                    >
                      ✏️ Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      fullWidth
                      onClick={() => handleDeleteClick(booking)}
                      sx={{ fontWeight: 700, borderRadius: '8px', textTransform: 'none' }}
                    >
                      🗑️ Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AdminEditBookingModal
        open={editModalOpen}
        booking={editingBooking}
        onClose={() => {
          setEditModalOpen(false);
          setEditingBooking(null);
        }}
        onSave={handleEditSave}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeletingBooking(null);
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#dc2626' }}>
          Delete Booking
        </DialogTitle>
        <DialogContent>
          <p className="text-gray-600">
            Are you sure you want to delete this booking?
          </p>
          {deletingBooking && (
            <div className="bg-red-50 p-3 rounded-lg mt-3">
              <p className="font-bold text-gray-800">
                {deletingBooking.dentist?.name || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">
                Patient: {deletingBooking.user?.name || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">
                {new Date(deletingBooking.date).toLocaleDateString()} •{' '}
                {deletingBooking.startTime} - {deletingBooking.endTime}
              </p>
            </div>
          )}
          <p className="text-red-500 text-sm font-bold mt-3">
            This action cannot be undone.
          </p>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setDeletingBooking(null);
            }}
            variant="outlined"
            color="inherit"
            disabled={deleting}
            sx={{ fontWeight: 700, borderRadius: '8px' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={deleting}
            sx={{ fontWeight: 700, borderRadius: '8px' }}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </main>
  );
}
