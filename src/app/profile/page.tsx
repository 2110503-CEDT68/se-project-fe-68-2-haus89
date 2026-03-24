'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextField, Button } from '@mui/material';
import getMyProfile from '../../libs/getMyProfile';
import updateMyProfile from '../../libs/updateMyProfile';
import changePassword from '../../libs/changePassword';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [profileData, setProfileData] = useState({ name: '', email: '', phone: '' });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }
        
        const data = await getMyProfile(token);
        const user = data.data;
        setProfileData({
          name: user.name || '',
          email: user.email || '', 
          phone: user.phone || '',
        });
      } catch (err) {
        alert('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const token = localStorage.getItem('token')!;
      await updateMyProfile(token, profileData);
      alert('Profile updated successfully! 🎉');
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword.length < 6) {
      alert("New password must be at least 6 characters");
      return;
    }

    setUpdatingPassword(true);
    try {
      const token = localStorage.getItem('token')!;
      await changePassword(token, passwordData);
      alert('Password changed successfully! 🔐');
      setPasswordData({ currentPassword: '', newPassword: '' });
    } catch (err: any) {
      alert(err.message || 'Failed to change password');
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (loading) return <div className="text-center mt-20 text-xl font-bold text-gray-500">Loading Profile...</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-blue-900 mb-8">My Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Personal Information</h2>
            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
              <TextField
                label="Full Name"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Email (Cannot be changed)"
                value={profileData.email}
                disabled 
                fullWidth
              />
              <TextField
                label="Phone Number"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                required
                fullWidth
              />
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                disabled={updatingProfile}
                sx={{ fontWeight: 700, borderRadius: '8px', py: 1.5, mt: 2 }}
              >
                {updatingProfile ? 'Saving...' : 'Save Profile'}
              </Button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Security</h2>
            <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
              <TextField
                label="Current Password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                required
                fullWidth
                helperText="Must be at least 6 characters"
              />
              <Button 
                type="submit" 
                variant="contained" 
                color="error" 
                disabled={updatingPassword}
                sx={{ fontWeight: 700, borderRadius: '8px', py: 1.5, mt: 2 }}
              >
                {updatingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </div>

        </div>
      </div>
    </main>
  );
}