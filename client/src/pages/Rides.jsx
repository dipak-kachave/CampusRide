import React, { useState, useEffect } from "react";
import {
  Car,
  Plus,
  MapPin,
  Clock,
  Users,
  ArrowRight,
  ShieldCheck,
  Search,
  CheckCircle2,
  Star,
  AlertCircle,
  Heart,
  SlidersHorizontal,
  Luggage,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import PublishRideModal from "../components/PublishRideModal";
import RequestSeatModal from "../components/RequestSeatModal";
import VerifyIdCardModal from "../components/VerifyIdCardModal";
import ShirpurMap from "../components/ShirpurMap";
import { formatDepartureTime } from "../utils/dateFormatter";

export default function Rides() {
  const { isAuthenticated, user, refreshUser } = useAuth();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [locations, setLocations] = useState([]);
  const [fromLocation, setFromLocation] = useState("All");
  const [toLocation, setToLocation] = useState("All");
  const [filterDate, setFilterDate] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");
  const [womenOnlyFilter, setWomenOnlyFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Modals state
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");

  const isVerified = user?.isVerified || user?.verificationStatus === "verified";

  // Fetch campus locations
  useEffect(() => {
    fetch("/api/locations")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.locations) {
          setLocations(data.locations);
        }
      })
      .catch((err) => console.error("Error fetching locations:", err));
  }, []);

  const fetchRides = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (fromLocation && fromLocation !== "All") params.append("from", fromLocation);
      if (toLocation && toLocation !== "All") params.append("to", toLocation);
      if (filterDate) params.append("date", filterDate);
      if (maxPrice) params.append("maxPrice", maxPrice);
      if (minRating) params.append("minRating", minRating);
      if (womenOnlyFilter) params.append("womenOnly", "true");
      if (searchTerm) params.append("search", searchTerm);

      const url = `/api/rides${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setRides(data.rides || []);
      }
    } catch (err) {
      console.error("Failed to load rides:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, [fromLocation, toLocation, filterDate, maxPrice, minRating, womenOnlyFilter, searchTerm]);

  const handleRideCreated = (newRide) => {
    setRides((prev) => [newRide, ...prev]);
    setActionSuccessMsg("🎉 Your ride was published! Fellow verified students can now request seats.");
    setTimeout(() => setActionSuccessMsg(""), 6000);
  };

  const handleRequestSuccess = () => {
    setActionSuccessMsg("🎉 Seat requested! Driver will receive an in-app alert on their dashboard.");
    setTimeout(() => setActionSuccessMsg(""), 6000);
    fetchRides();
  };

  const handleOpenRequest = (ride) => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    if (!isVerified) {
      setIsVerifyOpen(true);
      return;
    }
    setSelectedRide(ride);
    setIsRequestOpen(true);
  };

  const handleOpenPublish = () => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    if (!isVerified) {
      setIsVerifyOpen(true);
      return;
    }
    setIsPublishOpen(true);
  };

  const resetFilters = () => {
    setFromLocation("All");
    setToLocation("All");
    setFilterDate("");
    setMaxPrice("");
    setMinRating("");
    setWomenOnlyFilter(false);
    setSearchTerm("");
  };

  return (
    <div className="pb-24 pt-6 max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur">
            <Car className="w-3.5 h-3.5 text-emerald-300" />
            Verified RCPIT Peer Mobility • Fixed Campus Points • Zero Commission
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Campus Rides</h1>
          <p className="text-emerald-100 text-xs sm:text-sm max-w-lg">
            Share empty seats between RCPIT gates, hostels, and Shirpur bus stand. Safe co-travel with verified students.
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <button
            onClick={handleOpenPublish}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-emerald-900 font-bold text-sm shadow-lg hover:bg-emerald-50 transition transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-700" /> Publish a Ride
          </button>
        </div>
      </div>

      {/* STEP 3 #2: Verification Gating Banner for Unverified Users */}
      {isAuthenticated && !isVerified && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-300/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Student Verification Required ({user?.verificationStatus === "pending" ? "Pending Admin Approval" : user?.verificationStatus === "rejected" ? "Verification Rejected" : "Unverified"})
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {user?.verificationStatus === "pending"
                  ? "Your College ID Card is currently being reviewed by college administration. Once approved, you can publish and join rides."
                  : user?.verificationStatus === "rejected"
                  ? `Your submission was rejected: "${user?.rejectionReason || "Please re-upload a clear ID card"}". Upload a new photo to verify.`
                  : "To keep our campus safe and trust-first, you must upload your RCPIT Student/Staff ID Card before publishing or reserving seats."}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsVerifyOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition whitespace-nowrap cursor-pointer"
          >
            {user?.verificationStatus === "pending" ? "Check / Re-upload ID" : "Verify College ID Card"}
          </button>
        </div>
      )}

      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg("")} className="text-xs font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search pickup point, vehicle, note..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            {/* Quick origin & destination selectors */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <span className="text-slate-400 text-[11px]">From:</span>
              <select
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-emerald-600 outline-none"
              >
                <option value="All">All Origins</option>
                {locations.map((loc) => (
                  <option key={`from-${loc}`} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <span className="text-slate-400 text-[11px]">To:</span>
              <select
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-emerald-600 outline-none"
              >
                <option value="All">All Destinations</option>
                {locations.map((loc) => (
                  <option key={`to-${loc}`} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                showFilters || maxPrice || minRating || filterDate || womenOnlyFilter
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {(maxPrice || minRating || filterDate || womenOnlyFilter) && (
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              )}
            </button>
          </div>
        </div>

        {/* Extended Filters Drawer */}
        {showFilters && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Departure Date</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Max Price: {maxPrice ? `₹${maxPrice}` : "Any"}
              </label>
              <input
                type="number"
                placeholder="e.g. 30"
                min="10"
                max="60"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Min Driver Rating</label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-emerald-600"
              >
                <option value="">Any Rating</option>
                <option value="4.5">4.5+ Stars ⭐</option>
                <option value="4.0">4.0+ Stars ⭐</option>
                <option value="3.5">3.5+ Stars ⭐</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 p-2 rounded-xl bg-pink-50 border border-pink-200 text-pink-800 font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={womenOnlyFilter}
                  onChange={(e) => setWomenOnlyFilter(e.target.checked)}
                  className="rounded text-pink-600 focus:ring-pink-500 w-4 h-4"
                />
                <span className="flex items-center gap-1 text-[11px]">
                  <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" /> Women-Only Rides
                </span>
              </label>
            </div>

            {(maxPrice || minRating || filterDate || womenOnlyFilter || fromLocation !== "All" || toLocation !== "All") && (
              <div className="sm:col-span-4 flex justify-end">
                <button
                  onClick={resetFilters}
                  className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Reset all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interactive Shirpur Route Map */}
      <div className="space-y-3">
        <ShirpurMap onSelectRoute={() => handleOpenPublish()} />
      </div>

      {/* Rides Grid */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500">Finding available campus rides...</p>
        </div>
      ) : rides.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Car className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No active rides match your filter</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Traveling between RCPIT gates and Shirpur? Publish a ride and split fuel costs with fellow students!
            </p>
          </div>
          <button
            onClick={handleOpenPublish}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow hover:bg-emerald-700 transition cursor-pointer"
          >
            + Publish a Ride
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {rides.map((ride) => (
            <div
              key={ride._id}
              className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Driver Info & Badges */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/profile/${ride.driver?._id}`}
                        className="font-bold text-slate-900 text-sm hover:text-emerald-700 hover:underline transition"
                      >
                        {ride.driver?.name}
                      </Link>
                      {ride.driver?.isVerified && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                      <span>{ride.driver?.department}</span>
                      <span className="flex items-center gap-1 text-amber-600 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {(ride.driver?.ratingAvg || ride.driver?.rating || 5.0).toFixed(1)}
                        <span className="text-slate-400 font-normal">
                          ({ride.driver?.ridesCompleted || 0} rides)
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-black text-emerald-600 block">₹{ride.pricePerSeat}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">per seat</span>
                  </div>
                </div>

                {/* Badges: Women-Only / Luggage */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {ride.womenOnly && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-700 text-[10px] font-extrabold border border-pink-200">
                      <Heart className="w-3 h-3 fill-pink-500 text-pink-500" /> Women-Only Ride
                    </span>
                  )}
                  {ride.luggageAllowed && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium">
                      <Luggage className="w-3 h-3" /> Backpack ok
                    </span>
                  )}
                </div>

                {/* Route Box */}
                <div className="bg-slate-50 rounded-2xl p-3.5 space-y-2 border border-slate-100 text-xs">
                  <div className="flex items-center gap-2 text-slate-800 font-bold">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{ride.from}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="text-emerald-700">{ride.to}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 pt-1.5 border-t border-slate-200/50 text-[11px]">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      {formatDepartureTime(ride.departureTime)}
                    </span>
                    <span className="flex items-center gap-1 font-extrabold text-emerald-700">
                      <Users className="w-3.5 h-3.5" /> {ride.seatsAvailable} open seat(s)
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
                <span className="text-[11px] text-slate-500 font-medium truncate max-w-[170px]">
                  🚗 {ride.vehicleInfo}
                </span>

                {user && user.id === (ride.driver?._id || ride.driver) ? (
                  <span className="text-xs font-semibold text-slate-400 px-3 py-1 bg-slate-100 rounded-lg">
                    Your Published Ride
                  </span>
                ) : ride.seatsAvailable > 0 ? (
                  <button
                    onClick={() => handleOpenRequest(ride)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
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

      <VerifyIdCardModal
        isOpen={isVerifyOpen}
        onClose={() => setIsVerifyOpen(false)}
        onUploadSuccess={() => {
          if (refreshUser) refreshUser();
        }}
      />
    </div>
  );
}
