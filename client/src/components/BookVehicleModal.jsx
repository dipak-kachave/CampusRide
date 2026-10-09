import React, { useState } from "react";
import { X, Bike, MapPin, Calculator, ShieldCheck, User, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function BookVehicleModal({ isOpen, onClose, vehicle, onBookingSuccess, initialDestination, initialKm }) {
  const { token, isAuthenticated } = useAuth();
  const [destination, setDestination] = useState(initialDestination || "Shirpur Bus Stand / Market");
  const [estimatedKm, setEstimatedKm] = useState(initialKm || 10);
  const [estimatedHours, setEstimatedHours] = useState(2);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !vehicle) return null;

  const ratePerKm = vehicle.ratePerKm || 10; // Default ₹10/km
  const calculatedFare = Math.round(estimatedKm * ratePerKm);

  const handleBook = async (e) => {
    e.preventDefault();
    setError("");

    if (!isAuthenticated) {
      setError("Please log in with your college account to book a vehicle.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/rentals/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          vehicleId: vehicle._id,
          destinationOrPurpose: destination,
          estimatedKm: Number(estimatedKm),
          estimatedHours: Number(estimatedHours),
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to book vehicle");
      }

      onBookingSuccess(data.booking);
      onClose();
    } catch (err) {
      setError(err.message || "Booking request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold mb-1">
              <ShieldCheck className="w-3.5 h-3.5" /> RCPIT Verified Rental
            </div>
            <h2 className="text-xl font-bold">{vehicle.name}</h2>
            <p className="text-xs text-emerald-100">Owner: {vehicle.owner?.name || "Student"} • 📍 {vehicle.location}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content / Form */}
        <form onSubmit={handleBook} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Where are you heading in Shirpur?</label>
            <input
              type="text"
              required
              placeholder="e.g. Shirpur Bus Stand, Nimzari Naka, Karwand Market"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">Estimated Distance</label>
                <span className="text-xs font-bold text-blue-600">{estimatedKm} KM</span>
              </div>
              <input
                type="range"
                min="2"
                max="50"
                step="1"
                value={estimatedKm}
                onChange={(e) => setEstimatedKm(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">Duration (Hours)</label>
                <span className="text-xs font-bold text-slate-800">{estimatedHours} Hrs</span>
              </div>
              <input
                type="number"
                min="1"
                max="24"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Pricing Box (₹10/KM Rule) */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Distance Charge ({estimatedKm} KM × ₹{ratePerKm}/KM):</span>
              <span className="font-semibold text-slate-900">₹{calculatedFare}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Security Deposit / Verification:</span>
              <span className="font-semibold text-emerald-600">Free (College ID Verified)</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex items-baseline justify-between">
              <span className="text-xs font-bold text-slate-800">Total Estimated Amount:</span>
              <span className="text-2xl font-extrabold text-emerald-700">₹{calculatedFare}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Note to Owner (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Will return by 6:00 PM at hostel gate"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {!isAuthenticated ? (
            <Link
              to="/login"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm block text-center shadow-md transition"
            >
              Log in to Request Booking
            </Link>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "Sending Request..." : `Confirm Booking for ₹${calculatedFare}`}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
