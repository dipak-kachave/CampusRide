import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Search,
  PlusCircle,
  ShieldCheck,
  User,
  LogOut,
  Car,
  Bus,
  ChevronDown,
} from "lucide-react";
import NotificationBell from "./NotificationBell";
import PublishRideModal from "./PublishRideModal";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleOfferRideClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setIsPublishModalOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-18 flex items-center justify-between">
          {/* BlaBlaCar-Style Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            {/* Iconic Double Speech-Bubble Symbol */}
            <div className="relative w-9 h-9 flex items-center justify-center">
              <svg
                viewBox="0 0 36 36"
                className="w-9 h-9 fill-[#00AFF5] drop-shadow-sm transition-transform group-hover:scale-105"
              >
                <path d="M11 5C5.477 5 1 9.477 1 15c0 3.1 1.4 5.9 3.6 7.7L3 30l7.8-2.6C11.8 27.8 12.9 28 14 28c5.523 0 10-4.477 10-10S19.523 5 14 5h-3z" />
                <path
                  d="M23 10c-3.866 0-7 3.134-7 7 0 .5.05.9.15 1.3 1.1-.8 2.4-1.3 3.85-1.3 3.866 0 7 3.134 7 7 0 1.45-.5 2.75-1.3 3.85.4.1.8.15 1.3.15 3.866 0 7-3.134 7-7s-3.134-7-7-7h-4z"
                  fill="#0077B6"
                  opacity="0.9"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="font-black text-2xl tracking-tight text-slate-900 font-sans">
                  Campus<span className="text-[#00AFF5]">Ride</span>
                </span>
                <span className="ml-1.5 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-sky-50 text-[#00AFF5] border border-sky-100">
                  RCPIT
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wide -mt-1 hidden sm:block">
                Campus Carpooling & Shuttle
              </span>
            </div>
          </Link>

          {/* Center Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-8 text-[15px] font-medium text-slate-600">
            <Link
              to="/rides"
              className="hover:text-[#00AFF5] transition flex items-center gap-1.5 font-semibold text-slate-700"
            >
              <Search className="w-4 h-4 text-[#00AFF5]" /> Search Rides
            </Link>
            <Link
              to="/bus-stand"
              className="hover:text-[#00AFF5] transition flex items-center gap-1.5 text-slate-600"
            >
              <Bus className="w-4 h-4 text-amber-500" /> Shirpur Buses
            </Link>
            {user?.email === "dipakka974@gmail.com" && (
              <Link
                to="/admin"
                className="hover:text-indigo-600 transition flex items-center gap-1 text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200 text-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Admin
              </Link>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search Icon Shortcut */}
            <Link
              to="/rides"
              className="p-2 text-slate-600 hover:text-[#00AFF5] hover:bg-slate-50 rounded-full transition"
              title="Search Rides"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* BlaBlaCar-Style "Offer a ride" Pill Button */}
            <button
              onClick={handleOfferRideClick}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#00AFF5] text-[#00AFF5] hover:bg-[#00AFF5]/5 font-semibold text-sm transition transform active:scale-95 cursor-pointer shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-[#00AFF5]" />
              <span className="hidden sm:inline">Offer a ride</span>
              <span className="sm:hidden">Offer</span>
            </button>

            {/* Country / Campus Badge */}
            <div
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm shadow-inner select-none cursor-default"
              title="RCPIT Shirpur Campus • Maharashtra, India"
            >
              🇮🇳
            </div>

            {/* Authentication & User Dropdown */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 relative">
                <NotificationBell />

                {/* Profile Avatar / Trigger */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-100 transition cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#00AFF5] to-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      {user?.name ? user.name[0].toUpperCase() : "U"}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-sm animate-in fade-in slide-in-from-top-2"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="font-bold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                        {user?.verificationStatus === "verified" || user?.isVerified ? (
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <ShieldCheck className="w-3 h-3" /> Verified Student
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            Unverified
                          </span>
                        )}
                      </div>

                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-[#00AFF5] transition font-medium"
                      >
                        <Car className="w-4 h-4 text-slate-400" />
                        <span>My Rides & Bookings</span>
                      </Link>

                      <Link
                        to={`/profile/${user?._id || user?.id}`}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-[#00AFF5] transition font-medium"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Public Trust Profile</span>
                      </Link>

                      {user?.email === "dipakka974@gmail.com" && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2.5 px-4 py-2 text-indigo-600 hover:bg-indigo-50 transition font-bold"
                        >
                          <ShieldCheck className="w-4 h-4 text-indigo-500" />
                          <span>Admin Moderation</span>
                        </Link>
                      )}

                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 transition font-medium text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-[#00AFF5] px-3.5 py-2 rounded-full hover:bg-slate-50 transition"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-white bg-[#00AFF5] hover:bg-[#0098d6] px-4 py-2 rounded-full shadow-md shadow-sky-500/20 transition"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Publish Modal triggered from Offer a ride */}
      <PublishRideModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onRideCreated={(ride) => {
          setIsPublishModalOpen(false);
          navigate("/dashboard");
        }}
      />
    </>
  );
}
