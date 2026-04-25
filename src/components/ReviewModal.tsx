'use client'

import React, { useState } from "react";
import Rating from "@mui/material/Rating";
import updateReview from "../libs/updateReview";
import addReview from "../libs/addReview";
import deleteReview from "../libs/deleteReview"; 

interface Review {
  _id: string;
  rating: number;
  review: string;
  userId: string;
  createdAt: string;
}

interface Props {
  dentistName: string;
  dentistId: string;
  currentUserId?: string;
  initialReviews?: Review[];
  onClose: () => void;
}

export default function ReviewModal({ dentistName, currentUserId = "me", initialReviews = [], onClose }: Props) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const alreadyReviewed = reviews.some(r => r.userId === currentUserId);
  const [rating, setRating] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editError, setEditError] = useState("");

  const handleDelete = (reviewId: string) => {
    if (!window.confirm("Delete your review?")) return;
    setReviews(prev => prev.filter(x => x._id !== reviewId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!rating) { setError("Please select a rating."); return; }
      if (!text.trim()) { setError("Please write a review."); return; }
  
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Please login first");
  
        const response = await addReview(dentistId, token, rating, text.trim());
        
        setReviews(prev => [response.data, ...prev]);
        
        setRating(null); 
        setText(""); 
        setError("");
      } catch (err: any) {
        setError(err.message || "Failed to submit review");
      }
    };

  const handleStartEdit = (r: Review) => {
    setEditingId(r._id);
    setEditRating(r.rating);
    setEditText(r.review);
    setEditError("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditRating(null);
    setEditText("");
  };

  const handleSaveEdit = async (reviewId: string) => {
    if (!editRating) { setEditError("Please select a rating."); return; }
    if (!editText.trim()) { setEditError("Please write a review."); return; }

    try {
      const token = localStorage.getItem("token");
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(reviewId);

      if (token && isMongoId) {
        await updateReview(token, reviewId, editRating, editText.trim());
      }

      setReviews(prev => 
        prev.map(r => r._id === reviewId ? { 
          ...r, 
          rating: editRating, 
          review: editText.trim(),
          createdAt: new Date().toISOString() 
        } : r)
      );

      setEditingId(null); 
    } catch (err: any) {
      setEditError(err.message || "Failed to update review.");
    }
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
          {alreadyReviewed && !editingId ? (
            <p className="text-sm text-gray-400 text-center py-2">You have already reviewed this dentist.</p>
          ) : !alreadyReviewed && (
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

          <div className="overflow-y-auto flex-1 min-h-0 pr-2 custom-scrollbar">
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-2">No reviews yet.</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r._id} className="bg-gray-50 rounded-lg p-3 space-y-1">
                  
                  {editingId === r._id ? (
                      <div className="space-y-2 py-1">
                        <Rating 
                          precision={0.5} 
                          value={editRating} 
                          onChange={(_, v) => { setEditRating(v); setEditError(""); }} 
                          size="large" 
                        />
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value.slice(0, 500))}
                          placeholder="Share your experience..."
                          rows={3}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 resize-none focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                        />
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-400">{editText.length}/500</div>
                          <div className="flex items-center gap-3">
                            {editError && <span className="text-xs text-red-500">{editError}</span>}
                            <button 
                              onClick={handleCancelEdit} 
                              className="text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => handleSaveEdit(r._id)} 
                              className="bg-blue-600 text-white text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <Rating value={r.rating} precision={0.5} readOnly size="small" />
                        <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <p className="text-sm text-gray-700">{r.review}</p>
                      
                      {r.userId === currentUserId && (
                        <div className="flex justify-end gap-3 pt-1">
                          <button
                            onClick={() => handleStartEdit(r)}
                            className="text-xs font-semibold text-blue-500 hover:text-blue-700 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(r._id)}
                            className="text-xs font-semibold text-red-400 hover:text-red-600 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </>
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