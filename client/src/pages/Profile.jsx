import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ShieldCheck, Star, Award, Calendar, AlertTriangle, ArrowLeft, Car, ThumbsUp, XCircle } from "lucide-react";

export default function Profile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/ratings/profile/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.profile) {
          setProfile(data.profile);
        } else {
          setError(data.message || "Failed to load profile.");
        }
      })
      .catch((err) => {
        console.error("Error loading profile:", err);
        setError("Error connecting to server.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
        <div className="w-9 h-9 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-slate-500">Loading student trust profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <XCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">{error || "Profile Not Found"}</h2>
        <p className="text-xs text-slate-500">The requested campus profile does not exist or has been removed.</p>
        <Link to="/rides" className="inline-block px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs">
          Back to Campus Rides
        </Link>
      </div>
    );
  }

  const memberSinceFormatted = profile.memberSince
    ? new Date(profile.memberSince).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "RCPIT Student";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 pb-24">
      {/* Back button */}
      <div>
        <Link
          to="/rides"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Rides
        </Link>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white font-extrabold text-3xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
              {profile.name ? profile.name[0].toUpperCase() : "U"}
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">{profile.name}</h1>
                {profile.isVerified ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified RCPIT Student
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                    Unverified Member
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {profile.department} • {profile.year} • {profile.gender}
              </p>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" /> Member since {memberSinceFormatted}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/70 sm:self-center">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-amber-500 font-extrabold text-xl">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span>{profile.ratingAvg?.toFixed(1) || "5.0"}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                {profile.ratingCount} {profile.ratingCount === 1 ? "Review" : "Reviews"}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 text-center">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              Completed Rides
            </span>
            <span className="text-2xl font-black text-emerald-900">{profile.ridesCompleted || 0}</span>
            <span className="text-[10px] text-emerald-600 block font-medium">Safe Commutes</span>
          </div>

          <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100 text-center">
            <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
              Trust Score
            </span>
            <span className="text-2xl font-black text-blue-900">
              {profile.ratingCount > 0 ? `${Math.round(profile.ratingAvg * 20)}%` : "100%"}
            </span>
            <span className="text-[10px] text-blue-600 block font-medium">Community Rating</span>
          </div>

          <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-100 text-center">
            <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">
              Campus ID
            </span>
            <span className="text-sm font-black text-purple-900 block mt-1">
              {profile.isVerified ? "Verified" : "Pending"}
            </span>
            <span className="text-[10px] text-purple-600 block font-medium">RCPIT Shirpur</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
              Late Cancellations
            </span>
            <span className={`text-2xl font-black ${profile.cancellations > 2 ? "text-rose-600" : "text-slate-900"}`}>
              {profile.cancellations || 0}
            </span>
            <span className="text-[10px] text-slate-400 block font-medium">Last-minute Flags</span>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              Verified Co-Commuter Reviews ({profile.reviews?.length || 0})
            </h3>
          </div>

          {!profile.reviews || profile.reviews.length === 0 ? (
            <div className="bg-slate-50/80 rounded-2xl p-6 text-center border border-dashed border-slate-200">
              <p className="text-xs text-slate-400 italic">No written reviews yet for this student.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {profile.reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      {rev.reviewer?.name} ({rev.reviewer?.department})
                    </span>
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < rev.score ? "fill-amber-400 text-amber-400" : "text-slate-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {rev.comment && <p className="text-slate-600 italic">"{rev.comment}"</p>}
                  <span className="text-[10px] text-slate-400 block pt-1">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
