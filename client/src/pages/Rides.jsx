import React, { useState, useEffect } from "react";
import { Car, Plus, MapPin, Clock, Users, ArrowRight, ShieldCheck, Search, CheckCircle2, Star, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import PublishRideModal from "../components/PublishRideModal";
import RequestSeatModal from "../components/RequestSeatModal";
import ShirpurMap from "../components/ShirpurMap";

export default function Rides() {
  const { isAuthenticated, user } = useAuth();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRoute, setFilterRoute] = useState("All");

  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");

  const fetchRides = async () => {
    setLoading(true);
    try {
      let url = "/api/rides";
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (filterRoute === "ToBusStand") params.append("to", "Shirpur Bus Stand");
      if (filterRoute === "ToCampus") params.append("to", "RCPIT");
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setRides(data.rides);
      }
    } catch (err) {
      console.error("Failed to load rides:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, [searchTerm, filterRoute]);

  const handleRideCreated = (newRide) => {
    setRides((prev) => [newRide, ...prev]);
    setActionSuccessMsg("🎉 Your ride was published! Fellow students can now request empty seats.");
    setTimeout(() => setActionSuccessMsg(""), 6000);
  };

  const handleRequestSuccess = () => {
    setActionSuccessMsg("🎉 Seat requested! Driver will receive notification on their dashboard.");
    setTimeout(() => setActionSuccessMsg(""), 6000);
    fetchRides();
  };

  const handleOpenRequest = (ride) => {
    setSelectedRide(ride);
    setIsRequestOpen(true);
  };

  return (
    <div className="pb-24 pt-6 max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur">
            <Car className="w-3.5 h-3.5 text-emerald-300" />
            Verified RCPIT Peer Ride Sharing • Split Travel Costs
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Available Campus Rides</h1>
          <p className="text-emerald-100 text-xs sm:text-sm max-w-lg">
            Commute between RCPIT and Shirpur Bus Stand / town. Share a ride or grab an open seat with verified classmates.
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          {isAuthenticated ? (
            <button
              onClick={() => setIsPublishOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-emerald-900 font-bold text-sm shadow-lg hover:bg-emerald-50 transition transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 text-emerald-700" /> Publish a Ride
            </button>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-emerald-900 font-bold text-sm shadow-lg hover:bg-emerald-50 transition"
            >
              Log in to Publish Ride
            </Link>
          )}
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg("")} className="text-xs font-bold underline">Dismiss</button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterRoute("All")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterRoute === "All" ? "bg-emerald-600 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            All Routes
          </button>
          <button
            onClick={() => setFilterRoute("ToBusStand")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterRoute === "ToBusStand" ? "bg-emerald-600 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            ➔ To Shirpur Bus Stand
          </button>
          <button
            onClick={() => setFilterRoute("ToCampus")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterRoute === "ToCampus" ? "bg-emerald-600 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            ➔ To RCPIT Campus
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search route or vehicle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* Interactive Shirpur Route Map & ₹12/KM Mobility Guide */}
      <div className="space-y-3">
        <ShirpurMap
          onSelectRoute={(routeInfo) => {
            setIsPublishOpen(true);
          }}
        />
      </div>

      {/* Rides Grid */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500">Loading campus rides...</p>
        </div>
      ) : rides.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Car className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No active rides right now</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Are you traveling between RCPIT and Shirpur? Publish a ride and help fellow students!
            </p>
          </div>
          {isAuthenticated && (
            <button
              onClick={() => setIsPublishOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow hover:bg-emerald-700 transition"
            >
              + Publish the First Ride
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {rides.map((ride) => (
            <div
              key={ride._id}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Driver Info & Status */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 text-sm">{ride.driver?.name}</span>
                      {ride.driver?.isVerified && (
                        <ShieldCheck className="w-4 h-4 text-emerald-600" title="RCPIT Verified Member" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {ride.driver?.department} • {ride.driver?.year}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-emerald-600 block">₹{ride.pricePerSeat}</span>
                    <span className="text-[10px] text-slate-400">per seat</span>
                  </div>
                </div>

                {/* Route Box */}
                <div className="bg-slate-50 rounded-2xl p-3.5 space-y-2 border border-slate-100 text-xs">
                  <div className="flex items-center gap-2 text-slate-800 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{ride.from}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="text-emerald-700">{ride.to}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 pt-1.5 border-t border-slate-200/50 text-[11px]">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Clock className="w-3 h-3 text-slate-400" /> {ride.departureTime}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-emerald-600">
                      <Users className="w-3 h-3" /> {ride.seatsAvailable} seat(s) available
                    </span>
                  </div>
                </div>

                {ride.notes && (
                  <p className="text-[11px] text-slate-500 italic bg-amber-50/50 p-2 rounded-xl border border-amber-100">
                    "{ride.notes}"
                  </p>
                )}
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium truncate max-w-[180px]">
                  🚗 {ride.vehicleInfo}
                </span>

                {user && user.id === ride.driver?._id ? (
                  <span className="text-xs font-semibold text-slate-400 px-3 py-1 bg-slate-100 rounded-lg">
                    Your Ride
                  </span>
                ) : ride.seatsAvailable > 0 ? (
                  <button
                    onClick={() => handleOpenRequest(ride)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                  >
                    Request Seat <ArrowRight className="w-3 h-3" />
                  </button>
                ) : (
                  <span className="text-xs font-bold text-rose-600 px-3 py-1 bg-rose-50 rounded-lg">
                    Ride Full
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <PublishRideModal
        isOpen={isPublishOpen}
        onClose={() => setIsPublishOpen(false)}
        onRideCreated={handleRideCreated}
      />

      <RequestSeatModal
        isOpen={isRequestOpen}
        onClose={() => setIsRequestOpen(false)}
        ride={selectedRide}
        onRequestSuccess={handleRequestSuccess}
      />
    </div>
  );
}
