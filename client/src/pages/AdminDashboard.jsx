import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Users,
  Car,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Eye,
  Camera,
  IdCard,
  X,
  Star,
  Flag,
  UserX,
  UserCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { formatDepartureTime } from "../utils/dateFormatter";

export default function AdminDashboard() {
  const { user, token, isAuthenticated } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [rides, setRides] = useState([]);
  const [reports, setReports] = useState([]);
  const [flaggedUsers, setFlaggedUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("verification"); // "verification" | "flagged" | "rides" | "users" | "reports"
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [selectedIdUser, setSelectedIdUser] = useState(null);

  // Reject modal state
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingUser, setRejectingUser] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [sRes, uRes, rRes, repRes, flagRes] = await Promise.all([
        fetch("/api/admin/stats", { headers }),
        fetch("/api/admin/users", { headers }),
        fetch("/api/admin/rides", { headers }),
        fetch("/api/reports", { headers }),
        fetch("/api/admin/flagged-users", { headers }),
      ]);

      const [sData, uData, rData, repData, flagData] = await Promise.all([
        sRes.json(),
        uRes.json(),
        rRes.json(),
        repRes.json(),
        flagRes.json(),
      ]);

      if (sData.success) setStats(sData.stats);
      if (uData.success) setUsers(uData.users || []);
      if (rData.success) setRides(rData.rides || []);
      if (repData.success) setReports(repData.reports || []);
      if (flagData.success) setFlaggedUsers(flagData.users || []);
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // STEP 3 #4: Verification decision (Approve / Reject)
  const handleVerifyDecision = async (userId, decision, reason = "") => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/verify-decision`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ decision, reason }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(`User ${decision === "approve" ? "approved & verified" : "rejected"}.`);
        setTimeout(() => setMsg(""), 4000);
        setSelectedIdUser(null);
        setRejectingUser(null);
        setRejectReason("");
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // STEP 6: User moderation action (Warn / Suspend / Reinstate)
  const handleModerateUser = async (userId, action, reason = "") => {
    const confirmPrompt =
      action === "suspend"
        ? "Are you sure you want to suspend this user? They will be blocked from publishing or requesting rides."
        : `Apply '${action}' to this user?`;
    if (!window.confirm(confirmPrompt)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}/action`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, reason }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(data.message);
        setTimeout(() => setMsg(""), 4000);
        fetchData();
      } else {
        alert(data.message);
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

  // Strictly check if user is Dipak Kachave
  const isDipakAdmin = user && user.email === "dipakka974@gmail.com";

  if (!isAuthenticated || !isDipakAdmin) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 shadow-inner">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-900">Restricted Admin Portal</h2>
          <p className="text-xs text-slate-500 max-w-sm">
            Only authorized platform owner (Dipak Kachave • dipakka974@gmail.com) has access to this authority console.
          </p>
        </div>
        <Link to="/rides" className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs">
          Return to Campus Rides
        </Link>
      </div>
    );
  }

  const pendingVerificationUsers = users.filter(
    (u) => u.verificationStatus === "pending" || (!u.isVerified && (u.idCardPhoto || u.idCardImage))
  );

  const filteredUsers = users.filter(
    (u) =>
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
            <ShieldCheck className="w-3.5 h-3.5" /> Dipak Kachave • Super Admin Authority Console
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">CampusRide Trust & Safety Console</h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Verify student ID cards, inspect peer rides, monitor auto-flagged commuters, and resolve campus safety reports.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Live Data
        </button>
      </div>

      {msg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Live Analytics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Pending ID Cards</span>
          <span className="text-2xl font-black text-amber-600">
            {pendingVerificationUsers.length}
          </span>
          <span className="text-[10px] text-amber-700 font-semibold">Needs Approval</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Flagged Commuters</span>
          <span className="text-2xl font-black text-rose-600">{flaggedUsers.length}</span>
          <span className="text-[10px] text-rose-700 font-semibold">Auto-flagged</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Rides</span>
          <span className="text-2xl font-black text-emerald-600">{stats?.totalRides || rides.length}</span>
          <span className="text-[10px] text-slate-400 font-semibold">Published</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Seats Booked</span>
          <span className="text-2xl font-black text-blue-600">{stats?.acceptedSeats || 0}</span>
          <span className="text-[10px] text-blue-700 font-semibold">Accepted</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center col-span-2 sm:col-span-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Safety Reports</span>
          <span className="text-2xl font-black text-slate-900">{reports.length}</span>
          <span className="text-[10px] text-slate-400 font-semibold">Logged</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("verification")}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-xs transition cursor-pointer ${
            activeTab === "verification"
              ? "bg-amber-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <IdCard className="w-4 h-4" />
          <span>ID Verification Queue ({pendingVerificationUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("flagged")}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-xs transition cursor-pointer ${
            activeTab === "flagged"
              ? "bg-rose-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Flag className="w-4 h-4" />
          <span>Flagged Users Queue ({flaggedUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("rides")}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-xs transition cursor-pointer ${
            activeTab === "rides"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Live Rides ({rides.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-xs transition cursor-pointer ${
            activeTab === "users"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>All Registered Users ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("reports")}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-xs transition cursor-pointer ${
            activeTab === "reports"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Safety Reports ({reports.length})</span>
        </button>
      </div>

      {/* TAB 1: ID VERIFICATION QUEUE (STEP 3 #4) */}
      {activeTab === "verification" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-900">Student ID Card Verification Queue</h2>
              <p className="text-xs text-slate-500">
                Review uploaded college ID card photos. Approved users receive the official "Verified RCPIT Student" badge.
              </p>
            </div>
          </div>

          {pendingVerificationUsers.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              🎉 No pending verification requests! All submitted ID cards have been reviewed.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingVerificationUsers.map((u) => (
                <div key={u._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">{u.name}</span>
                      <p className="text-slate-500">
                        {u.department} • {u.year}
                      </p>
                      <p className="text-[11px] font-mono text-blue-700 font-bold">
                        PRN: {u.prn || "N/A"} • 📞 {u.phone}
                      </p>
                      <p className="text-[10px] text-slate-400">📧 {u.email}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                      Pending Review
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                    <button
                      onClick={() => setSelectedIdUser(u)}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Inspect ID Card Photo
                    </button>
                    <button
                      onClick={() => handleVerifyDecision(u._id, "approve")}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setRejectingUser(u)}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs border border-rose-200 transition cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FLAGGED USERS QUEUE (STEP 6 #2) */}
      {activeTab === "flagged" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Auto-Flagged Commuters Queue</h2>
            <p className="text-xs text-slate-500">
              Users auto-flagged when cancellations exceed threshold (≥ 3) or average rating falls below 3.0 stars (over ≥ 5 rides).
            </p>
          </div>

          {flaggedUsers.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              ✨ Clean safety record! No commuters currently exceed cancellation or low-rating thresholds.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border rounded-2xl overflow-hidden">
              {flaggedUsers.map((u) => {
                const highCancellations = (u.cancellationCount || 0) >= 3;
                const lowRating = (u.ratingCount || 0) >= 5 && (u.ratingAvg || 5) < 3.0;

                return (
                  <div key={u._id} className="p-4 bg-white hover:bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Link to={`/profile/${u._id}`} className="font-bold text-slate-900 text-sm hover:underline">
                          {u.name}
                        </Link>
                        {u.isSuspended && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-extrabold text-[10px]">
                            SUSPENDED
                          </span>
                        )}
                        {u.warningCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                            {u.warningCount} Warning(s)
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500">
                        {u.department} • 📞 {u.phone} • 📧 {u.email}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {highCancellations && (
                          <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                            ⚠️ High Cancellations: {u.cancellationCount} late cancels (Threshold: 3)
                          </span>
                        )}
                        {lowRating && (
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                            ⭐ Low Rating: {(u.ratingAvg || 5).toFixed(1)}/5 ({u.ratingCount} reviews)
                          </span>
                        )}
                        {u.suspendedReason && (
                          <span className="text-[11px] text-slate-600 italic">
                            Reason: "{u.suspendedReason}"
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleModerateUser(u._id, "warn", "Excessive late cancellations or low co-commuter ratings.")}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-xl text-xs border border-amber-200 transition cursor-pointer"
                      >
                        Issue Warning
                      </button>

                      {!u.isSuspended ? (
                        <button
                          onClick={() => handleModerateUser(u._id, "suspend", "Suspended due to safety and cancellation policy violations.")}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                        >
                          Suspend Account
                        </button>
                      ) : (
                        <button
                          onClick={() => handleModerateUser(u._id, "reinstate")}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                        >
                          Lift Suspension
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: LIVE RIDES TRACKER */}
      {activeTab === "rides" && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex justify-between items-center">
            <div>
              <h2 className="font-bold text-slate-900 text-base">Live Campus Ride Sharing Tracker</h2>
              <p className="text-xs text-slate-500">
                Inspect active and upcoming trips, drivers, and co-commuters.
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200">
              {rides.length} Total Rides
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {rides.map((ride) => (
              <div key={ride._id} className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{ride.driver?.name}</span>
                    <p className="text-[11px] text-slate-500">
                      📧 {ride.driver?.email} • 📞 {ride.driver?.phone}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {ride.driver?.department} {ride.driver?.prn ? `• PRN: ${ride.driver?.prn}` : ""}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
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

                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <span>📍 {ride.from}</span>
                    <span>➔</span>
                    <span className="text-emerald-700">{ride.to}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span>🚗 {ride.vehicleInfo}</span>
                    <span>⏰ {formatDepartureTime(ride.departureTime)}</span>
                    <span>₹{ride.pricePerSeat}/seat</span>
                  </div>
                </div>

                {ride.passengers?.length > 0 && (
                  <div className="space-y-1.5 pt-1 border-t border-slate-100 text-xs">
                    <span className="text-[11px] font-bold text-slate-700">
                      Passengers ({ride.passengers.length}):
                    </span>
                    {ride.passengers.map((p) => (
                      <div key={p._id} className="p-2 rounded-xl bg-slate-50 flex justify-between items-center text-[11px]">
                        <span>
                          <strong>{p.user?.name}</strong> (Pickup: {p.pickupPoint}) • 📞 {p.user?.phone}
                        </span>
                        <span className="font-bold text-emerald-700">{p.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: USERS DIRECTORY */}
      {activeTab === "users" && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm space-y-4 p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="font-bold text-slate-800 text-base">Registered CampusRide Members ({users.length})</h2>
              <p className="text-xs text-slate-500">Inspect enrolled accounts, college PRN proofs, and status.</p>
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
                  <th className="p-3">Contact</th>
                  <th className="p-3">Department & Year</th>
                  <th className="p-3">College PRN</th>
                  <th className="p-3">Verification</th>
                  <th className="p-3">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50">
                    <td className="p-3">
                      <Link to={`/profile/${u._id}`} className="font-bold text-slate-900 hover:underline">
                        {u.name}
                      </Link>
                      <span className="text-[10px] text-slate-400 block">{u.email}</span>
                      {u.role === "admin" && (
                        <span className="text-[9px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded">
                          ADMIN
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-slate-700">{u.phone || "N/A"}</td>
                    <td className="p-3">
                      <div>{u.department}</div>
                      <span className="text-[10px] text-slate-400">{u.year}</span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-800">{u.prn || "N/A"}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.isVerified || u.verificationStatus === "verified"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : u.verificationStatus === "pending"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {u.isVerified || u.verificationStatus === "verified"
                          ? "Verified"
                          : u.verificationStatus === "pending"
                          ? "Pending"
                          : "Unverified"}
                      </span>
                      {(u.idCardPhoto || u.idCardImage) && (
                        <button
                          onClick={() => setSelectedIdUser(u)}
                          className="mt-1 block text-[10px] text-blue-600 font-bold hover:underline"
                        >
                          📷 View ID Card
                        </button>
                      )}
                    </td>
                    <td className="p-3">
                      {u.email !== "dipakka974@gmail.com" ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() =>
                              handleVerifyDecision(
                                u._id,
                                u.isVerified || u.verificationStatus === "verified" ? "reject" : "approve"
                              )
                            }
                            className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition ${
                              u.isVerified || u.verificationStatus === "verified"
                                ? "bg-rose-50 hover:bg-rose-100 text-rose-700"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                            }`}
                          >
                            {u.isVerified || u.verificationStatus === "verified" ? "Revoke" : "Approve"}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                          Platform Owner
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: SAFETY INCIDENT REPORTS */}
      {activeTab === "reports" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div>
            <h2 className="font-bold text-slate-800 text-base">Safety Incident Reports ({reports.length})</h2>
            <p className="text-xs text-slate-500">Student reports regarding conduct, safety, or ride issues.</p>
          </div>

          {reports.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              No reports filed yet.
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div key={rep._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{rep.reason || rep.subject}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rep.status === "Pending"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {rep.status}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Filed by: {rep.reportedBy?.name || "Student"} (📞 {rep.reportedBy?.phone})
                        {rep.reportedUser && (
                          <span className="ml-2 text-rose-700 font-bold">
                            ➔ Against: {rep.reportedUser?.name} (📞 {rep.reportedUser?.phone})
                          </span>
                        )}
                      </p>
                    </div>

                    <span className="text-[10px] text-slate-400">
                      {new Date(rep.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="p-3 bg-white rounded-xl border border-slate-200 text-slate-700 italic">
                    "{rep.description}"
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    {rep.reportedUser && (
                      <button
                        onClick={() =>
                          handleModerateUser(rep.reportedUser._id, "warn", `Reported for: ${rep.reason}`)
                        }
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-xl text-xs border border-amber-200 transition cursor-pointer"
                      >
                        Warn Reported User
                      </button>
                    )}
                    {rep.status !== "Resolved" && (
                      <button
                        onClick={() => handleResolveReport(rep._id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                      >
                        Mark as Resolved
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ID Card Inspection Modal (STEP 3 #4) */}
      {selectedIdUser && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 relative">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[11px] font-bold border border-blue-200 mb-1">
                  <IdCard className="w-3.5 h-3.5 text-blue-600" />
                  College ID Card Verification
                </div>
                <h3 className="text-base font-bold text-slate-900">{selectedIdUser.name}</h3>
                <p className="text-xs text-slate-500">
                  {selectedIdUser.department} • {selectedIdUser.year} • PRN: {selectedIdUser.prn || "N/A"}
                </p>
              </div>
              <button
                onClick={() => setSelectedIdUser(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Private Image streaming with admin token */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center max-h-[55vh]">
                <img
                  src={`/api/admin/users/${selectedIdUser._id}/id-card-photo?token=${token}`}
                  alt={`ID Card photo of ${selectedIdUser.name}`}
                  className="w-full h-full object-contain max-h-[55vh]"
                  onError={(e) => {
                    // Fallback to legacy base64 if available
                    if (selectedIdUser.idCardImage) {
                      e.target.src = selectedIdUser.idCardImage;
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  selectedIdUser.isVerified
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {selectedIdUser.isVerified ? "Currently Verified" : "Pending Verification"}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRejectingUser(selectedIdUser)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
                >
                  Reject with Reason
                </button>
                <button
                  onClick={() => handleVerifyDecision(selectedIdUser._id, "approve")}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm"
                >
                  Approve Student ID
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectingUser && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-sm">Reject ID Verification for {rejectingUser.name}</h3>
            <p className="text-xs text-slate-500">
              Please enter the reason for rejection (this will be displayed to the student so they can correct it):
            </p>
            <textarea
              rows="3"
              placeholder="e.g. ID card photo is blurry, expired card, PRN mismatch..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border text-xs focus:ring-2 focus:ring-rose-500 outline-none"
            ></textarea>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectingUser(null)}
                className="px-3 py-1.5 rounded-xl border text-xs font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerifyDecision(rejectingUser._id, "reject", rejectReason)}
                className="px-4 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
