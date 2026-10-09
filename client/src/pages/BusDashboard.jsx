import React, { useState, useEffect } from "react";
import { Bus, Search, Clock, MapPin, AlertCircle, RefreshCw, Plus, X, CheckCircle2, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function BusDashboard() {
  const { isAuthenticated, token } = useAuth();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");

  // Add Bus Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newBus, setNewBus] = useState({
    destination: "",
    departure: "",
    type: "MSRTC Express",
    platform: "Platform 1",
    fare: "₹65",
    frequency: "Hourly",
    via: "Songir, Nardana",
  });
  const [msg, setMsg] = useState("");

  const fetchBuses = async () => {
    setLoading(true);
    try {
      let url = "/api/buses";
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedType !== "All") params.append("type", selectedType);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setBuses(data.buses);
      }
    } catch (err) {
      console.error("Failed to load buses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, [searchTerm, selectedType]);

  const handleAddBus = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/buses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newBus),
      });
      const data = await res.json();
      if (data.success) {
        setMsg("Bus schedule added to Shirpur database!");
        setTimeout(() => setMsg(""), 5000);
        setIsAddOpen(false);
        fetchBuses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const types = ["All", "MSRTC Ordinary", "MSRTC Express", "MSRTC Semi-Luxury (Asian)", "Shivshahi AC", "Sleeper / Night Bus"];

  return (
    <div className="pb-24 pt-6 max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-amber-600 to-orange-700 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur">
            <Bus className="w-3.5 h-3.5" /> Shirpur MSRTC Bus Stand Live Timetable
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Shirpur Bus Stand</h1>
          <p className="text-amber-100 text-xs sm:text-sm max-w-lg">
            Find verified departures, platform numbers, and fares to Dhule, Jalgaon, Nashik, Pune & Indore.
          </p>
        </div>

        {isAuthenticated && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-amber-900 font-bold text-sm shadow-lg hover:bg-amber-50 transition transform hover:-translate-y-0.5 shrink-0"
          >
            <Plus className="w-4 h-4 text-amber-700" /> + Add / Update Schedule
          </button>
        )}
      </div>

      {msg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search destination (e.g. Dhule, Jalgaon, Nashik)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <RefreshCw className="w-3.5 h-3.5" /> Showing {buses.length} verified timetables
          </div>
        </div>

        {/* Bus Type Filter Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                selectedType === t
                  ? "bg-amber-600 text-white"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Timetable List Grid */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500">Loading Shirpur bus schedules...</p>
        </div>
      ) : buses.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Bus className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No buses found for this search</h3>
          <p className="text-xs text-slate-500">Try searching for other major destinations like Dhule or Jalgaon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {buses.map((bus) => (
            <div
              key={bus._id}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">{bus.destination}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      {bus.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" /> {bus.platform}
                    </span>
                    {bus.via && <span>• {bus.via}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-slate-900 block">{bus.departure}</span>
                  <span className="text-xs font-semibold text-emerald-600">{bus.fare}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Frequency: {bus.frequency}</span>
                <span>Verified: {bus.lastUpdated}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Bus Schedule Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="font-bold text-slate-900">Add Shirpur Bus Timetable</h2>
              <button onClick={() => setIsAddOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddBus} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Destination City</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dhule, Jalgaon, Nashik"
                  value={newBus.destination}
                  onChange={(e) => setNewBus({ ...newBus, destination: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Departure Time</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 07:30 AM"
                    value={newBus.departure}
                    onChange={(e) => setNewBus({ ...newBus, departure: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-sm"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Platform</label>
                  <input
                    type="text"
                    value={newBus.platform}
                    onChange={(e) => setNewBus({ ...newBus, platform: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Bus Type</label>
                  <select
                    value={newBus.type}
                    onChange={(e) => setNewBus({ ...newBus, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-sm"
                  >
                    <option value="MSRTC Ordinary">MSRTC Ordinary</option>
                    <option value="MSRTC Express">MSRTC Express</option>
                    <option value="Shivshahi AC">Shivshahi AC</option>
                    <option value="Sleeper / Night Bus">Sleeper / Night Bus</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Approx Fare</label>
                  <input
                    type="text"
                    value={newBus.fare}
                    onChange={(e) => setNewBus({ ...newBus, fare: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold block mb-1">Via / Route Stops</label>
                <input
                  type="text"
                  value={newBus.via}
                  onChange={(e) => setNewBus({ ...newBus, via: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs shadow hover:bg-amber-700 transition"
              >
                Save Schedule Entry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
