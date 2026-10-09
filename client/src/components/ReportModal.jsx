import React, { useState } from "react";
import { X, AlertTriangle, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function ReportModal({ isOpen, onClose }) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    targetType: "General / Safety",
    subject: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

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
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setMsg("Report submitted to RCPIT admin. We will review it shortly.");
        setTimeout(() => {
          setMsg("");
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
            <span>Safety Report & Feedback</span>
          </div>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        {msg && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{msg}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 text-rose-800 rounded-xl text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold block mb-1">Category</label>
            <select
              value={formData.targetType}
              onChange={(e) => setFormData({ ...formData, targetType: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border text-sm"
            >
              <option value="General / Safety">General / Safety Complaint</option>
              <option value="Ride">Ride Sharing Issue</option>
              <option value="Vehicle">Vehicle Rental Problem</option>
              <option value="User">Student / Member Behavior</option>
            </select>
          </div>

          <div>
            <label className="font-semibold block mb-1">Subject</label>
            <input
              type="text"
              required
              placeholder="e.g. Driver did not arrive, Lost helmet"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border text-sm"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Detailed Description</label>
            <textarea
              rows={4}
              required
              placeholder="Explain the incident or issue with date, time, and details..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border text-sm"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow transition disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Confidential Report"}
          </button>
        </form>
      </div>
    </div>
  );
}
