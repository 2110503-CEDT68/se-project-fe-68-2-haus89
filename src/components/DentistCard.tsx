import React from 'react';
import { useRouter } from 'next/navigation';

export default function DentistCard({ dentist }: { dentist: any }) {
  const router = useRouter();

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <h2 className="text-xl font-bold text-blue-900 mb-2">{dentist.name}</h2>
      <div className="text-gray-600 text-sm mb-4 space-y-1">
        <p><span className="font-bold">Expertise:</span> {dentist.areaOfExpertise}</p>
        <p><span className="font-bold">Experience:</span> {dentist.yearsOfExperience} years</p>
      </div>
      <button 
        onClick={() => {
          localStorage.setItem("selectedDentistId", dentist._id);
          localStorage.setItem("selectedDentistName", dentist.name);
          router.push("/booking");
        }}
        className="w-full bg-blue-50 text-blue-700 font-bold py-2 rounded-lg hover:bg-blue-600 hover:text-white"
      >
        Book Appointment
      </button>
    </div>
  );
}