import React, { useState } from "react";
import { X, Star, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function RatingModal({ isOpen, onClose, ride, toUser, onRatingSuccess }) {
  const { token } = useAuth();
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");
  const [hoverScore, setHoverScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !ride || !toUser) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rideId: ride._id,
          toUserId: toUser._id || toUser.id || toUser,
          score,
          comment,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit rating.");
      }

      if (onRatingSuccess) onRatingSuccess();
      onClose();
    } catch (err) {
      setError(err.message || "Error submitting review.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-md border border-slate-200 shadow-2xl overflow-hidden my-8">
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur">
              <Star className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">Rate Co-Commuter</h2>
              <p className="text-[11px] text-amber-100">Review for: {toUser.name || "Student"}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="text-center space-y-2 py-2">
            <p className="text-xs text-slate-500">How was your campus commute experience?</p>
            <div className="flex justify-center items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setScore(star)}
                  onMouseEnter={() => setHoverScore(star)}
                  onMouseLeave={() => setHoverScore(0)}
                  className="p-1 focus:outline-none transition transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverScore || score)
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-200"
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-slate-700 block">
              {score === 5 && "Excellent (5/5) 🌟"}
              {score === 4 && "Good Commute (4/5) 👍"}
              {score === 3 && "Average (3/5) 😐"}
              {score === 2 && "Poor (2/5) 👎"}
              {score === 1 && "Terrible (1/5) ⚠️"}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Feedback / Comment (Optional)
            </label>
            <textarea
              rows="3"
              placeholder="e.g. On-time, polite driving, friendly conversation!"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
            ></textarea>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Rating"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
