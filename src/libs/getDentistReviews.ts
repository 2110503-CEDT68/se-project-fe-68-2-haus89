export default async function getDentistReviews(token: string, dentistId: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/reviews/dentist/${dentistId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || `Failed to fetch reviews (${response.status})`);
    }

    return await response.json();
}
