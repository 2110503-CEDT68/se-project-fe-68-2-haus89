import getUserById from './getUserById';

export interface BookingWithNames {
  _id: string;
  user: string;
  dentist: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  patientName?: string;
  dentistName?: string;
  [key: string]: any;
}

/**
 * Enriches bookings array with patient and dentist names
 * @param bookings - Array of booking objects
 * @param token - Auth token
 * @returns Bookings with patientName and dentistName fields
 */
export async function enrichBookingsWithNames(
  bookings: any[],
  token: string
): Promise<BookingWithNames[]> {
  if (!bookings || bookings.length === 0) return [];

  // Collect all unique user IDs and dentist IDs
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
        const name = userData.data?.name || userData.name || 'Unknown';
        userMap.set(userId, name);
      } catch (error) {
        console.error(`Failed to fetch user ${userId}:`, error);
        userMap.set(userId, 'Unknown');
      }
    })
  );

  // Enrich bookings with names
  return bookings.map((booking: any) => ({
    ...booking,
    patientName: userMap.get(booking.user) || 'Unknown Patient',
    dentistName: userMap.get(booking.dentist) || 'Unknown Dentist',
  }));
}
