'use client'

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    alert("Logged out successfully");
    router.refresh(); 
  };

  return (
    <main className="min-h-screen bg-blue-50 flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-5xl font-extrabold text-blue-900 mb-4 drop-shadow-sm">
        Dentist Booking
      </h1>
      <p className="text-lg text-gray-600 mb-8 max-w-xl">
        Book appointments with expert dentists - convenient, fast, 24/7
      </p>

      <div className="flex gap-4">
        {isLoggedIn ? (
          <>
            <Link href="/dentists" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 shadow-md transition-colors">
              Find a Dentist
            </Link>
            <button onClick={handleLogout} className="bg-red-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-600 shadow-md transition-colors">
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 shadow-md transition-colors">
              Log In
            </Link>
            <Link href="/register" className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors">
              Register
            </Link>
          </>
        )}
      </div>
    </main>
  );
}