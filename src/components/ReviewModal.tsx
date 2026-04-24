'use client'

import React, { useState } from "react";
import Rating from "@mui/material/Rating";
import deleteReview from "../libs/deleteReview";

interface Review {
  _id: string;
  rating: number;
  review: string;
  dentist: string;
  user: string;
  createdAt: string;
}

interface Props {
  dentistName: string;
  dentistId: string;
  currentUserId?: string;
  initialReviews?: Review[];
  onClose: () => void;
}

export default function ReviewModal({ dentistName, dentistId, currentUserId = "me", initialReviews = [], onClose }: Props) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const alreadyReviewed = reviews.some(r => r.user === currentUserId);
  const [rating, setRating] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm("Delete your review?")) return;
    try {
      const token = localStorage.getItem("token") || "";
      await deleteReview(token, reviewId);
      setReviews(prev => prev.filter(x => x._id !== reviewId));
    } catch (e: any) {
      setError("Failed to delete review.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) { setError("Please select a rating."); return; }
    if (!text.trim()) { setError("Please write a review."); return; }
    const createdAt = new Date().toISOString();

    console.log(rating, text.trim(), currentUserId, createdAt);
  
    // TODO: Implement the post review instead of setReviews 
    setReviews(prev => [{ _id: Date.now().toString(), rating, review: text.trim(), user: currentUserId, dentist: dentistId, createdAt }, ...prev]);
    setRating(null); 
    setText(""); 
    setError("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[85vh] flex flex-col">

        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-blue-900">Reviews</h2>
            <p className="text-xl text-gray-400">{dentistName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="flex flex-col flex-1 min-h-0 px-5 py-4 gap-4">
          {alreadyReviewed ? (
            <p className="text-sm text-gray-400 text-center py-2">You have already reviewed this dentist.</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2">
              <Rating precision={0.5} value={rating} onChange={(_, v) => { setRating(v); setError(""); }} size="large" />
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, 500))}
                placeholder="Share your experience…"
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 resize-none focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{text.length}/500</span>
                {error && <span className="text-xs text-red-500">{error}</span>}
                <button type="submit" className="bg-blue-600 text-white text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
                  Submit
                </button>
              </div>
            </form>
          )}

          {reviews.length > 0 && <hr className="border-gray-100" />}

          <div className="overflow-y-auto flex-1 min-h-0">
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-2">No reviews yet.</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r._id} className="bg-gray-50 rounded-lg p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <Rating value={r.rating} precision={0.5} readOnly size="small" />
                    <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p className="text-sm text-gray-700">{r.review}</p>
                  {r.user === currentUserId && (
                    <button
                      onClick={() => handleDelete(r._id)}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
