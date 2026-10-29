import React, { useState, useEffect } from "react";
import { X, Car, MapPin, Clock, Users, ShieldCheck, ArrowRight, AlertCircle, Star, Heart, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { formatDepartureTime } from "../utils/dateFormatter";

export default function RequestSeatModal({ isOpen, onClose, ride, onRequestSuccess }) {
  const { token, isAuthenticated, user } = useAuth();
  const [seatsBooked, setSeatsBooked] = useState(1);
  const [pickupPoint, setPickupPoint] = useState(ride?.from || "RCPIT Main Gate");
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isVerified = user?.isVerified || user?.verificationStatus === "verified";
  const isFemale = user?.gender === "Female";
  const isBlockedByGender = ride?.womenOnly && !isFemale;

  useEffect(() => {
    fetch("/api/locations")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.locations) {
          setLocations(data.locations);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (ride?.from) {
      setPickupPoint(ride.from);
    }
  }, [ride]);

  if (!isOpen || !ride) return null;

  const totalFare = seatsBooked * (ride.pricePerSeat || 20);

  const handleRequest = async (e) => {
    e.preventDefault();
    setError("");

    if (!isAuthenticated) {
      setError("Please log in to request a seat.");
      return;
    }

    if (!isVerified) {
      setError("Verification required: Please upload your RCPIT Student/Staff ID Card first.");
      return;
    }

    if (isBlockedByGender) {
      setError("This ride is reserved for female-identified students/staff only.");
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

      if (res.status === 401) {
        throw new Error("Your session has expired. Please log in again to book a seat.");
      }

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error(`Server connection error (${res.status}). Please try again.`);
      }

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
        <div className="bg-gradient-to-r from-[#00AFF5] to-blue-600 text-white p-6 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold mb-1">
              <ShieldCheck className="w-3.5 h-3.5" /> CampusRide Booking
            </div>
            <h2 className="text-xl font-bold">Book a Seat</h2>
            <p className="text-xs text-sky-100">
              Split campus travel costs • No commercial fee
            </p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition cursor-pointer">
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

          {/* STEP 4 #4: Driver Trust Profile Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-sm">{ride.driver?.name}</span>
                {ride.driver?.isVerified && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                {ride.driver?.department} • {ride.driver?.year}
              </p>
              <div className="flex items-center gap-2.5 pt-0.5">
                <span className="flex items-center gap-1 text-amber-600 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {(ride.driver?.ratingAvg || ride.driver?.rating || 5.0).toFixed(1)}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600 font-semibold">
                  {ride.driver?.ridesCompleted || 0} completed rides
                </span>
              </div>
            </div>

            <Link
              to={`/profile/${ride.driver?._id || ride.driver}`}
              target="_blank"
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition whitespace-nowrap"
            >
              View Profile
            </Link>
          </div>

          {/* Women-Only Banner */}
          {ride.womenOnly && (
            <div className="p-3 rounded-2xl bg-pink-50 border border-pink-200 text-pink-800 text-xs flex items-center gap-2">
              <Heart className="w-4 h-4 fill-pink-500 text-pink-500 shrink-0" />
              <div>
                <strong className="block font-bold">Women-Only Campus Ride</strong>
                <span className="text-[11px]">
                  Driver requested female co-passengers only.
                </span>
              </div>
            </div>
          )}

          {/* Route Info */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs text-slate-700">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>{ride.from}</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
              <span className="text-emerald-700">{ride.to}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200/60 text-[11px]">
              <span>Departure: <strong>{formatDepartureTime(ride.departureTime)}</strong></span>
              <span>Available Seats: <strong className="text-emerald-600">{ride.seatsAvailable}</strong></span>
            </div>
            <p className="text-[11px] text-slate-500">Vehicle: {ride.vehicleInfo}</p>
          </div>

          {/* Pickup point searchable input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Your Specific Pickup Point
            </label>
            <input
              type="text"
              list="request-pickup-suggestions"
              value={pickupPoint}
              onChange={(e) => setPickupPoint(e.target.value)}
              placeholder="e.g. Near Library Gate, Hostel 2, or Main Gate"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#00AFF5] bg-white placeholder:text-slate-400"
            />
            <datalist id="request-pickup-suggestions">
              {locations.map((loc) => (
                <option key={`req-loc-${loc}`} value={loc} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Seats Needed</label>
            <select
              value={seatsBooked}
              onChange={(e) => setSeatsBooked(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-600 bg-white"
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
              <span className="text-xs text-emerald-800 block font-medium">Cost Share (₹12/KM Guideline)</span>
              <span className="text-xl font-extrabold text-emerald-900">Total: ₹{totalFare}</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-bold bg-white px-3 py-1 rounded-full border border-emerald-300">
              Pay in Person / UPI
            </span>
          </div>

          {!isAuthenticated ? (
            <Link
              to="/login"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm block text-center shadow-md transition"
            >
              Log in to Request Seat
            </Link>
          ) : !isVerified ? (
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <Lock className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Verification required before you can request seats.</span>
              </div>
              <button
                type="button"
                disabled
                className="w-full py-3 rounded-xl bg-slate-200 text-slate-400 font-bold text-sm cursor-not-allowed"
              >
                Verification Required
              </button>
            </div>
          ) : isBlockedByGender ? (
            <button
              type="button"
              disabled
              className="w-full py-3 rounded-xl bg-slate-200 text-slate-400 font-bold text-sm cursor-not-allowed"
            >
              Reserved for Female Commuters Only
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-full bg-[#00AFF5] hover:bg-[#0098d6] active:scale-98 text-white font-black text-sm shadow-md shadow-sky-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? "Sending Booking Request..." : `Book Seat for ₹${totalFare}`}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
