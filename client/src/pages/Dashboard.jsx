import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ShieldCheck,
  Car,
  Bike,
  Bus,
  PlusCircle,
  Star,
  Phone,
  Mail,
  Award,
  Clock,
  Key,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Navigation,
  AlertTriangle,
  Users,
  MapPin,
  Calendar,
  X,
  Lock,
} from "lucide-react";
import ReportModal from "../components/ReportModal";
import VerifyIdCardModal from "../components/VerifyIdCardModal";
import RatingModal from "../components/RatingModal";
import { formatDepartureTime } from "../utils/dateFormatter";

export default function Dashboard() {
  const { user, token, isAuthenticated, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Tab State: "upcoming" | "past" | "cancelled"
  const [rideTab, setRideTab] = useState("upcoming");

  // Ride sharing states
  const [myPublishedRides, setMyPublishedRides] = useState([]);
  const [myJoinedRides, setMyJoinedRides] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState("");
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);

  // Rating modal state
  const [ratingTarget, setRatingTarget] = useState(null); // { ride, toUser }
  const [isRatingOpen, setIsRatingOpen] = useState(false);

  const isVerified = user?.isVerified || user?.verificationStatus === "verified";

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [pRes, jRes] = await Promise.all([
        fetch("/api/rides/my-published", { headers }),
        fetch("/api/rides/my-joined", { headers }),
      ]);

      const [pData, jData] = await Promise.all([pRes.json(), jRes.json()]);

      if (pData.success) setMyPublishedRides(pData.rides || []);
      if (jData.success) setMyJoinedRides(jData.rides || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Driver: Respond to passenger
  const handleRespondPassenger = async (rideId, passengerId, decision) => {
    try {
      const res = await fetch(`/api/rides/${rideId}/respond-passenger`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ passengerId, decision }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg(decision === "accept" ? "Passenger request accepted!" : "Passenger request declined.");
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Driver: Mark Completed
  const handleCompleteRide = async (rideId) => {
    try {
      const res = await fetch(`/api/rides/${rideId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "Completed" }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg("Ride marked as Completed! Safe commute logged.");
        fetchData();
        if (refreshUser) refreshUser();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Driver: Cancel whole ride
  const handleCancelRide = async (rideId) => {
    if (!window.confirm("Are you sure you want to cancel this entire ride? All passengers will be notified.")) {
      return;
    }
    try {
      const res = await fetch(`/api/rides/${rideId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "Cancelled" }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg("Ride has been cancelled and co-passengers notified.");
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Passenger: Cancel seat request
  const handleCancelPassengerRequest = async (rideId) => {
    if (!window.confirm("Are you sure you want to cancel your seat? Note: Cancellations within 30 mins of departure count toward your cancellation record.")) {
      return;
    }
    try {
      const res = await fetch(`/api/rides/${rideId}/cancel-request`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg(data.message || "Seat request cancelled.");
        fetchData();
        if (refreshUser) refreshUser();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openRating = (ride, toUser) => {
    setRatingTarget({ ride, toUser });
    setIsRatingOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Please log in to access your CampusRide dashboard</h2>
        <Link to="/login" className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow">
          Go to Login
        </Link>
      </div>
    );
  }

  // Filter rides based on tab
  const filterRidesByTab = (ridesList) => {
    const now = new Date();
    return ridesList.filter((r) => {
      const isPast = r.status === "Completed" || r.status === "Expired" || new Date(r.departureTime) < now;
      const isCancelled = r.status === "Cancelled";

      if (rideTab === "cancelled") {
        return isCancelled;
      }
      if (rideTab === "past") {
        return isPast && !isCancelled;
      }
      // "upcoming"
      return !isPast && !isCancelled;
    });
  };

  const displayedPublished = filterRidesByTab(myPublishedRides);
  const displayedJoined = filterRidesByTab(myJoinedRides);

  return (
    <div className="pb-24 pt-6 max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
      {/* Profile Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            {user?.name ? user.name[0].toUpperCase() : "U"}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{user?.name}</h1>
              {isVerified ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified RCPIT Member
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5" /> {user?.verificationStatus === "pending" ? "Pending Review" : "Unverified"}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              {user?.department} • {user?.year} • {user?.gender} {user?.prn ? `• PRN: ${user.prn}` : ""}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {user?.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> {user?.phone}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200/60">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-amber-500 font-bold text-base">
                <Star className="w-4 h-4 fill-amber-400" /> {user?.ratingAvg || user?.rating || 5.0}
              </div>
              <p className="text-[10px] text-slate-400 font-medium">{user?.ratingCount || 0} Reviews</p>
            </div>
            <div className="h-8 w-[1px] bg-slate-200"></div>
            <div className="text-center">
              <span className="text-slate-800 font-bold text-base">
                {user?.ridesCompleted || 0}
              </span>
              <p className="text-[10px] text-slate-400 font-medium">Completed</p>
            </div>
            <div className="h-8 w-[1px] bg-slate-200"></div>
            <div className="text-center">
              <span className={`text-base font-bold ${user?.cancellationCount > 2 ? "text-rose-600" : "text-slate-800"}`}>
                {user?.cancellationCount || 0}
              </span>
              <p className="text-[10px] text-slate-400 font-medium">Cancellations</p>
            </div>
          </div>

          {!isVerified && (
            <button
              onClick={() => setIsVerifyOpen(true)}
              className="px-3.5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition"
            >
              Verify ID
            </button>
          )}

          <Link
            to={`/profile/${user?.id || user?._id}`}
            className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition text-xs font-bold"
            title="View your public trust profile"
          >
            Public Profile
          </Link>

          <button
            onClick={() => setIsReportOpen(true)}
            className="p-3 rounded-2xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition"
            title="Report a safety or conduct issue"
          >
            <AlertTriangle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-sm">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg("")} className="text-xs font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs: Upcoming / Past / Cancelled */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setRideTab("upcoming")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
              rideTab === "upcoming"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Upcoming Rides
          </button>
          <button
            onClick={() => setRideTab("past")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
              rideTab === "past"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Past & Completed
          </button>
          <button
            onClick={() => setRideTab("cancelled")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
              rideTab === "cancelled"
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Cancelled
          </button>
        </div>

        <Link
          to="/rides"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
        >
          + Find / Post Rides
        </Link>
      </div>

      {/* RIDE SHARING CONTENT */}
      <div className="space-y-6">
        {/* Section 1: Published Rides by Driver */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-900">
              Rides You Published ({displayedPublished.length})
            </h2>
            <Link to="/rides" className="text-xs text-emerald-600 font-bold hover:underline">
              + Publish New Ride
            </Link>
          </div>

          {displayedPublished.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              No {rideTab} published rides.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedPublished.map((ride) => {
                const pendingCount =
                  ride.passengers?.filter((p) => p.status === "Requested").length || 0;

                return (
                  <div key={ride._id} className="bg-slate-50 rounded-2xl p-4 border space-y-3 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-slate-900 text-sm">
                          {ride.from} ➔ {ride.to}
                        </span>
                        <p className="text-slate-500 text-[11px]">
                          ⏰ {formatDepartureTime(ride.departureTime)} • {ride.vehicleInfo}
                        </p>
                        <p className="text-[11px] text-emerald-700 font-bold">
                          ₹{ride.pricePerSeat}/seat • {ride.seatsAvailable}/{ride.seatsTotal} seats open
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                          ride.status === "Active"
                            ? "bg-emerald-100 text-emerald-800"
                            : ride.status === "Full"
                            ? "bg-blue-100 text-blue-800"
                            : ride.status === "Completed"
                            ? "bg-slate-200 text-slate-700"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {ride.status}
                      </span>
                    </div>

                    {/* Pending Requests Highlight Banner (STEP 5 #3) */}
                    {pendingCount > 0 && ride.status !== "Cancelled" && (
                      <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-300 text-amber-900 flex items-center justify-between text-xs animate-pulse">
                        <span className="font-extrabold flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          {pendingCount} Pending Seat Request(s)
                        </span>
                        <span className="text-[10px] uppercase font-bold text-amber-700">Action Required</span>
                      </div>
                    )}

                    {/* Passenger Requests list */}
                    {ride.passengers?.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-200">
                        <span className="font-bold text-slate-700 block text-[11px]">
                          Passengers ({ride.passengers.length}):
                        </span>
                        {ride.passengers.map((p) => (
                          <div
                            key={p._id}
                            className={`p-2.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                              p.status === "Requested"
                                ? "bg-amber-50/60 border-amber-200"
                                : p.status === "Accepted"
                                ? "bg-white border-emerald-200"
                                : "bg-slate-100/60 border-slate-200"
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-800">{p.user?.name}</span>
                                <span
                                  className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                    p.status === "Accepted"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : p.status === "Requested"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-slate-200 text-slate-600"
                                  }`}
                                >
                                  {p.status} ({p.seatsBooked} seat)
                                </span>
                              </div>
                              <span className="text-slate-500 block text-[10px] mt-0.5">
                                Pickup: {p.pickupPoint}
                                {p.status === "Accepted" && p.user?.phone && (
                                  <strong className="text-blue-700 ml-1.5">
                                    📞 {p.user.phone}
                                  </strong>
                                )}
                              </span>
                            </div>

                            {p.status === "Requested" && ride.status !== "Cancelled" && (
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => handleRespondPassenger(ride._id, p._id, "accept")}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] shadow-sm transition"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleRespondPassenger(ride._id, p._id, "reject")}
                                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-[10px] border border-rose-200 transition"
                                >
                                  Decline
                                </button>
                              </div>
                            )}

                            {ride.status === "Completed" && p.status === "Accepted" && (
                              <button
                                onClick={() => openRating(ride, p.user)}
                                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg text-[10px] border border-amber-200 flex items-center gap-1 transition"
                              >
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> Rate Passenger
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Driver ride actions */}
                    {ride.status === "Active" || ride.status === "Full" ? (
                      <div className="flex gap-2 pt-2 border-t border-slate-200">
                        <button
                          onClick={() => handleCompleteRide(ride._id)}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-sm"
                        >
                          Mark Completed
                        </button>
                        <button
                          onClick={() => handleCancelRide(ride._id)}
                          className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs border border-rose-200 transition"
                        >
                          Cancel Ride
                        </button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: Joined / Requested Rides by Passenger */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Rides You Requested / Joined ({displayedJoined.length})
          </h2>

          {displayedJoined.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              No {rideTab} joined rides.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedJoined.map((ride) => {
                const myPassengerRecord = ride.passengers?.find(
                  (p) => (p.user?._id || p.user) === user?._id || (p.user?._id || p.user) === user?.id
                );
                const isAccepted = myPassengerRecord?.status === "Accepted";
                const isRequested = myPassengerRecord?.status === "Requested";

                return (
                  <div key={ride._id} className="bg-slate-50 rounded-2xl p-4 border space-y-3 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-slate-900 text-sm">
                          {ride.from} ➔ {ride.to}
                        </span>
                        <p className="text-slate-500 text-[11px]">
                          Driver:{" "}
                          <Link
                            to={`/profile/${ride.driver?._id || ride.driver}`}
                            className="font-bold text-emerald-700 hover:underline"
                          >
                            {ride.driver?.name}
                          </Link>
                          {isAccepted && ride.driver?.phone ? (
                            <strong className="text-blue-700 ml-1.5 font-mono">
                              📞 {ride.driver.phone}
                            </strong>
                          ) : (
                            <span className="text-slate-400 italic ml-1.5 text-[10px]">
                              (Phone revealed once accepted)
                            </span>
                          )}
                        </p>
                        <p className="text-slate-600 text-[11px] mt-0.5">
                          Departure: <strong>{formatDepartureTime(ride.departureTime)}</strong> • ₹{ride.pricePerSeat}/seat
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          isAccepted
                            ? "bg-emerald-100 text-emerald-800"
                            : isRequested
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {myPassengerRecord?.status || ride.status}
                      </span>
                    </div>

                    {/* Passenger Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 gap-2">
                      {(isAccepted || isRequested) && ride.status !== "Completed" && ride.status !== "Cancelled" && (
                        <button
                          onClick={() => handleCancelPassengerRequest(ride._id)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs border border-rose-200 transition"
                        >
                          Cancel Booking
                        </button>
                      )}

                      {ride.status === "Completed" && isAccepted && (
                        <button
                          onClick={() => openRating(ride, ride.driver)}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-xl text-xs border border-amber-200 flex items-center gap-1 transition"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> Rate Driver
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />

      <VerifyIdCardModal
        isOpen={isVerifyOpen}
        onClose={() => setIsVerifyOpen(false)}
        onUploadSuccess={() => {
          fetchData();
          if (refreshUser) refreshUser();
        }}
      />

      <RatingModal
        isOpen={isRatingOpen}
        onClose={() => setIsRatingOpen(false)}
        ride={ratingTarget?.ride}
        toUser={ratingTarget?.toUser}
        onRatingSuccess={() => {
          setActionMsg("Review and rating recorded successfully!");
          fetchData();
        }}
      />
    </div>
  );
}
