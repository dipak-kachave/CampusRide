import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Car,
  ShieldCheck,
  Star,
  Users,
  ChevronRight,
  ClipboardCheck,
  Leaf,
  Heart,
  Luggage,
  Flag,
  Share2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import RequestSeatModal from "../components/RequestSeatModal";
import ReportModal from "../components/ReportModal";
import VerifyIdCardModal from "../components/VerifyIdCardModal";

export default function RideDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, refreshUser } = useAuth();

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Booking state in the sidebar
  const [passengerCount, setPassengerCount] = useState(1);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [bookedSuccess, setBookedSuccess] = useState(false);

  const isVerified = user?.isVerified || user?.verificationStatus === "verified";
  const isDriver = user && ride?.driver && (user._id === ride.driver._id || user.id === ride.driver._id);

  useEffect(() => {
    fetchRide();
  }, [id]);

  const fetchRide = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/rides/${id}`);
      const data = await res.json();
      if (data.success && data.ride) {
        setRide(data.ride);
      } else {
        setError(data.message || "Ride not found");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load ride details");
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!isVerified) {
      setIsVerifyModalOpen(true);
      return;
    }
    setIsRequestModalOpen(true);
  };

  if (loading) {
    return (
      <div className="bg-[#f4f6f8] min-h-[calc(100vh-72px)] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[#00AFF5] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-semibold text-slate-600">Loading ride details...</p>
        </div>
      </div>
    );
  }

  if (error || !ride) {
    return (
      <div className="bg-[#f4f6f8] min-h-[calc(100vh-72px)] p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-10 text-center border border-slate-200 mt-10">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">{error || "Ride Not Found"}</h2>
          <p className="text-sm text-slate-500 mb-6">
            The ride you are looking for may have departed, expired, or been removed by the driver.
          </p>
          <Link
            to="/rides"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#00AFF5] text-white font-bold text-sm shadow-md"
          >
            <ArrowLeft className="w-4 h-4" /> Back to all rides
          </Link>
        </div>
      </div>
    );
  }

  const departureDateObj = new Date(ride.departureTime);
  const formattedDayDate = departureDateObj.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const departureTimeOnly = departureDateObj.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const arrivalDateObj = new Date(departureDateObj.getTime() + 20 * 60 * 1000);
  const arrivalTimeOnly = arrivalDateObj.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const totalPrice = (ride.pricePerSeat || 0) * passengerCount;

  return (
    <div className="bg-[#f4f6f8] min-h-[calc(100vh-72px)] text-slate-800 pb-24 pt-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        {/* Top Back / Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/rides"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#00AFF5] transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to search results
          </Link>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `CampusRide: ${ride.from} to ${ride.to}`,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#00AFF5] p-2 rounded-lg transition cursor-pointer"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>

        {/* Page Title (Matching Screenshot 3) */}
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-6">
          Ride details
        </h1>

        {bookedSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">
              🎉 Your seat request has been submitted! The driver has been notified and you will receive an in-app confirmation once approved.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Timeline, Notice, Driver Card, Impact (Matching Screenshot 3) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Route Timeline Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              {/* Departure Point */}
              <div className="flex items-start gap-4">
                <div className="text-right min-w-[50px]">
                  <span className="font-black text-lg text-slate-900 block">{departureTimeOnly}</span>
                  <span className="text-[11px] text-slate-400 font-semibold">Dep.</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-3.5 h-3.5 rounded-full border-3 border-[#00AFF5] bg-white mt-1"></div>
                  <div className="w-[2px] h-16 bg-slate-200 my-1"></div>
                </div>

                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-slate-900">{ride.from}</h3>
                    <MapPin className="w-4 h-4 text-[#00AFF5]" />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Pickup Location • Official Campus Pickup Point
                  </p>
                </div>
              </div>

              {/* Arrival Point */}
              <div className="flex items-start gap-4 -mt-3">
                <div className="text-right min-w-[50px]">
                  <span className="font-black text-lg text-slate-900 block">{arrivalTimeOnly}</span>
                  <span className="text-[11px] text-slate-400 font-semibold">Arr.</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-3.5 h-3.5 rounded-full border-3 border-emerald-500 bg-white mt-1"></div>
                </div>

                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-slate-900">{ride.to}</h3>
                    <MapPin className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Drop-off Location • Designated Stop
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Notice Banner (Dark Navy Banner matching Screenshot 3) */}
            <div className="bg-[#052636] text-white rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm">
              <p className="text-xs sm:text-sm font-semibold tracking-wide">
                You'll need to book this ride first. Then you can choose your return.
              </p>
            </div>

            {/* 3. Driver Profile Card (Matching Screenshot 3) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              {/* Driver Header Row */}
              <Link
                to={`/profile/${ride.driver?._id}`}
                className="flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#00AFF5] to-blue-600 text-white font-black text-xl flex items-center justify-center shadow-md">
                      {ride.driver?.name ? ride.driver.name[0].toUpperCase() : "D"}
                    </div>
                    {(ride.driver?.isVerified || ride.driver?.verificationBadge) && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#00AFF5] text-white flex items-center justify-center border-2 border-white">
                        <ShieldCheck className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-black text-lg text-slate-900 group-hover:text-[#00AFF5] transition flex items-center gap-1.5">
                      {ride.driver?.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mt-0.5">
                      <span className="flex items-center gap-1 text-amber-500 font-black">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {(ride.driver?.ratingAvg || ride.driver?.rating || 5.0).toFixed(1)}/5
                      </span>
                      <span>•</span>
                      <span>{ride.driver?.ratingCount || 0} ratings</span>
                    </div>
                  </div>
                </div>

                <div className="p-2 rounded-full group-hover:bg-slate-50 transition">
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#00AFF5] group-hover:translate-x-0.5 transition" />
                </div>
              </Link>

              {/* Ride Rules & Amenities List */}
              <div className="border-t border-slate-100 pt-5 space-y-4 text-sm text-slate-700">
                <div className="flex items-start gap-3.5">
                  <ClipboardCheck className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="font-medium">
                    Your booking won't be confirmed until the driver approves your request
                  </span>
                </div>

                <div className="flex items-start gap-3.5">
                  <Users className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="font-medium">
                    {ride.seatsAvailable} seat{ride.seatsAvailable > 1 ? "s" : ""} currently available • Max 4 passengers
                  </span>
                </div>

                <div className="flex items-start gap-3.5">
                  <Car className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="font-medium">
                    Vehicle: <span className="font-bold text-slate-900">{ride.vehicleInfo || "Campus Verified Vehicle"}</span>
                  </span>
                </div>

                {ride.womenOnly && (
                  <div className="flex items-start gap-3.5 text-pink-700 font-bold bg-pink-50 p-3 rounded-2xl border border-pink-100">
                    <Heart className="w-5 h-5 text-pink-500 fill-pink-500 shrink-0 mt-0.5" />
                    <span>Women-Only: Only female-identified students/staff can book this ride.</span>
                  </div>
                )}

                {ride.notes && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 italic">
                    Driver note: "{ride.notes}"
                  </div>
                )}
              </div>
            </div>

            {/* 4. Eco / CO2 Impact Card (Matching Screenshot 3) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Leaf className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  By choosing this trip, you will help avoid <strong className="text-slate-900 font-bold">~2.4 kg of CO₂</strong> emissions. A shared campus carpool reduces RCPIT traffic congestion and parking load.
                </p>
                <Link to="/" className="text-xs font-bold text-[#00AFF5] hover:underline block">
                  See campus impact report
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Booking Widget (Matching Screenshot 3) */}
          <div className="lg:col-span-5 sticky top-24 space-y-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
              {/* Header: Outbound Date */}
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider block">
                  Outbound
                </span>
                <h3 className="font-black text-xl text-slate-900 mt-0.5">{formattedDayDate}</h3>
              </div>

              {/* Mini Route Summary */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between text-sm font-extrabold text-slate-900">
                  <div className="flex items-center gap-2">
                    <span className="text-[#00AFF5] font-black">{departureTimeOnly}</span>
                    <span>{ride.from}</span>
                  </div>
                  <span className="text-slate-400">→</span>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-black">{arrivalTimeOnly}</span>
                    <span>{ride.to}</span>
                  </div>
                </div>

                {/* Driver summary mini row */}
                <div className="flex items-center gap-2.5 pt-2 border-t border-slate-200/60 text-xs">
                  <Car className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold text-slate-700">{ride.driver?.name}</span>
                  <span className="text-amber-500 flex items-center gap-0.5 font-bold">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {(ride.driver?.ratingAvg || ride.driver?.rating || 5.0).toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Passengers Selector */}
              <div className="flex items-center justify-between py-2">
                <span className="font-bold text-sm text-slate-700">Number of passengers</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={passengerCount <= 1}
                    onClick={() => setPassengerCount(Math.max(1, passengerCount - 1))}
                    className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center font-bold text-slate-600 disabled:opacity-30 cursor-pointer hover:bg-slate-50"
                  >
                    -
                  </button>
                  <span className="font-black text-base">{passengerCount}</span>
                  <button
                    type="button"
                    disabled={passengerCount >= ride.seatsAvailable}
                    onClick={() => setPassengerCount(Math.min(ride.seatsAvailable, passengerCount + 1))}
                    className="w-8 h-8 rounded-full border border-[#00AFF5] text-[#00AFF5] flex items-center justify-center font-bold disabled:opacity-30 cursor-pointer hover:bg-sky-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total Fare Row */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-sm font-semibold text-slate-500">
                  {passengerCount} passenger{passengerCount > 1 ? "s" : ""}
                </span>
                <span className="font-black text-3xl text-slate-900 tracking-tight">
                  ₹{totalPrice.toFixed(2)}
                </span>
              </div>

              {/* Buttons Row (Secondary + Primary matching Screenshot 3) */}
              <div className="space-y-3 pt-2">
                {isDriver ? (
                  <div className="p-4 rounded-2xl bg-slate-100 text-center font-bold text-sm text-slate-600">
                    This is your published ride
                  </div>
                ) : ride.seatsAvailable === 0 || ride.status === "Full" ? (
                  <div className="p-4 rounded-2xl bg-rose-50 text-center font-bold text-sm text-rose-600 border border-rose-200">
                    This ride is fully booked
                  </div>
                ) : (
                  <>
                    {/* Secondary Action: Report or Negotiate */}
                    <button
                      type="button"
                      onClick={() => setIsReportModalOpen(true)}
                      className="w-full py-3 rounded-full border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Flag className="w-4 h-4 text-slate-400" />
                      <span>Report or Query</span>
                    </button>

                    {/* Primary Action: Book Button (Big Blue BlaBlaCar Button) */}
                    <button
                      type="button"
                      onClick={handleBookClick}
                      className="w-full py-4 rounded-full bg-[#00AFF5] hover:bg-[#0098d6] active:scale-98 text-white font-black text-base shadow-lg shadow-sky-500/30 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Book</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <RequestSeatModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        ride={ride}
        onRequestSuccess={() => {
          setIsRequestModalOpen(false);
          setBookedSuccess(true);
          fetchRide();
        }}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportedUser={ride?.driver}
        ride={ride}
      />

      {/* Verify ID Card Modal */}
      <VerifyIdCardModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        onUploadSuccess={() => {
          if (refreshUser) refreshUser();
        }}
      />
    </div>
  );
}
