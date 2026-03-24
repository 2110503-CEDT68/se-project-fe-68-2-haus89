export default async function deleteDentistSlot(token: string, dentistId: string, slotId: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/dentists/${dentistId}/slots/${slotId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to delete slot");
  }
  return await response.json();
}