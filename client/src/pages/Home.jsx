import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Calendar,
  Users,
  MapPin,
  Luggage,
  Coins,
  ShieldCheck,
  ArrowRight,
  Heart,
  ChevronDown,
  Check,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [locations, setLocations] = useState([
    "RCPIT Main Gate",
    "Shirpur Bus Stand",
    "Boys Hostel",
    "Girls Hostel",
    "Library Gate",
    "Shirpur Market",
  ]);

  const [from, setFrom] = useState("RCPIT Main Gate");
  const [to, setTo] = useState("Shirpur Bus Stand");
  const [departureDate, setDepartureDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [isPassengerDropdownOpen, setIsPassengerDropdownOpen] = useState(false);
  const [womenOnly, setWomenOnly] = useState(false);

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

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (from && from !== "City or place") params.append("from", from);
    if (to && to !== "City or place") params.append("to", to);
    if (departureDate) params.append("date", departureDate);
    if (passengers) params.append("passengers", passengers);
    if (womenOnly) params.append("womenOnly", "true");

    navigate(`/rides?${params.toString()}`);
  };

  return (
    <div className="bg-white min-h-[calc(100vh-72px)] text-slate-800 pb-20">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 sm:pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Title */}
          <div className="lg:col-span-6 space-y-4">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-[1.15]">
              Travel anywhere together. Spend smarter.
            </h1>
            <p className="text-lg text-slate-600 font-medium max-w-lg">
              Reliable, peer-to-peer campus carpooling exclusively for RCPIT students and staff. Fixed cost-sharing, zero commissions.
            </p>
          </div>

          {/* Right Hero Image (Matching BlaBlaCar photo 1) */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[280px] sm:h-[380px] bg-slate-100 border border-slate-100">
              <img
                src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80"
                alt="Friends carpooling together in car"
                className="w-full h-full object-cover object-center transform hover:scale-102 transition duration-700"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs font-semibold drop-shadow">
                <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur px-3 py-1.5 rounded-full">
                  <ShieldCheck className="w-4 h-4 text-[#00AFF5]" /> Verified RCPIT Campus Ride Network
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Horizontal BlaBlaCar Search Widget */}
        <div className="mt-10 lg:mt-12">
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-2xl sm:rounded-full border border-slate-300 shadow-xl p-2 sm:p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center divide-y sm:divide-y-0 sm:divide-x divide-slate-200"
          >
            {/* From */}
            <div className="flex-1 px-4 py-3 sm:py-2 flex flex-col justify-center">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                From
              </label>
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full font-bold text-slate-900 bg-transparent text-sm sm:text-base outline-none cursor-pointer mt-0.5"
              >
                {locations.map((loc) => (
                  <option key={`from-${loc}`} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* To */}
            <div className="flex-1 px-4 py-3 sm:py-2 flex flex-col justify-center">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                To
              </label>
              <select
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full font-bold text-slate-900 bg-transparent text-sm sm:text-base outline-none cursor-pointer mt-0.5"
              >
                {locations.map((loc) => (
                  <option key={`to-${loc}`} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Departure */}
            <div className="flex-1 px-4 py-3 sm:py-2 flex flex-col justify-center">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Departure
              </label>
              <input
                type="date"
                value={departureDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full font-bold text-slate-900 bg-transparent text-sm sm:text-base outline-none cursor-pointer mt-0.5"
              />
            </div>

            {/* Return */}
            <div className="flex-1 px-4 py-3 sm:py-2 flex flex-col justify-center">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Return
              </label>
              <input
                type="date"
                value={returnDate}
                min={departureDate || new Date().toISOString().split("T")[0]}
                onChange={(e) => setReturnDate(e.target.value)}
                placeholder="Date"
                className="w-full font-bold text-slate-900 bg-transparent text-sm sm:text-base outline-none cursor-pointer mt-0.5 text-slate-500"
              />
            </div>

            {/* Passengers */}
            <div className="relative px-4 py-3 sm:py-2 flex flex-col justify-center min-w-[140px]">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Passengers
              </label>
              <button
                type="button"
                onClick={() => setIsPassengerDropdownOpen(!isPassengerDropdownOpen)}
                className="flex items-center justify-between w-full font-bold text-slate-900 text-sm sm:text-base outline-none cursor-pointer mt-0.5"
              >
                <span>{passengers} passenger{passengers > 1 ? "s" : ""}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* Counter dropdown */}
              {isPassengerDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-30 w-48">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-800">Seats</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={passengers <= 1}
                        onClick={() => setPassengers(Math.max(1, passengers - 1))}
                        className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center font-bold text-slate-700 disabled:opacity-30 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-bold text-base">{passengers}</span>
                      <button
                        type="button"
                        disabled={passengers >= 4}
                        onClick={() => setPassengers(Math.min(4, passengers + 1))}
                        className="w-8 h-8 rounded-full border border-[#00AFF5] text-[#00AFF5] flex items-center justify-center font-bold disabled:opacity-30 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPassengerDropdownOpen(false)}
                    className="w-full mt-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

            {/* Search Submit Button */}
            <div className="p-2 sm:p-1.5 flex items-center justify-center">
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 sm:py-3.5 rounded-xl sm:rounded-full bg-[#00AFF5] hover:bg-[#0098d6] active:scale-98 text-white font-extrabold text-base shadow-md shadow-sky-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="w-5 h-5 text-white" />
                <span>Search</span>
              </button>
            </div>
          </form>

          {/* Underneath Options (Women Only / Student Filter) */}
          <div className="mt-3 flex items-center gap-6 px-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={womenOnly}
                onChange={(e) => setWomenOnly(e.target.checked)}
                className="w-4 h-4 rounded text-[#00AFF5] focus:ring-[#00AFF5] border-slate-300"
              />
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-pink-500 fill-pink-500" /> Women-only rides
              </span>
            </label>

            <span className="text-xs font-medium text-slate-400 hidden sm:inline">
              • Fixed campus cost sharing: ₹10 – ₹60 per seat • No platform fee
            </span>
          </div>
        </div>

        {/* 3 Core BlaBlaCar Value Props (Matching Screenshot 1) */}
        <div className="mt-20 pt-10 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Card 1 */}
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#00AFF5] flex items-center justify-center">
              <Luggage className="w-6 h-6 text-[#00AFF5]" />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Travel everywhere
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Explore all over campus, hostels, and Shirpur with countless verified student carpool rides departing every 15 minutes.
            </p>
          </div>

          {/* Card 2 */}
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#00AFF5] flex items-center justify-center">
              <Coins className="w-6 h-6 text-[#00AFF5]" />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Prices like nowhere
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Benefit from great-value shared costs on your carpool rides. Fixed fuel cost sharing without surge pricing or platform commissions.
            </p>
          </div>

          {/* Card 3 */}
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#00AFF5] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-[#00AFF5]" />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Ride with confidence
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Feel secure, knowing you're riding with carpool members with Verified RCPIT Student & Staff Institutional ID Profiles.
            </p>
          </div>
        </div>

        {/* Quick Route Shortcuts */}
        <div className="mt-16 bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-bold text-slate-900">Popular Campus Routes</h4>
              <p className="text-xs text-slate-500">Fast one-click ride bookings between key spots</p>
            </div>
            <Link to="/rides" className="text-sm font-bold text-[#00AFF5] hover:underline flex items-center gap-1">
              All rides <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => navigate("/rides?from=RCPIT+Main+Gate&to=Shirpur+Bus+Stand")}
              className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-[#00AFF5] transition flex items-center justify-between text-left shadow-sm cursor-pointer"
            >
              <div>
                <p className="font-bold text-sm text-slate-900">RCPIT Main Gate → Shirpur Bus Stand</p>
                <p className="text-xs text-slate-400 mt-0.5">Approx ₹20 • 15 min</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => navigate("/rides?from=Boys+Hostel&to=RCPIT+Main+Gate")}
              className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-[#00AFF5] transition flex items-center justify-between text-left shadow-sm cursor-pointer"
            >
              <div>
                <p className="font-bold text-sm text-slate-900">Boys Hostel → RCPIT Main Gate</p>
                <p className="text-xs text-slate-400 mt-0.5">Approx ₹15 • 10 min</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => navigate("/rides?from=Girls+Hostel&to=Shirpur+Market")}
              className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-[#00AFF5] transition flex items-center justify-between text-left shadow-sm cursor-pointer"
            >
              <div>
                <p className="font-bold text-sm text-slate-900">Girls Hostel → Shirpur Market</p>
                <p className="text-xs text-slate-400 mt-0.5">Approx ₹20 • 12 min</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
