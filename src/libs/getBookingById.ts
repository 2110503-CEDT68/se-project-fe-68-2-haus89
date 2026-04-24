export interface BookingLookupResponse {
  _id: string;
  patient?: string | { _id?: string; name?: string };
  user?: string | { _id?: string; name?: string };
  patientId?: string;
  userId?: string;
}

export default async function getBookingById(token: string, bookingId: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/bookings/${bookingId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch booking');
  }

  return await response.json();
}