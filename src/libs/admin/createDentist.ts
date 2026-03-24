export default async function createDentist(token: string, data: any) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/dentists`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to create dentist");
  }
  return await response.json();
}