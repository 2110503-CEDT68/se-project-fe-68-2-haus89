// src/libs/createBooking.ts
export interface CreateBookingParams {
  dentistId: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

export default async function createBooking(
  token: string,
  booking: CreateBookingParams
) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      dentist: booking.dentistId,
      date: new Date(booking.date).toISOString(),
      startTime: booking.startTime,
      endTime: booking.endTime,
      notes: booking.notes,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create booking");
  }

  return await response.json();
}
