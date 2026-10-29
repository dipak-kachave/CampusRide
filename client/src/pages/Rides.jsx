import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  Search,
  ArrowLeftRight,
  Clock,
  Coins,
  MapPin,
  Hourglass,
  Car,
  ShieldCheck,
  Star,
  Users,
  Heart,
  Luggage,
  Sparkles,
  ChevronRight,
  X,
  Filter,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ShirpurMap from "../components/ShirpurMap";
import VerifyIdCardModal from "../components/VerifyIdCardModal";
import PublishRideModal from "../components/PublishRideModal";
import { formatDepartureTime } from "../utils/dateFormatter";

export default function Rides() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, refreshUser } = useAuth();

  const isVerified = user?.isVerified || user?.verificationStatus === "verified";

  // Location list
  const [locations, setLocations] = useState([
    "RCPIT Main Gate",
    "Shirpur Bus Stand",
    "Boys Hostel",
    "Girls Hostel",
    "Library Gate",
    "Shirpur Market",
  ]);

  // Search Bar State (sync with URL params)
  const [from, setFrom] = useState(searchParams.get("from") || "");
  const [to, setTo] = useState(searchParams.get("to") || "");
  const [date, setDate] = useState(
    searchParams.get("date") || new Date().toISOString().split("T")[0]
  );
  const [returnDate, setReturnDate] = useState(searchParams.get("returnDate") || "");
  const [passengers, setPassengers] = useState(
    Number(searchParams.get("passengers")) || 1
  );

  // Filter & Sort State
  const [sortBy, setSortBy] = useState("earliest"); // "earliest" | "lowest_price" | "shortest"
  const [departureTimeSlots, setDepartureTimeSlots] = useState({
    before06: false,
    slot06to12: false,
    slot12to18: false,
    after18: false,
  });
  const [womenOnly, setWomenOnly] = useState(
    searchParams.get("womenOnly") === "true"
  );
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [luggageOnly, setLuggageOnly] = useState(false);

  // Map state
  const [showMapModal, setShowMapModal] = useState(false);

  // Modals
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);

  const handleOpenPublish = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!isVerified) {
      setIsVerifyOpen(true);
      return;
    }
    setIsPublishOpen(true);
  };

  // Rides data
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch campus locations
  useEffect(() => {
    fetch("/api/locations")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.locations?.length) {
          setLocations(data.locations);
        }
      })
      .catch((err) => console.error("Error fetching locations:", err));
  }, []);

  // Fetch rides from server
  const fetchRides = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from && from !== "All" && from.trim()) params.append("from", from.trim());
      if (to && to !== "All" && to.trim()) params.append("to", to.trim());
      if (date) params.append("date", date);
      if (womenOnly) params.append("womenOnly", "true");

      const res = await fetch(`/api/rides?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setRides(data.rides || []);
      }
    } catch (err) {
      console.error("Error fetching rides:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, [from, to, date, womenOnly]);

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (from && from !== "All" && from.trim()) params.append("from", from.trim());
    if (to && to !== "All" && to.trim()) params.append("to", to.trim());
    if (date) params.append("date", date);
    if (returnDate) params.append("returnDate", returnDate);
    if (passengers > 1) params.append("passengers", passengers);
    if (womenOnly) params.append("womenOnly", "true");

    setSearchParams(params);
    fetchRides();
  };

  // Swap From and To
  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  // Filter & Sort rides client-side
  const filteredAndSortedRides = useMemo(() => {
    let result = [...rides];

    // Filter by departure time slots
    const anySlotSelected = Object.values(departureTimeSlots).some(Boolean);
    if (anySlotSelected) {
      result = result.filter((ride) => {
        const depDate = new Date(ride.departureTime);
        const hours = depDate.getHours();
        if (departureTimeSlots.before06 && hours < 6) return true;
        if (departureTimeSlots.slot06to12 && hours >= 6 && hours < 12) return true;
        if (departureTimeSlots.slot12to18 && hours >= 12 && hours < 18) return true;
        if (departureTimeSlots.after18 && hours >= 18) return true;
        return false;
      });
    }

    // Filter by verified driver only
    if (verifiedOnly) {
      result = result.filter(
        (r) => r.driver?.isVerified || r.driver?.verificationBadge
      );
    }

    // Filter by luggage allowed
    if (luggageOnly) {
      result = result.filter((r) => r.luggageAllowed);
    }

    // Filter by passenger seat capacity
    if (passengers > 1) {
      result = result.filter((r) => (r.seatsAvailable || 0) >= passengers);
    }

    // Sort
    if (sortBy === "earliest") {
      result.sort(
        (a, b) => new Date(a.departureTime) - new Date(b.departureTime)
      );
    } else if (sortBy === "lowest_price") {
      result.sort((a, b) => a.pricePerSeat - b.pricePerSeat);
    } else if (sortBy === "shortest") {
      result.sort((a, b) => a.pricePerSeat - b.pricePerSeat);
    }

    return result;
  }, [
    rides,
    departureTimeSlots,
    verifiedOnly,
    luggageOnly,
    passengers,
    sortBy,
  ]);

  const clearAllFilters = () => {
    setSortBy("earliest");
    setDepartureTimeSlots({
      before06: false,
      slot06to12: false,
      slot12to18: false,
      after18: false,
    });
    setWomenOnly(false);
    setVerifiedOnly(false);
    setLuggageOnly(false);
  };

  // Time formatting helper
  const getDepartureTimeFormatted = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  // Estimated arrival time (~20 mins for campus routes)
  const getArrivalTimeFormatted = (dateStr) => {
    const d = new Date(new Date(dateStr).getTime() + 20 * 60 * 1000);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  return (
    <div className="bg-[#f4f6f8] min-h-[calc(100vh-72px)] text-slate-800 pb-20">
      {/* BlaBlaCar-Style Top Search Bar (Matching Screenshot 2) */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-18 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3">
          <form
            onSubmit={handleSearchSubmit}
            className="bg-white rounded-full border border-slate-300 shadow-sm p-1.5 flex flex-col md:flex-row items-stretch md:items-center divide-y md:divide-y-0 md:divide-x divide-slate-200 text-xs sm:text-sm"
          >
            {/* From */}
            <div className="flex-1 px-4 py-2 flex items-center justify-between">
              <div className="flex-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">From</span>
                <input
                  type="text"
                  list="bar-from-suggestions"
                  value={from === "All" ? "" : from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder="Search pickup point or place..."
                  className="font-bold text-slate-900 bg-transparent outline-none w-full text-xs sm:text-sm placeholder:text-slate-400 placeholder:font-normal"
                />
                <datalist id="bar-from-suggestions">
                  {locations.map((loc) => (
                    <option key={`bar-from-${loc}`} value={loc} />
                  ))}
                </datalist>
              </div>

              {/* Swap Button */}
              <button
                type="button"
                onClick={handleSwap}
                className="p-1.5 rounded-full hover:bg-slate-100 text-[#00AFF5] transition ml-2 cursor-pointer shrink-0"
                title="Swap origin and destination"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>
            </div>

            {/* To */}
            <div className="flex-1 px-4 py-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">To</span>
              <input
                type="text"
                list="bar-to-suggestions"
                value={to === "All" ? "" : to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="Search destination or place..."
                className="font-bold text-slate-900 bg-transparent outline-none w-full text-xs sm:text-sm placeholder:text-slate-400 placeholder:font-normal"
              />
              <datalist id="bar-to-suggestions">
                {locations.map((loc) => (
                  <option key={`bar-to-${loc}`} value={loc} />
                ))}
              </datalist>
            </div>

            {/* Departure */}
            <div className="px-4 py-2 min-w-[140px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Departure</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="font-bold text-slate-900 bg-transparent outline-none cursor-pointer w-full text-xs sm:text-sm"
              />
            </div>

            {/* Return (with Clear 'X') */}
            <div className="px-4 py-2 min-w-[130px] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Return</span>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="font-bold text-slate-900 bg-transparent outline-none cursor-pointer w-full text-xs sm:text-sm text-slate-600"
                />
              </div>
              {returnDate && (
                <button
                  type="button"
                  onClick={() => setReturnDate("")}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Passengers */}
            <div className="px-4 py-2 min-w-[120px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Passengers</span>
              <select
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
                className="font-bold text-slate-900 bg-transparent outline-none cursor-pointer w-full text-xs sm:text-sm"
              >
                <option value={1}>1 passenger</option>
                <option value={2}>2 passengers</option>
                <option value={3}>3 passengers</option>
                <option value={4}>4 passengers</option>
              </select>
            </div>

            {/* Search Button */}
            <div className="p-1.5 flex items-center justify-center">
              <button
                type="submit"
                className="w-full md:w-auto px-6 py-2.5 rounded-full bg-[#00AFF5] hover:bg-[#0098d6] text-white font-bold text-sm shadow-md shadow-sky-500/25 transition cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main Content Layout (Sidebar + Results) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        {/* Verification Alert Banner if unverified */}
        {isAuthenticated && !isVerified && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900">
                  Verify your RCPIT Student/Staff ID to book or publish
                </p>
                <p className="text-xs text-slate-600">
                  {user?.verificationStatus === "pending"
                    ? "Your college ID is being reviewed by administration."
                    : "Upload your ID card photo to unlock instant ride booking & seat sharing."}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsVerifyOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm cursor-pointer whitespace-nowrap"
            >
              {user?.verificationStatus === "pending" ? "Check Status" : "Verify College ID"}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Map & Filters Sidebar (Matching Screenshot 2) */}
          <div className="lg:col-span-4 space-y-6">
            {/* 1. Show on Map Preview Card */}
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative group">
              <div className="h-36 bg-gradient-to-tr from-sky-100 via-blue-50 to-indigo-100 flex items-center justify-center relative overflow-hidden">
                {/* Visual map roads grid */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00AFF5_2px,transparent_2px)] [background-size:16px_16px]"></div>
                <div className="absolute inset-x-8 top-1/2 h-1 bg-sky-300/60 rounded"></div>
                <div className="absolute top-6 bottom-6 left-1/3 w-1 bg-sky-300/60 rounded"></div>

                {/* Floating "Show on map" Button */}
                <button
                  type="button"
                  onClick={() => setShowMapModal(true)}
                  className="relative z-10 px-5 py-2.5 rounded-full bg-[#00AFF5] hover:bg-[#0098d6] active:scale-95 text-white font-bold text-xs shadow-lg shadow-sky-500/30 flex items-center gap-2 cursor-pointer transition"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Show on map</span>
                </button>
              </div>
            </div>

            {/* 2. "Sort by" Filter Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-base text-slate-900">Sort by</h3>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs font-semibold text-[#00AFF5] hover:underline cursor-pointer"
                >
                  Clear all
                </button>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="sortBy"
                      checked={sortBy === "earliest"}
                      onChange={() => setSortBy("earliest")}
                      className="w-4 h-4 text-[#00AFF5] focus:ring-[#00AFF5]"
                    />
                    <span className="text-sm font-semibold text-slate-800">Earliest departure</span>
                  </div>
                  <Clock className="w-4 h-4 text-slate-400" />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="sortBy"
                      checked={sortBy === "lowest_price"}
                      onChange={() => setSortBy("lowest_price")}
                      className="w-4 h-4 text-[#00AFF5] focus:ring-[#00AFF5]"
                    />
                    <span className="text-sm font-semibold text-slate-800">Lowest price</span>
                  </div>
                  <Coins className="w-4 h-4 text-slate-400" />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="sortBy"
                      checked={sortBy === "shortest"}
                      onChange={() => setSortBy("shortest")}
                      className="w-4 h-4 text-[#00AFF5] focus:ring-[#00AFF5]"
                    />
                    <span className="text-sm font-semibold text-slate-800">Shortest ride</span>
                  </div>
                  <Hourglass className="w-4 h-4 text-slate-400" />
                </label>
              </div>
            </div>

            {/* 3. "Departure time" Filter Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-3">
                Departure time
              </h3>

              <div className="space-y-3 text-sm">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={departureTimeSlots.before06}
                      onChange={(e) =>
                        setDepartureTimeSlots((prev) => ({
                          ...prev,
                          before06: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 rounded text-[#00AFF5] focus:ring-[#00AFF5]"
                    />
                    <span className="font-medium text-slate-700">Before 06:00</span>
                  </div>
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={departureTimeSlots.slot06to12}
                      onChange={(e) =>
                        setDepartureTimeSlots((prev) => ({
                          ...prev,
                          slot06to12: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 rounded text-[#00AFF5] focus:ring-[#00AFF5]"
                    />
                    <span className="font-medium text-slate-700">06:00 - 12:00</span>
                  </div>
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={departureTimeSlots.slot12to18}
                      onChange={(e) =>
                        setDepartureTimeSlots((prev) => ({
                          ...prev,
                          slot12to18: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 rounded text-[#00AFF5] focus:ring-[#00AFF5]"
                    />
                    <span className="font-medium text-slate-700">12:01 - 18:00</span>
                  </div>
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={departureTimeSlots.after18}
                      onChange={(e) =>
                        setDepartureTimeSlots((prev) => ({
                          ...prev,
                          after18: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 rounded text-[#00AFF5] focus:ring-[#00AFF5]"
                    />
                    <span className="font-medium text-slate-700">After 18:00</span>
                  </div>
                </label>
              </div>
            </div>

            {/* 4. Trust & Amenities Filter Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-3">
                Trust & Safety
              </h3>

              <div className="space-y-3 text-sm">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={womenOnly}
                      onChange={(e) => setWomenOnly(e.target.checked)}
                      className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500"
                    />
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" /> Women-only
                    </span>
                  </div>
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={verifiedOnly}
                      onChange={(e) => setVerifiedOnly(e.target.checked)}
                      className="w-4 h-4 rounded text-[#00AFF5] focus:ring-[#00AFF5]"
                    />
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#00AFF5]" /> Verified drivers
                    </span>
                  </div>
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={luggageOnly}
                      onChange={(e) => setLuggageOnly(e.target.checked)}
                      className="w-4 h-4 rounded text-[#00AFF5] focus:ring-[#00AFF5]"
                    />
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Luggage className="w-3.5 h-3.5 text-slate-500" /> Backpack allowed
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Search Results List (Matching Screenshot 2) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Header: Outbound • Date & Count */}
            <div className="flex items-center justify-between px-1">
              <h2 className="font-extrabold text-base sm:text-lg text-slate-900">
                Outbound • {new Date(date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}{" "}
                <span className="text-slate-500 font-semibold text-sm">
                  {from && from !== "All" ? from : "Any Pickup"} → {to && to !== "All" ? to : "Any Destination"}
                </span>
              </h2>
              <span className="text-xs sm:text-sm font-semibold text-slate-500">
                {filteredAndSortedRides.length} ride{filteredAndSortedRides.length !== 1 ? "s" : ""} available
              </span>
            </div>

            {/* Rides List */}
            {loading ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-slate-200">
                <div className="w-10 h-10 border-3 border-[#00AFF5] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm font-semibold text-slate-600">Finding available rides...</p>
              </div>
            ) : filteredAndSortedRides.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-4">
                <div className="w-16 h-16 rounded-full bg-sky-50 text-[#00AFF5] flex items-center justify-center mx-auto">
                  <Car className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900">No rides match your search</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Try adjusting your filters or date, or be the first to publish a ride on this route!
                  </p>
                </div>
                <button
                  onClick={handleOpenPublish}
                  className="px-6 py-2.5 rounded-full bg-[#00AFF5] hover:bg-[#0098d6] text-white font-bold text-xs shadow-md shadow-sky-500/25 transition cursor-pointer"
                >
                  Offer a Ride
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedRides.map((ride) => (
                  <Link
                    key={ride._id}
                    to={`/rides/${ride._id}`}
                    className="block bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 hover:border-[#00AFF5] hover:shadow-lg transition duration-200 cursor-pointer group"
                  >
                    {/* Top Row: Route Timeline & Bold Price (Matching BlaBlaCar card in Photo 2) */}
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: Departure and Arrival Timeline */}
                      <div className="flex items-center gap-3 sm:gap-6 flex-1">
                        {/* Departure */}
                        <div className="space-y-0.5 min-w-[70px]">
                          <span className="text-base sm:text-lg font-black text-slate-900 block">
                            {getDepartureTimeFormatted(ride.departureTime)}
                          </span>
                          <span className="text-xs font-semibold text-slate-500 block truncate max-w-[120px]">
                            {ride.from}
                          </span>
                        </div>

                        {/* Visual connecting duration line with circles */}
                        <div className="flex-1 max-w-[140px] sm:max-w-[180px] flex items-center justify-center relative">
                          <div className="w-2 h-2 rounded-full border-2 border-slate-400 bg-white z-10 shrink-0"></div>
                          <div className="h-[2px] bg-slate-300 flex-1 relative">
                            <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400 whitespace-nowrap">
                              ~20m
                            </span>
                          </div>
                          <div className="w-2 h-2 rounded-full border-2 border-slate-400 bg-white z-10 shrink-0"></div>
                        </div>

                        {/* Arrival */}
                        <div className="space-y-0.5 min-w-[70px]">
                          <span className="text-base sm:text-lg font-black text-slate-900 block">
                            {getArrivalTimeFormatted(ride.departureTime)}
                          </span>
                          <span className="text-xs font-semibold text-slate-500 block truncate max-w-[120px]">
                            {ride.to}
                          </span>
                        </div>
                      </div>

                      {/* Right: Big Bold Price */}
                      <div className="text-right shrink-0">
                        <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                          ₹{ride.pricePerSeat.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Row: Driver Profile & Badges (Matching Photo 2) */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      {/* Driver Avatar & Rating */}
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00AFF5] to-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                            {ride.driver?.name ? ride.driver.name[0].toUpperCase() : "D"}
                          </div>
                          {(ride.driver?.isVerified || ride.driver?.verificationBadge) && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#00AFF5] text-white flex items-center justify-center border-2 border-white">
                              <ShieldCheck className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-slate-900 group-hover:text-[#00AFF5] transition">
                              {ride.driver?.name}
                            </span>
                            <span className="flex items-center gap-0.5 text-xs font-bold text-slate-700">
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              {(ride.driver?.ratingAvg || ride.driver?.rating || 5.0).toFixed(1)}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {ride.driver?.department || "RCPIT Student"}
                          </span>
                        </div>
                      </div>

                      {/* Feature Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {ride.womenOnly && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-50 text-pink-700 text-[11px] font-bold border border-pink-100">
                            <Heart className="w-3 h-3 text-pink-500 fill-pink-500" /> Women-only
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">
                          <Users className="w-3 h-3 text-slate-500" /> Max. {ride.seatsAvailable} seat{ride.seatsAvailable > 1 ? "s" : ""}
                        </span>

                        {ride.luggageAllowed && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">
                            <Luggage className="w-3 h-3 text-slate-500" /> Backpack
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#00AFF5] group-hover:translate-x-1 transition ml-1">
                          Details <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#00AFF5]" />
                <h3 className="font-bold text-slate-900 text-base">Shirpur Campus Route Map</h3>
              </div>
              <button
                onClick={() => setShowMapModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              <ShirpurMap
                onSelectRoute={() => {
                  setShowMapModal(false);
                  handleOpenPublish();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Publish Modal */}
      <PublishRideModal
        isOpen={isPublishOpen}
        onClose={() => setIsPublishOpen(false)}
        onRideCreated={(newRide) => {
          setIsPublishOpen(false);
          setRides((prev) => [newRide, ...prev]);
        }}
      />

      {/* Verify ID Modal */}
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
