import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, Car, Bike, Bus, PlusCircle, Star, Phone, Mail, Award, Clock, Key, CheckCircle2, XCircle, ArrowRight, Navigation, AlertTriangle, Users } from "lucide-react";
import ReportModal from "../components/ReportModal";

export default function Dashboard() {
  const { user, token, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState("rides"); // Focus on Peer Ride Sharing

  // Ride sharing states
  const [myPublishedRides, setMyPublishedRides] = useState([]);
  const [myJoinedRides, setMyJoinedRides] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState("");
  const [isReportOpen, setIsReportOpen] = useState(false);

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [pRes, jRes] = await Promise.all([
        fetch("/api/rides/my-published", { headers }),
        fetch("/api/rides/my-joined", { headers }),
      ]);

      const [pData, jData] = await Promise.all([
        pRes.json(),
        jRes.json(),
      ]);

      if (pData.success) setMyPublishedRides(pData.rides);
      if (jData.success) setMyJoinedRides(jData.rides);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Rental Owner Handlers
  const handleAcceptRental = async (id) => {
    try {
      const res = await fetch(`/api/rentals/${id}/accept`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg("Rental request accepted! Meet student for bike handover.");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartRental = async (id) => {
    const startKm = startKmInputs[id];
    if (!startKm || Number(startKm) <= 0) {
      alert("Please enter current odometer Start KM");
      return;
    }

    try {
      const res = await fetch(`/api/rentals/${id}/start`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ startKm: Number(startKm) }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg("Trip started! Bike handed over.");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteRental = async (id) => {
    const endKm = endKmInputs[id];
    if (!endKm || Number(endKm) <= 0) {
      alert("Please enter return odometer End KM");
      return;
    }

    try {
      const res = await fetch(`/api/rentals/${id}/complete`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ endKm: Number(endKm) }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg(data.message || "Trip completed and bill generated!");
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Ride Driver Handlers
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
        setActionMsg(decision === "accept" ? "Passenger accepted!" : "Passenger declined.");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

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
      }
    } catch (err) {
      console.error(err);
    }
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

  return (
    <div className="pb-24 pt-6 max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
      {/* Profile Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            {user?.name ? user.name[0].toUpperCase() : "U"}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{user?.name}</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" /> RCPIT Verified Member
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {user?.department} • {user?.year} {user?.prn ? `• PRN: ${user.prn}` : ""}
            </p>
            <div className="flex items-center gap-4 pt-1 text-xs text-slate-600">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" /> {user?.email}</span>
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> {user?.phone}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200/60">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-amber-500 font-bold text-base">
                <Star className="w-4 h-4 fill-amber-400" /> {user?.rating || 5.0}
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Rating</p>
            </div>
            <div className="h-8 w-[1px] bg-slate-200"></div>
            <div className="text-center">
              <span className="text-slate-800 font-bold text-base">
                {myPublishedRides.length + myJoinedRides.length}
              </span>
              <p className="text-[10px] text-slate-400 font-medium">Total Rides</p>
            </div>
          </div>

          <button
            onClick={() => setIsReportOpen(true)}
            className="p-3 rounded-2xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition"
            title="Report safety or lost item"
          >
            <AlertTriangle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-sm">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg("")} className="text-xs font-bold underline">Dismiss</button>
        </div>
      )}

      {/* Quick Action Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/rides"
          className="group p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:border-emerald-500 hover:shadow-md transition space-y-2"
        >
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition">
              <Car className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              ₹12 / KM Fuel Rate
            </span>
          </div>
          <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition">Ride Sharing & Carpool</h3>
          <p className="text-xs text-slate-500">Publish empty seats or reserve a seat between campus & Shirpur town.</p>
        </Link>

        <Link
          to="/bus-stand"
          className="group p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:border-amber-500 hover:shadow-md transition space-y-2"
        >
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition">
              <Bus className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              Live MSRTC
            </span>
          </div>
          <h3 className="font-bold text-slate-900 group-hover:text-amber-600 transition">Shirpur Bus Stand Timetable</h3>
          <p className="text-xs text-slate-500">Verified departures & platform numbers for Dhule, Jalgaon, Nashik & Pune.</p>
        </Link>
      </div>

      {/* Ride Sharing Hub Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Your Campus Ride Activity</h2>
            <p className="text-xs text-slate-500">Manage published trips, passenger seat requests, and joined rides.</p>
          </div>
        </div>
        <Link
          to="/rides"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
        >
          + Find / Post Rides
        </Link>
      </div>

      {/* RIDE SHARING SECTION */}
      <div className="space-y-6">
        {/* Published Rides by Driver */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-900">Rides You Published ({myPublishedRides.length})</h2>
            <Link to="/rides" className="text-xs text-emerald-600 font-bold hover:underline">+ Publish New Ride</Link>
          </div>
          {myPublishedRides.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">You haven't published any rides yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myPublishedRides.map((ride) => (
                <div key={ride._id} className="bg-slate-50 rounded-2xl p-4 border space-y-3 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-slate-900">{ride.from} ➔ {ride.to}</span>
                      <p className="text-slate-500">⏰ {ride.departureTime} • {ride.vehicleInfo}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">{ride.status}</span>
                  </div>

                  {/* Passenger Requests list */}
                  {ride.passengers?.length > 0 && (
                    <div className="space-y-1.5 pt-1 border-t">
                      <span className="font-bold text-slate-700 block text-[11px]">Passenger Seat Requests:</span>
                      {ride.passengers.map((p) => (
                        <div key={p._id} className="bg-white p-2 rounded-xl border flex justify-between items-center">
                          <div>
                            <span className="font-bold text-slate-800">{p.user?.name}</span>
                            <span className="text-slate-400 block text-[10px]">Pickup: {p.pickupPoint} • 📞 {p.user?.phone}</span>
                          </div>
                          {p.status === "Requested" ? (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleRespondPassenger(ride._id, p._id, "accept")}
                                className="px-2 py-1 bg-emerald-600 text-white font-bold rounded-lg text-[10px]"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleRespondPassenger(ride._id, p._id, "reject")}
                                className="px-2 py-1 bg-rose-50 text-rose-700 font-bold rounded-lg text-[10px]"
                              >
                                Decline
                              </button>
                            </div>
                          ) : (
                            <span className="font-bold text-emerald-600 text-[10px]">{p.status}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {ride.status === "Active" && (
                    <button
                      onClick={() => handleCompleteRide(ride._id)}
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs mt-1"
                    >
                      Mark Ride Completed
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Joined Rides */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">Rides You Requested / Joined ({myJoinedRides.length})</h2>
          {myJoinedRides.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No ride-share requests sent yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myJoinedRides.map((ride) => (
                <div key={ride._id} className="bg-slate-50 rounded-2xl p-4 border space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-slate-900">{ride.from} ➔ {ride.to}</span>
                      <p className="text-slate-500">Driver: {ride.driver?.name} (📞 {ride.driver?.phone})</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 font-bold text-[10px]">{ride.status}</span>
                  </div>
                  <p className="text-slate-600">Departure: {ride.departureTime} • ₹{ride.pricePerSeat}/seat</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
    </div>
  );
}
