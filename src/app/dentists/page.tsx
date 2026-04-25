'use client'

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Dialog } from "@mui/material";
import getDentists from "../../libs/getDentists";
import BookingForm from "../../components/BookingForm";
import ReviewModal from "../../components/ReviewModal";

export default function DentistsPage() {
  const router = useRouter();
  
  const [dentists, setDentists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDentist, setSelectedDentist] = useState<any>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [reviewDentist, setReviewDentist] = useState<any>(null);

  useEffect(() => {
      const fetchDentists = async () => {
        try {
          const data = await getDentists(); 
          
          const dentistsArray = data.data?.dentists || data.data || [];
          setDentists(dentistsArray);
        } catch (err) {
          setError("Unable to fetch data");
        } finally {
        setLoading(false); 
      }
    };

    fetchDentists();
  }, [router]);

  useEffect(() => {
    const pendingBookingId = localStorage.getItem("pendingBooking");
    const token = localStorage.getItem("token");
    
    if (pendingBookingId && dentists.length > 0 && token) {
      const dentist = dentists.find(d => d._id === pendingBookingId);
      if (dentist) {
        setSelectedDentist(dentist);
        setShowBookingForm(true);
        localStorage.removeItem("pendingBooking");
      }
    }
  }, [dentists]);

  const handleBookingClick = (dentist: any) => {
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.setItem("pendingBooking", dentist._id);
      router.push("/login?redirect=/dentists");
    } else {
      setSelectedDentist(dentist);
      setShowBookingForm(true);
    }
  };

  const handleBookingSuccess = () => {
    setShowBookingForm(false);
    setSelectedDentist(null);
    alert("Booking created successfully! Check your appointments.");
    router.push("/my-booking");
  };

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
          <div className="text-center text-gray-500 text-xl mt-20">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dentists.map((dentist) => (
              <div key={dentist._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h2 className="text-xl font-bold text-blue-900">{dentist.name}</h2>
                    {dentist.totalReviews > 0 && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                        <span className="text-yellow-500">★</span>
                        <span className="font-semibold">{dentist.averageRating?.toFixed(1)}</span>
                        <span className="text-gray-400">({dentist.totalReviews})</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setReviewDentist(dentist)}
                    className="text-xs font-medium text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors ml-2 mt-1"
                  >★ Reviews</button>
                </div>
                
                <div className="text-gray-600 text-sm mb-4 space-y-1">
                  <p><span className="font-bold">Expertise:</span> {dentist.areaOfExpertise}</p>
                  <p><span className="font-bold">Experience:</span> {dentist.yearsOfExperience} years</p>
                </div>
                
                <button
                  onClick={() => handleBookingClick(dentist)}
                  className="w-full bg-blue-50 text-blue-700 font-bold py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                >
                  Book Appointment
                </button>
              </div>
            ))}
            
            {dentists.length === 0 && !error && (
              <div className="col-span-full text-center text-gray-500 py-10">
                No dentists in the system yet (Admin may need to add dentists first)
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog
        open={showBookingForm && !!selectedDentist}
        onClose={() => {
          setShowBookingForm(false);
          setSelectedDentist(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        {selectedDentist && (
          <div className="p-6">
            <BookingForm
              dentistId={selectedDentist._id}
              dentistName={selectedDentist.name}
              onSuccess={handleBookingSuccess}
              onCancel={() => {
                setShowBookingForm(false);
                setSelectedDentist(null);
              }}
            />
          </div>
        )}
      </Dialog>

      {reviewDentist && (
        <ReviewModal
          dentistName={reviewDentist.name}
          dentistId={reviewDentist._id}
          averageRating={reviewDentist.averageRating}
          totalReviews={reviewDentist.totalReviews}
          onClose={() => setReviewDentist(null)}
        />
      )}
    </main>
  );
}