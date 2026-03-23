// src/libs/getDentistAvailability.ts
export interface AvailableSlot {
  _id?: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export default async function getDentistAvailability(
  dentistId: string,
  token?: string
): Promise<AvailableSlot[]> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/bookings/dentist/${dentistId}/availability`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch availability");
  }

  const data = await response.json();
  // Handle various response shapes
  return data.data?.availableSlots || data.data || data.availableSlots || [];
}
