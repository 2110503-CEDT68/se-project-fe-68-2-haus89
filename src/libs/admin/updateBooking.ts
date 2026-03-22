// src/libs/admin/updateBooking.ts
export default async function updateBooking(
  token: string,
  bookingId: string,
  data: {
    date?: string;
    startTime?: string;
    endTime?: string;
    status?: string;
    notes?: string;
  }
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/bookings/${bookingId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.msg || errorData.message || "Failed to update booking");
  }

  return await response.json();
}
