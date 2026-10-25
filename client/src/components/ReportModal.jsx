import React, { useState } from "react";
import { X, AlertTriangle, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function ReportModal({ isOpen, onClose, reportedUser, ride }) {
  const { token } = useAuth();
  const [reason, setReason] = useState("Inappropriate Behavior");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const reasons = [
    "Inappropriate Behavior",
    "Unsafe Driving",
    "No Show",
    "Overcharging / Payment Demand",
    "Harassment",
    "Fake Information",
    "Other",
  ];

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reportedUser: reportedUser?._id || reportedUser?.id || reportedUser || null,
          ride: ride?._id || ride || null,
          reason,
          description,
          subject: `${reason} Safety Incident`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg("Report submitted to RCPIT admin. We will investigate promptly.");
        setTimeout(() => {
          setMsg("");
          setDescription("");
          onClose();
        }, 2000);
      } else {
        setError(data.message || "Failed to submit report");
      }
    } catch (err) {
      setError(err.message || "Error submitting report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md border border-slate-200 shadow-2xl p-6 space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
            <AlertTriangle className="w-5 h-5" />
            <span>Safety Report & Conduct Flag</span>
          </div>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
          </button>
        </div>

        {msg && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{msg}</span>
          </div>
        )}

        {error && <div className="p-3 bg-rose-50 text-rose-800 rounded-xl text-xs">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-semibold block mb-1">Incident Category / Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-rose-500 outline-none"
            >
              {reasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold block mb-1">Detailed Description of What Happened</label>
            <textarea
              required
              rows="4"
              placeholder="Please provide specific details: time, date, behavior, or safety issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500 outline-none"
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
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Incident Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
