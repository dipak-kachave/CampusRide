import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Bike, ShieldCheck, User, LogOut, Bus, Car } from "lucide-react";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
            <Bike className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-slate-900 tracking-tight">CampusRide</span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">RCPIT</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Mobility & Bus Stand Portal</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link to="/" className="hover:text-blue-600 transition">Home</Link>
          <Link to="/rides" className="hover:text-emerald-600 transition flex items-center gap-1 font-semibold text-emerald-700">
            <Car className="w-4 h-4" /> Share Ride (₹12/KM)
          </Link>
          {/* Rent Vehicle module temporarily disabled as requested */}
          {/* <Link to="/rentals" className="hover:text-blue-600 transition flex items-center gap-1">
            <Bike className="w-4 h-4" /> Rent Vehicle
          </Link> */}
          <Link to="/bus-stand" className="hover:text-amber-600 transition flex items-center gap-1">
            <Bus className="w-4 h-4" /> Shirpur Buses
          </Link>
          {user?.email === "dipakka974@gmail.com" && (
            <Link to="/admin" className="hover:text-indigo-600 transition flex items-center gap-1 text-indigo-700 font-bold bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
              <ShieldCheck className="w-4 h-4 text-indigo-600" /> Admin Portal
            </Link>
          )}
        </nav>

        {/* Right Auth CTA */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <NotificationBell />
              <Link
                to="/dashboard"
                className="flex items-center gap-2 py-1.5 px-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition"
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] uppercase">
                  {user?.name ? user.name[0] : "U"}
                </div>
                <span className="max-w-[100px] truncate">{user?.name}</span>
                {user?.verificationBadge && (
                  <ShieldCheck className="w-4 h-4 text-emerald-600" title="RCPIT Verified Member" />
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="text-slate-500 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 px-3 py-1.5 rounded-lg transition"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 rounded-lg shadow-sm shadow-blue-500/30 transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
