import React, { useState } from "react";
import { X, Car, MapPin, Clock, Users, ShieldCheck, ArrowRight, AlertCircle, Phone } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function RequestSeatModal({ isOpen, onClose, ride, onRequestSuccess }) {
  const { token, isAuthenticated, user } = useAuth();
  const [seatsBooked, setSeatsBooked] = useState(1);
  const [pickupPoint, setPickupPoint] = useState(ride?.from || "RCPIT Main Gate");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !ride) return null;

  const totalFare = seatsBooked * (ride.pricePerSeat || 20);

  const handleRequest = async (e) => {
    e.preventDefault();
    setError("");

    if (!isAuthenticated) {
      setError("Please log in to request a seat.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/rides/${ride._id}/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          seatsBooked: Number(seatsBooked),
          pickupPoint,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to request seat");
      }

      onRequestSuccess(data.ride);
      onClose();
    } catch (err) {
      setError(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg border border-slate-200 shadow-2xl overflow-hidden my-8">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold mb-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Peer Ride Share
            </div>
            <h2 className="text-xl font-bold">Request a Seat</h2>
            <p className="text-xs text-emerald-100">Driver: {ride.driver?.name} ({ride.driver?.department})</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleRequest} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs text-slate-700">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>{ride.from}</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
              <span className="text-emerald-700">{ride.to}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200/60 text-[11px]">
              <span>Departure: <strong>{ride.departureTime}</strong></span>
              <span>Available Seats: <strong className="text-emerald-600">{ride.seatsAvailable}</strong></span>
            </div>
            <p className="text-[11px] text-slate-500">Vehicle: {ride.vehicleInfo}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Where should the driver pick you up?</label>
            <input
              type="text"
              required
              placeholder="e.g. RCPIT Main Gate, Hostel 2, Nimzari Junction"
              value={pickupPoint}
              onChange={(e) => setPickupPoint(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Seats Needed</label>
            <select
              value={seatsBooked}
              onChange={(e) => setSeatsBooked(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-600"
            >
              {[...Array(Math.min(ride.seatsAvailable, 4))].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} Seat ({i + 1} × ₹{ride.pricePerSeat} = ₹{(i + 1) * ride.pricePerSeat})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 flex justify-between items-center">
            <div>
              <span className="text-xs text-emerald-800 block font-medium">Nominal Fuel Sharing</span>
              <span className="text-xl font-extrabold text-emerald-900">Total: ₹{totalFare}</span>
            </div>
            <span className="text-xs text-emerald-700 font-bold bg-white px-3 py-1 rounded-full border border-emerald-300">
              Pay Driver in Person / UPI
            </span>
          </div>

          {!isAuthenticated ? (
            <Link
              to="/login"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm block text-center shadow-md transition"
            >
              Log in to Request Seat
            </Link>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "Sending Request..." : `Request Seat for ₹${totalFare}`}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
