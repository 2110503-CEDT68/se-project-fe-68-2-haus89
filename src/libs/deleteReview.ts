export default async function deleteReview(token: string, reviewId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/reviews/${reviewId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const res = await response.json();
    throw new Error(res.message || "Failed to delete review");
  }
}
