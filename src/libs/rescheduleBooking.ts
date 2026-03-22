// src/libs/rescheduleBooking.ts
export interface RescheduleBookingParams {
  date: string;
  startTime: string;
  endTime: string;
}

export default async function rescheduleBooking(
  token: string,
  bookingId: string,
  newSchedule: RescheduleBookingParams
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/bookings/${bookingId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        date: new Date(newSchedule.date).toISOString(),
        startTime: newSchedule.startTime,
        endTime: newSchedule.endTime,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to reschedule booking");
  }

  return await response.json();
}
