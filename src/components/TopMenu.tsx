'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TopMenu() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    };
    
    checkToken();

    window.addEventListener('storage', checkToken);
    return () => window.removeEventListener('storage', checkToken);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    alert('Logged out successfully');
    window.location.href = '/'; 
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-extrabold text-blue-900 tracking-tight">
              Haus<span className="text-blue-500">89</span>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/dentists" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Dentists
            </Link>
            
            {isLoggedIn ? (
              <>
                <Link href="/my-booking" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  My Booking
                </Link>
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