// src/libs/addReview.ts
export default async function addReview(dentistId: string, token: string, rating: number, review: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/reviews`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            dentist: dentistId,
            rating: rating,
            review: review
        }),
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || `Failed to submit review (${response.status})`);
    }

    return await response.json();
}