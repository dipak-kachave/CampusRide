import React, { useState } from "react";
import { X, Bike, ShieldCheck, MapPin, Gauge, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AddVehicleModal({ isOpen, onClose, onVehicleAdded }) {
  const { token, user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    vehicleNumber: "",
    type: "Scooter",
    ratePerKm: 10, // Preset to ₹10/KM rule
    ratePerHour: 30,
    location: "RCPIT Main Campus Parking",
    fuelType: "Petrol",
    helmetsProvided: 1,
    description: "Clean and well-maintained student vehicle ready for rides.",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.vehicleNumber) {
      setError("Please fill in vehicle name and registration number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to list vehicle");
      }

      onVehicleAdded(data.vehicle);
      onClose();
    } catch (err) {
      setError(err.message || "Error adding vehicle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur">
              <Bike className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">List Your Vehicle for Rent</h2>
              <p className="text-xs text-blue-100">Earn per-KM fare when you aren't using your bike</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Model Name</label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Honda Activa 6G"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Registration Number</label>
              <input
                type="text"
                name="vehicleNumber"
                required
                placeholder="e.g. MH-18-BQ-1234"
                value={formData.vehicleNumber}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600"
              >
                <option value="Scooter">Scooter (Activa/Jupiter)</option>
                <option value="Motorbike">Motorbike (Splendor/Pulsar)</option>
                <option value="Electric Scooter">Electric Scooter (EV)</option>
                <option value="Bicycle">Bicycle</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rate / KM <span className="text-blue-600 font-bold">(₹10 rule)</span>
              </label>
              <input
                type="number"
                name="ratePerKm"
                min="1"
                required
                value={formData.ratePerKm}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-blue-200 bg-blue-50/50 text-sm font-bold text-blue-800 focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hourly Rate (₹/hr)</label>
              <input
                type="number"
                name="ratePerHour"
                min="0"
                value={formData.ratePerHour}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Pickup Location around Campus</label>
            <input
              type="text"
              name="location"
              required
              placeholder="e.g. RCPIT Parking Stand 1, Near Boys Hostel"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Fuel Type</label>
              <select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600"
              >
                <option value="Petrol">Petrol</option>
                <option value="Electric">Electric</option>
                <option value="Manual">Manual</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Helmets Provided</label>
              <select
                name="helmetsProvided"
                value={formData.helmetsProvided}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600"
              >
                <option value={1}>1 Helmet</option>
                <option value={2}>2 Helmets</option>
                <option value={0}>No Helmet</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition disabled:opacity-50"
            >
              {loading ? "Listing Vehicle..." : "List Vehicle at ₹10/KM"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
