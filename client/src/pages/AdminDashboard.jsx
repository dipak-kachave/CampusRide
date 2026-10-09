import React, { useState, useEffect } from "react";
import { ShieldCheck, Users, Bike, Car, AlertTriangle, Bus, CheckCircle2, XCircle, Search, RefreshCw } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const { user, token, isAuthenticated } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [rides, setRides] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState("rides"); // "rides" | "users" | "reports"
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [searchUser, setSearchUser] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [sRes, uRes, rRes, repRes] = await Promise.all([
        fetch("/api/admin/stats", { headers }),
        fetch("/api/admin/users", { headers }),
        fetch("/api/admin/rides", { headers }),
        fetch("/api/reports", { headers }),
      ]);

      const [sData, uData, rData, repData] = await Promise.all([
        sRes.json(),
        uRes.json(),
        rRes.json(),
        repRes.json(),
      ]);

      if (sData.success) setStats(sData.stats);
      if (uData.success) setUsers(uData.users);
      if (rData.success) setRides(rData.rides);
      if (repData.success) setReports(repData.reports);
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleToggleUserVerify = async (userId) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/verify`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMsg(data.message);
        setTimeout(() => setMsg(""), 4000);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveReport = async (reportId) => {
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "Resolved", adminNotes: "Reviewed & resolved by Admin" }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg("Report marked as Resolved!");
        setTimeout(() => setMsg(""), 4000);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Strictly check if user is Dipak Patil
  const isDipakAdmin = user && user.email === "dipakka974@gmail.com";

  if (!isAuthenticated || !isDipakAdmin) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 shadow-inner">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-900">Restricted Admin Portal</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md">
            This administration control room is reserved exclusively for the platform owner (<strong>dipakka974@gmail.com</strong>).
          </p>
        </div>
        <Link
          to="/login"
          className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-md hover:bg-slate-800 transition"
        >
          Sign In as Dipak
        </Link>
      </div>
    );
  }

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.prn?.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.department?.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="pb-24 pt-6 max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-semibold border border-blue-400/30">
            <ShieldCheck className="w-3.5 h-3.5" /> Dipak Patil • Super Admin Authority Console
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">CampusRide Admin Portal</h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Live monitoring dashboard: Track how many students are actively using the app, who is publishing rides, passenger requests, and verify student PRN profiles.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Live Data
        </button>
      </div>

      {msg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {/* Live Analytics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">App Users</span>
          <span className="text-2xl font-black text-slate-900">{stats?.totalUsers || users.length}</span>
          <span className="text-[10px] text-emerald-600 font-semibold">Registered</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Rides</span>
          <span className="text-2xl font-black text-emerald-600">{stats?.totalRides || rides.length}</span>
          <span className="text-[10px] text-slate-400 font-semibold">Published</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Active Now</span>
          <span className="text-2xl font-black text-blue-600">{stats?.activeRides || 0}</span>
          <span className="text-[10px] text-blue-500 font-semibold">Available Seats</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Completed</span>
          <span className="text-2xl font-black text-indigo-600">{stats?.completedRides || 0}</span>
          <span className="text-[10px] text-indigo-500 font-semibold">Safe Trips</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Seat Requests</span>
          <span className="text-2xl font-black text-purple-600">{stats?.totalSeatRequests || 0}</span>
          <span className="text-[10px] text-purple-500 font-semibold">Co-passengers</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Bus Stand</span>
          <span className="text-2xl font-black text-amber-600">{stats?.totalBuses || 12}</span>
          <span className="text-[10px] text-amber-600 font-semibold">Schedules</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab("rides")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
            activeTab === "rides"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          <Car className="w-4 h-4" /> Who is Doing Ride Sharing? ({rides.length})
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
            activeTab === "users"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          <Users className="w-4 h-4" /> App Users & PRN Verification ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
            activeTab === "reports"
              ? "bg-rose-600 text-white shadow-md shadow-rose-500/20"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          <AlertTriangle className="w-4 h-4" /> Safety Reports ({reports.length})
        </button>
      </div>

      {/* TAB 1: RIDE SHARING MONITOR (WHO IS DOING RIDE SHARING) */}
      {activeTab === "rides" && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h2 className="font-bold text-slate-900 text-base">Live Campus Ride Sharing Tracker</h2>
                <p className="text-xs text-slate-500">
                  Detailed inspection of who published rides, which vehicle they used, and all students who requested seats.
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200">
                {rides.length} Total Rides
              </span>
            </div>
          </div>

          {rides.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300">
              <Car className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">No rides published yet in the system.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {rides.map((ride) => (
                <div
                  key={ride._id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3.5 hover:shadow-md transition"
                >
                  {/* Driver Header */}
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-900 text-sm">{ride.driver?.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                          Driver (Owner)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        📧 {ride.driver?.email} • 📞 {ride.driver?.phone}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {ride.driver?.department} • {ride.driver?.year} {ride.driver?.prn ? `• PRN: ${ride.driver?.prn}` : ""}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                        ride.status === "Active"
                          ? "bg-emerald-100 text-emerald-800"
                          : ride.status === "Completed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {ride.status}
                      </span>
                      <span className="text-xs font-bold text-emerald-600 block mt-1">₹{ride.pricePerSeat}/seat</span>
                    </div>
                  </div>

                  {/* Route & Vehicle Info */}
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-xs space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <span>📍 {ride.from}</span>
                      <span>➔</span>
                      <span className="text-emerald-700">{ride.to}</span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                      <span>🚗 {ride.vehicleInfo}</span>
                      <span>⏰ {ride.departureTime}</span>
                      <span>💺 {ride.seatsAvailable}/{ride.seatsTotal} Open Seats</span>
                    </div>
                  </div>

                  {/* Co-Passengers List */}
                  <div className="space-y-2 pt-1 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Co-Passengers / Seat Requests ({ride.passengers?.length || 0}):
                      </span>
                    </div>

                    {(!ride.passengers || ride.passengers.length === 0) ? (
                      <p className="text-[11px] text-slate-400 italic bg-slate-50/60 p-2 rounded-xl text-center">
                        No passenger requests yet for this ride.
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {ride.passengers.map((p, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/70 flex justify-between items-center text-xs"
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-800">{p.user?.name || "Student"}</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                  p.status === "Accepted"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : p.status === "Requested"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-rose-100 text-rose-800"
                                }`}>
                                  {p.status}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-500 block">
                                📞 {p.user?.phone} • 📧 {p.user?.email}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                Pickup: {p.pickupPoint || "Campus Gate"} • Booked {p.seatsBooked || 1} seat(s)
                              </span>
                            </div>

                            <span className="text-[11px] font-mono text-slate-400">
                              {new Date(p.createdAt || ride.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: USERS TABLE & PRN VERIFICATION */}
      {activeTab === "users" && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm space-y-4 p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="font-bold text-slate-800 text-base">Registered CampusRide Members ({users.length})</h2>
              <p className="text-xs text-slate-500">Inspect enrolled accounts, college PRN proofs, and approve profiles.</p>
            </div>
            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Search name, email, PRN..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b">
                <tr>
                  <th className="p-3">User Details</th>
                  <th className="p-3">Contact & Phone</th>
                  <th className="p-3">Department & Year</th>
                  <th className="p-3">College PRN</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <span className="text-[10px] text-slate-400">{u.email}</span>
                      {u.role === "admin" && (
                        <span className="ml-1 text-[9px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded">
                          ADMIN
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="font-mono text-slate-700">{u.phone || "N/A"}</div>
                    </td>
                    <td className="p-3">
                      <div>{u.department}</div>
                      <span className="text-[10px] text-slate-400">{u.year}</span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-800">
                      {u.prn || "N/A"}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.isVerified
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {u.isVerified ? "Verified Member" : "Unverified"}
                      </span>
                    </td>
                    <td className="p-3">
                      {u.email !== "dipakka974@gmail.com" ? (
                        <button
                          onClick={() => handleToggleUserVerify(u._id)}
                          className={`px-3 py-1 rounded-lg font-bold text-[11px] transition ${
                            u.isVerified
                              ? "bg-rose-50 hover:bg-rose-100 text-rose-700"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                          }`}
                        >
                          {u.isVerified ? "Revoke" : "Approve & Verify"}
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">Owner Account</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SAFETY REPORTS */}
      {activeTab === "reports" && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 font-bold text-slate-800 text-sm">
            Safety Complaints & Support Tickets
          </div>
          {reports.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No pending complaints. All campus rides and rentals safe!
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {reports.map((r) => (
                <div key={r._id} className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        {r.targetType}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-1">{r.subject}</h3>
                      <p className="text-xs text-slate-500">Reported by: {r.reportedBy?.name} ({r.reportedBy?.phone})</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      r.status === "Resolved" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {r.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border">{r.description}</p>
                  {r.status !== "Resolved" && (
                    <button
                      onClick={() => handleResolveReport(r._id)}
                      className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                    >
                      Mark as Resolved
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
