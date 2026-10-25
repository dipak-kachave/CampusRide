import React, { useState, useEffect } from "react";
import { X, Car, MapPin, Clock, Users, IndianRupee, AlertCircle, ShieldCheck, Sparkles, Heart } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toDateTimeLocalString } from "../utils/dateFormatter";

export default function PublishRideModal({ isOpen, onClose, onRideCreated }) {
  const { token, user } = useAuth();
  const [locations, setLocations] = useState([
    "RCPIT Main Gate",
    "Shirpur Bus Stand",
    "Boys Hostel",
    "Girls Hostel",
    "Library Gate",
    "Shirpur Market",
  ]);
  const [config, setConfig] = useState({
    minPricePerSeat: 10,
    maxPricePerSeat: 60,
    maxSeats: 4,
  });

  const [formData, setFormData] = useState({
    from: "RCPIT Main Gate",
    to: "Shirpur Bus Stand",
    departureTime: toDateTimeLocalString(new Date(Date.now() + 60 * 60 * 1000)),
    seatsTotal: 2,
    pricePerSeat: 20,
    vehicleInfo: "Honda Activa 6G",
    womenOnly: false,
    luggageAllowed: true,
    notes: "Leaving directly after college hours. Safe riding guaranteed.",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/locations")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.locations?.length) {
          setLocations(data.locations);
          if (data.config) setConfig(data.config);
        }
      })
      .catch((err) => console.error("Error fetching locations:", err));
  }, []);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "seatsTotal" || name === "pricePerSeat") {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.from === formData.to) {
      setError("Origin and destination cannot be the same pickup point.");
      return;
    }

    const selectedTime = new Date(formData.departureTime);
    if (isNaN(selectedTime.getTime()) || selectedTime.getTime() <= Date.now()) {
      setError("Please select a future departure date and time.");
      return;
    }

    if (
      formData.pricePerSeat < config.minPricePerSeat ||
      formData.pricePerSeat > config.maxPricePerSeat
    ) {
      setError(
        `Price per seat must be between ₹${config.minPricePerSeat} and ₹${config.maxPricePerSeat}.`
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/rides", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to publish ride");
      }

      onRideCreated(data.ride);
      onClose();
    } catch (err) {
      setError(err.message || "Error publishing ride");
    } finally {
      setLoading(false);
    }
  };

  const minDateTime = toDateTimeLocalString(new Date(Date.now() + 5 * 60 * 1000));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg border border-slate-200 shadow-2xl overflow-hidden my-8">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Publish a Campus Ride</h2>
              <p className="text-xs text-emerald-100">Share your empty seats & split fuel expenses</p>
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

          {/* Campus Points Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pickup Point (Origin)</label>
              <select
                name="from"
                required
                value={formData.from}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
              >
                {locations.map((loc) => (
                  <option key={`from-${loc}`} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Drop Point (Destination)</label>
              <select
                name="to"
                required
                value={formData.to}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
              >
                {locations.map((loc) => (
                  <option key={`to-${loc}`} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Departure Date & Time</label>
              <input
                type="datetime-local"
                name="departureTime"
                required
                min={minDateTime}
                value={formData.departureTime}
                onChange={handleChange}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Available Seats</label>
              <select
                name="seatsTotal"
                value={formData.seatsTotal}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-600 bg-white"
              >
                <option value={1}>1 Seat (Bike/Scooter)</option>
                <option value={2}>2 Seats</option>
                <option value={3}>3 Seats (Car)</option>
                <option value={4}>4 Seats (Car max)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cost / Seat (₹{config.minPricePerSeat}-{config.maxPricePerSeat})
              </label>
              <input
                type="number"
                name="pricePerSeat"
                min={config.minPricePerSeat}
                max={config.maxPricePerSeat}
                value={formData.pricePerSeat}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50/50 text-xs sm:text-sm font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Info</label>
            <input
              type="text"
              name="vehicleInfo"
              required
              placeholder="e.g. Honda Activa 6G (MH-18-XX) or Swift"
              value={formData.vehicleInfo}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Preferences: Women-Only & Luggage */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800">
              <input
                type="checkbox"
                name="womenOnly"
                checked={formData.womenOnly}
                onChange={handleChange}
                className="rounded text-pink-600 focus:ring-pink-500 w-4 h-4"
              />
              <span className="flex items-center gap-1 text-pink-700 font-bold">
                <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" /> Women-Only Ride
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                (Only female-identified verified passengers can join)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800">
              <input
                type="checkbox"
                name="luggageAllowed"
                checked={formData.luggageAllowed}
                onChange={handleChange}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span>Small college backpack / bag allowed</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Trip Note (Optional)</label>
            <input
              type="text"
              name="notes"
              placeholder="e.g. Leaving directly after practicals, wearing helmet required"
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20 transition disabled:opacity-50"
          >
            {loading ? "Publishing Ride..." : `Publish Ride for ₹${formData.pricePerSeat} / seat`}
          </button>
        </form>
      </div>
    </div>
  );
}
