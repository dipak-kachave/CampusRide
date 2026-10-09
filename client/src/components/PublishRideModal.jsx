import React, { useState } from "react";
import { X, Car, MapPin, Clock, Users, IndianRupee, AlertCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function PublishRideModal({ isOpen, onClose, onRideCreated }) {
  const { token, user } = useAuth();
  const [formData, setFormData] = useState({
    from: "RCPIT Main Gate",
    to: "Shirpur Bus Stand (MSRTC)",
    departureTime: "Today, 05:15 PM",
    seatsTotal: 2,
    distanceKm: 3.2,
    ratePerKm: 12, // Fixed ₹12/KM rule
    pricePerSeat: 20, // (3.2 KM * 12) / 2 approx = 20
    vehicleInfo: "Honda Activa 6G",
    notes: "Leaving right after 5 PM college hours. Safe riding guaranteed.",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const SHIRPUR_DESTINATIONS = [
    { name: "Shirpur Bus Stand (MSRTC)", km: 3.2 },
    { name: "Nimzari Naka", km: 1.8 },
    { name: "Karwand Naka / Market", km: 2.5 },
    { name: "RCPIT Hostels Area", km: 0.8 },
    { name: "Mukeshbhai Patel Sports Complex", km: 2.2 },
    { name: "Subhash Chowk", km: 2.9 },
  ];

  if (!isOpen) return null;

  const handleDestinationSelect = (destName, km) => {
    const calculatedPerSeat = Math.max(Math.round((km * 12) / (Number(formData.seatsTotal) || 1)), 15);
    setFormData((prev) => ({
      ...prev,
      to: destName,
      distanceKm: km,
      pricePerSeat: calculatedPerSeat,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "seatsTotal") {
      const seats = Number(value) || 1;
      const calculatedPerSeat = Math.max(Math.round((formData.distanceKm * 12) / seats), 15);
      setFormData((prev) => ({ ...prev, seatsTotal: seats, pricePerSeat: calculatedPerSeat }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

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

          {/* Quick Landmark Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Quick Pick Shirpur Route (Calculates exact distance & ₹12/KM fare):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SHIRPUR_DESTINATIONS.map((dest) => (
                <button
                  type="button"
                  key={dest.name}
                  onClick={() => handleDestinationSelect(dest.name, dest.km)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition ${
                    formData.to === dest.name
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {dest.name} ({dest.km} KM)
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pickup / Origin</label>
              <input
                type="text"
                name="from"
                required
                placeholder="e.g. RCPIT Main Gate"
                value={formData.from}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Destination</label>
              <input
                type="text"
                name="to"
                required
                placeholder="e.g. Shirpur Bus Stand"
                value={formData.to}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* ₹12/KM Distance & Pricing info card */}
          <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-emerald-900 block">
                Route Distance: {formData.distanceKm} KM • Rate: ₹12/KM
              </span>
              <span className="text-[11px] text-emerald-700">
                Total Route Fuel: ₹{Math.round(formData.distanceKm * 12)} (Split between {formData.seatsTotal} seats = ₹{formData.pricePerSeat}/seat)
              </span>
            </div>
            <span className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-sm">
              ₹12/KM Rule
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Departure Time</label>
              <input
                type="text"
                name="departureTime"
                required
                placeholder="e.g. Today, 5:15 PM"
                value={formData.departureTime}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Available Seats</label>
              <select
                name="seatsTotal"
                value={formData.seatsTotal}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-600"
              >
                <option value={1}>1 Seat (Bike)</option>
                <option value={2}>2 Seats</option>
                <option value={3}>3 Seats (Car)</option>
                <option value={4}>4 Seats (Car)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cost / Seat (₹)</label>
              <input
                type="number"
                name="pricePerSeat"
                min="0"
                max="100"
                value={formData.pricePerSeat}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 text-sm font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-600"
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
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
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
            {loading ? "Publishing Ride..." : "Publish Ride for ₹" + formData.pricePerSeat + " / seat"}
          </button>
        </form>
      </div>
    </div>
  );
}
