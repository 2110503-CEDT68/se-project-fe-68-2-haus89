import React from 'react';
import { Button } from "@mui/material";

export default function BookingCard({ booking }: { booking: any }) {
  if (!booking) return null;

  return (
    <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 mb-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-sm text-gray-500 font-bold mb-1">Dentist</p>
          <h2 className="text-2xl font-bold text-gray-800">{booking.dentist?.name || "คุณหมอ"}</h2>
          <p className="text-blue-600">{booking.dentist?.areaOfExpertise || "ทันตแพทย์"}</p>
        </div>
        <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
          {booking.status || "CONFIRMED"}
        </span>
      </div>

      <hr className="my-6 border-gray-100" />

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <p className="text-sm text-gray-500 font-bold mb-1">Date</p>
          <p className="text-lg font-medium text-gray-800">
            {new Date(booking.date).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 font-bold mb-1">Time</p>
          <p className="text-lg font-medium text-gray-800">
            {booking.startTime} - {booking.endTime}
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <Button variant="outlined" color="primary" fullWidth>
          Reschedule
        </Button>
        <Button variant="outlined" color="error" fullWidth>
          Cancel Booking
        </Button>
      </div>
    </div>
  );
}