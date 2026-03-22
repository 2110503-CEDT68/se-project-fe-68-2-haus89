// src/libs/admin/deleteBooking.ts
export default async function deleteBooking(token: string, bookingId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/bookings/${bookingId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.msg || errorData.message || "Failed to delete booking");
  }

  return await response.json();
}
