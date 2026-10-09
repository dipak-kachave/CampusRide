import React, { useState, useEffect } from "react";
import { Bike, Plus, ShieldCheck, MapPin, Gauge, Star, Search, Filter, ArrowRight, CheckCircle2, Navigation, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ShirpurMap from "../components/ShirpurMap";
import AddVehicleModal from "../components/AddVehicleModal";
import BookVehicleModal from "../components/BookVehicleModal";
import { Link } from "react-router-dom";

export default function Rentals() {
  const { isAuthenticated, user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("vehicles"); // "vehicles" | "map"
  const [selectedType, setSelectedType] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState("");

  // Pre-filled destination from map
  const [targetDestination, setTargetDestination] = useState("Shirpur Bus Stand");
  const [targetKm, setTargetKm] = useState(3.2);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      let url = "/api/vehicles";
      const params = new URLSearchParams();
      if (selectedType !== "All") params.append("type", selectedType);
      if (searchTerm) params.append("search", searchTerm);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setVehicles(data.vehicles);
      }
    } catch (err) {
      console.error("Failed to load vehicles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [selectedType, searchTerm]);

  const handleVehicleAdded = (newVehicle) => {
    setVehicles((prev) => [newVehicle, ...prev]);
    setBookingSuccessMsg(`Vehicle "${newVehicle.name}" successfully listed at ₹10/KM!`);
    setTimeout(() => setBookingSuccessMsg(""), 6000);
  };

  const handleBookingSuccess = (booking) => {
    setBookingSuccessMsg(`🎉 Rental Request sent for ${booking.vehicle?.name || "vehicle"}! Total estimate: ₹${booking.estimatedKm * 10}. Check Dashboard to view status.`);
    setTimeout(() => setBookingSuccessMsg(""), 8000);
    fetchVehicles();
  };

  const handleOpenBook = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsBookOpen(true);
  };

  const handleMapSelect = (destName, km) => {
    setTargetDestination(destName);
    setTargetKm(Number(km));
    setActiveTab("vehicles");
    setBookingSuccessMsg(`Route selected: RCPIT ➔ ${destName} (${km} KM = ₹${Math.round(km * 10)}). Now choose a vehicle below!`);
    setTimeout(() => setBookingSuccessMsg(""), 6000);
  };

  const categories = ["All", "Scooter", "Motorbike", "Electric Scooter", "Bicycle"];

  return (
    <div className="pb-24 pt-6 max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur">
            <Bike className="w-3.5 h-3.5 text-cyan-300" />
            Verified Campus Vehicle Rental • Fixed ₹10/KM
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Rent a Campus Bike</h1>
          <p className="text-blue-100 text-xs sm:text-sm max-w-lg">
            Need to visit Shirpur Bus Stand or market? Rent verified student bikes with transparent ₹10/KM distance pricing.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 relative z-10 shrink-0">
          {isAuthenticated ? (
            <button
              onClick={() => setIsAddOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-blue-800 font-bold text-sm shadow-lg hover:bg-blue-50 transition transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 text-blue-600" /> List Your Vehicle (₹10/KM)
            </button>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-blue-800 font-bold text-sm shadow-lg hover:bg-blue-50 transition"
            >
              Log in to List Vehicle
            </Link>
          )}
        </div>
      </div>

      {/* Success Notification Alert */}
      {bookingSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{bookingSuccessMsg}</span>
          </div>
          <button
            onClick={() => setBookingSuccessMsg("")}
            className="text-xs text-emerald-700 font-bold hover:underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation Tabs (Vehicles vs Shirpur Map) */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("vehicles")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
              activeTab === "vehicles"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            <Bike className="w-4 h-4" /> Available Vehicles ({vehicles.length})
          </button>

          <button
            onClick={() => setActiveTab("map")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
              activeTab === "map"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            <Navigation className="w-4 h-4 text-rose-500" /> Shirpur Map & ₹10/KM Guide
          </button>
        </div>

        <span className="hidden sm:block text-xs font-semibold text-slate-500">
          Standard Rate: <strong className="text-blue-600">₹10 / KM</strong>
        </span>
      </div>

      {/* TAB 1: SHIRPUR MAP */}
      {activeTab === "map" && (
        <ShirpurMap onSelectDestination={handleMapSelect} />
      )}

      {/* TAB 2: AVAILABLE VEHICLES MARKETPLACE */}
      {activeTab === "vehicles" && (
        <div className="space-y-6">
          {/* Search and Category Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            {/* Category Pills */}
            <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedType(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    selectedType === cat
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  }`}
                >
                  {cat === "All" ? "All Vehicles" : cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search model or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-slate-500">Loading verified campus vehicles...</p>
            </div>
          ) : vehicles.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Bike className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">No vehicles listed right now</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Be the first student to list your bike and start earning with ₹10/KM campus rides!
                </p>
              </div>
              {isAuthenticated && (
                <button
                  onClick={() => setIsAddOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow hover:bg-blue-700 transition"
                >
                  + List Your Bike Now
                </button>
              )}
            </div>
          ) : (
            /* Vehicle Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {vehicles.map((v) => (
                <div
                  key={v._id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Top Row: Type & Status */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Bike className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider block">
                            {v.type}
                          </span>
                          <h3 className="font-bold text-slate-900 text-base">{v.name}</h3>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          v.status === "Available"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {v.status}
                      </span>
                    </div>

                    {/* Location & Owner info */}
                    <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-1 text-slate-700 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate">{v.location}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                        <span>Owner: {v.owner?.name || "Student"}</span>
                        <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                          <Star className="w-3 h-3 fill-amber-400" /> {v.owner?.rating || 5.0}
                        </span>
                      </div>
                    </div>

                    {/* Rate Highlight Box (₹10/KM) */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-2.5">
                        <span className="text-[10px] text-blue-600 font-bold block uppercase">Distance Rate</span>
                        <span className="text-base font-extrabold text-blue-950">₹{v.ratePerKm || 10} / KM</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-2.5">
                        <span className="text-[10px] text-slate-400 font-medium block uppercase">Helmet</span>
                        <span className="text-xs font-bold text-slate-800">
                          {v.helmetsProvided ? `${v.helmetsProvided} Provided` : "Bring Own"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    disabled={v.status !== "Available" || (user && user.id === v.owner?._id)}
                    onClick={() => handleOpenBook(v)}
                    className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {user && user.id === v.owner?._id ? (
                      "Your Vehicle"
                    ) : v.status === "Available" ? (
                      <>
                        Book Vehicle (₹{v.ratePerKm || 10}/KM) <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      "Currently Booked"
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AddVehicleModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onVehicleAdded={handleVehicleAdded}
      />

      <BookVehicleModal
        isOpen={isBookOpen}
        onClose={() => setIsBookOpen(false)}
        vehicle={selectedVehicle}
        onBookingSuccess={handleBookingSuccess}
        initialDestination={targetDestination}
        initialKm={targetKm}
      />
    </div>
  );
}
