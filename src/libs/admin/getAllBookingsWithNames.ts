import getUserById from '../getUserById';

export interface BookingWithNames {
  _id: string;
  user: string;
  dentist: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  patientName: string;
  dentistName: string;
}

export default async function getAllBookingsWithNames(token: string): Promise<BookingWithNames[]> {
  // Fetch all bookings
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/bookings`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch all bookings");
  }

  const result = await response.json();
  const bookings = result.data || result;

  // Fetch user names for all unique user IDs and dentist IDs
  const userIds = new Set<string>();
  bookings.forEach((booking: any) => {
    if (booking.user) userIds.add(booking.user);
    if (booking.dentist) userIds.add(booking.dentist);
  });

  // Fetch all users in parallel
  const userMap = new Map<string, string>();
  await Promise.all(
    Array.from(userIds).map(async (userId) => {
      try {
        const userData = await getUserById(token, userId);
        userMap.set(userId, userData.data?.name || userData.name || 'Unknown');
      } catch (error) {
        console.error(`Failed to fetch user ${userId}:`, error);
        userMap.set(userId, 'Unknown');
      }
    })
  );

  // Enrich bookings with names
  const enrichedBookings: BookingWithNames[] = bookings.map((booking: any) => ({
    ...booking,
    patientName: userMap.get(booking.user) || 'Unknown Patient',
    dentistName: userMap.get(booking.dentist) || 'Unknown Dentist',
  }));

  return enrichedBookings;
}
