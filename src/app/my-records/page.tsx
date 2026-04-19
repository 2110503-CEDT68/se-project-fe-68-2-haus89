'use client'

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import getMyRecords from "../../libs/getMyRecords";
import RecordCard from "../../components/RecordCard"; 

export default function MyRecordsPage() {
  const router = useRouter();
  const [records, setRecords] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState<string>("");

  const fetchMyRecords = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const data = await getMyRecords(token);
      setRecords(data.data || []);
      setError("");
    } catch (err: any) {
      setError("Unable to fetch your dental records at the moment.");
      setRecords([]);
    }
  };

  useEffect(() => {
    const loadRecords = async () => {
      setLoading(true);
      // Get user role from localStorage
      const role = localStorage.getItem("role") || "";
      setUserRole(role);
      await fetchMyRecords();
      setLoading(false);
    };

    loadRecords();
    localStorage.setItem('recordsLastSeen', new Date().toISOString());
    window.dispatchEvent(new Event('recordsViewed'));
  }, [router]);

  return (
    <main className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-blue-900">My Dental Records</h1>
          <Link href="/" className="text-blue-600 font-bold hover:underline">
            ← Back to Home
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 text-xl font-bold mt-20">Loading records...</div>
        ) : records && records.length > 0 ? (
          <div className="space-y-4">
            {records.map((record: any, index: number) => (
              <RecordCard
                key={record._id || index}
                record={record}
                userRole={userRole}
                onRecordUpdated={fetchMyRecords}
                onRecordDeleted={fetchMyRecords}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white p-10 rounded-xl shadow-md border border-gray-100 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">You don't have any past dental records.</h2>
            <p className="text-gray-600 mb-8">{error || "Once you complete an appointment, your treatment history will appear here."}</p>
            <Link href="/dentists" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700">
              Book an Appointment
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}