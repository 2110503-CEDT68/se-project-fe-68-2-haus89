'use client'

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import getMyBooking from "../../libs/getMyBooking";
import BookingCard from "../../components/BookingCard"; 

export default function MyBookingPage() {
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMyBooking = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const data = await getMyBooking(token);
      setBooking(data.data?.booking || data.data);
      setError("");
    } catch (err: any) {
      setError("คุณยังไม่มีการจองคิวในระบบครับ");
      setBooking(null);
    }
  };

  useEffect(() => {
    const loadBooking = async () => {
      setLoading(true);
      await fetchMyBooking();
      setLoading(false);
    };

    loadBooking();
  }, [router]);

  return (
    <main className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-blue-900">My Appointment</h1>
          <Link href="/" className="text-blue-600 font-bold hover:underline">
            ← Back to Home
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 text-xl font-bold mt-20">กำลังโหลดข้อมูล...</div>
        ) : booking ? (
          <BookingCard booking={booking} onBookingUpdate={fetchMyBooking} />
        ) : (
          <div className="bg-white p-10 rounded-xl shadow-md border border-gray-100 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">You don't have any appointments yet.</h2>
            <p className="text-gray-600 mb-8">{error}</p>
            <Link href="/dentists" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700">
              Book an Appointment Now
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}