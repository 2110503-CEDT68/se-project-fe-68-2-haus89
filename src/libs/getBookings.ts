export interface BookingListItem {
  _id?: string;
  id?: string;
  dentist?: string | { _id?: string };
  patient?: string | { _id?: string; name?: string };
  user?: string | { _id?: string; name?: string };
  patientId?: string;
  userId?: string;
  patientName?: string;
  userName?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
}

export default async function getBookings(token: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/bookings`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch bookings');
  }

  return await response.json();
}