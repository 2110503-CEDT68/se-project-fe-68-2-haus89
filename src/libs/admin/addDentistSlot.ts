export default async function addDentistSlot(token: string, id: string, slotData: any) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/dentists/${id}/slots`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(slotData),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to add slot");
  }
  return await response.json();
}