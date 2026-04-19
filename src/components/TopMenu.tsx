'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import getMyRecords from '../libs/getMyRecords';

export default function TopMenu() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDentist, setIsDentist] = useState(false);
  const [role, setRole] = useState('');
  const [recordNotifCount, setRecordNotifCount] = useState(0);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const r = localStorage.getItem('role') || '';
      setIsLoggedIn(!!token);
      setIsAdmin(r === 'admin');
      setIsDentist(r === 'dentist');
      setRole(r);
    };
    
    checkAuth();

    const fetchNotifCount = async () => {
      const token = localStorage.getItem('token');
      const r = localStorage.getItem('role') || '';
      if (!token || r !== 'user') return;
      try {
        const data = await getMyRecords(token);
        const records: any[] = data.data || [];
        const lastSeen = localStorage.getItem('recordsLastSeen');
        const count = records.filter((rec) => {
          if (!lastSeen) return true;
          return rec.updatedAt && new Date(rec.updatedAt) > new Date(lastSeen);
        }).length;
        setRecordNotifCount(count);
      } catch {
        // ignore
      }
    };
    fetchNotifCount();

    window.addEventListener('storage', checkAuth);
    window.addEventListener('authChange', checkAuth);
    window.addEventListener('recordsViewed', () => setRecordNotifCount(0));
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authChange', checkAuth);
      window.removeEventListener('recordsViewed', () => setRecordNotifCount(0));
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    setIsAdmin(false);
    setIsDentist(false);
    setRole('');
    
    window.dispatchEvent(new Event('authChange'));
    
    alert('Logged out successfully');
    window.location.href = '/'; 
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-extrabold text-blue-900 tracking-tight">
              Real<span className="text-blue-500">Haus89</span>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/dentists" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Dentists
            </Link>
            
            {isLoggedIn ? (
              <>
                <Link href="/my-records" className="relative text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  My Records
                  {recordNotifCount > 0 && (
                    <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {recordNotifCount}
                    </span>
                  )}
                </Link>
                <Link href="/my-booking" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  My Booking
                </Link>
                <Link href="/profile" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  My Profile
                </Link>
                {isAdmin && (
                  <Link href="/admin/dashboard" className="text-amber-600 hover:text-amber-700 font-bold transition-colors">
                    Dashboard
                  </Link>
                )}
                {isDentist && (
                  <Link href="/dentist/slots" className="text-emerald-600 hover:text-emerald-700 font-bold transition-colors">
                    My Slots
                  </Link>
                )}
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-500 capitalize">
                  {role}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-100 transition-colors text-sm"
                >
                  Log Out
                </button>
              </>
            ) : (
              <Link href="/login" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors text-sm shadow-sm">
                Log In
              </Link>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}