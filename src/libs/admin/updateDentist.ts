export default async function updateDentist(token: string, id: string, data: any) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/dentists/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to update dentist");
  }
  return await response.json();
}