'use client'

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import getDentists from "../../libs/getDentists";

export default function DentistsPage() {
  const router = useRouter();
  
  const [dentists, setDentists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
      const fetchDentists = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) { return; }
  
          const data = await getDentists(token); 
          
          const dentistsArray = data.data?.dentists || data.data || [];
          setDentists(dentistsArray);
        } catch (err) {
          setError("ไม่สามารถดึงข้อมูลได้");
        } finally {
        setLoading(false); 
      }
    };

    fetchDentists();
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Our Dentists</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-6 text-center font-bold">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-500 text-xl mt-20">กำลังโหลดข้อมูล...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dentists.map((dentist) => (
              <div key={dentist._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h2 className="text-xl font-bold text-blue-900 mb-2">{dentist.name}</h2>
                
                <div className="text-gray-600 text-sm mb-4 space-y-1">
                  <p><span className="font-bold">Expertise:</span> {dentist.areaOfExpertise}</p>
                  <p><span className="font-bold">Experience:</span> {dentist.yearsOfExperience} years</p>
                </div>
                
                <button 
                  onClick={() => alert(`In developing`)}
                  className="w-full bg-blue-50 text-blue-700 font-bold py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                >
                  Book Appointment
                </button>
              </div>
            ))}
            
            {dentists.length === 0 && !error && (
              <div className="col-span-full text-center text-gray-500 py-10">
                ยังไม่มีรายชื่อทันตแพทย์ในระบบครับ (อาจจะต้องให้ Admin เพิ่มข้อมูลเข้ามาก่อน)
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}