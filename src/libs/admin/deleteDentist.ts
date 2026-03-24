export default async function deleteDentist(token: string, id: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/dentists/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to delete dentist");
  }
  return await response.json();
}