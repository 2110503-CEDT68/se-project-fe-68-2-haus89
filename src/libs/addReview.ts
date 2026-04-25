// src/libs/addReview.ts
export default async function addReview(dentistId: string, token: string, rating: number, review: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/dentists/${dentistId}/reviews`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            rating: rating,
            review: review
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to submit review");
    }

    return await response.json();
}