// src/libs/userRegister.ts
export default async function userRegister(name: string, email: string, phone: string, password: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, phone, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.msg || errorData.message || "Registration failed");
  }

  return await response.json();
}