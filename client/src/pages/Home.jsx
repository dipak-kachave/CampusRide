import React from "react";
import { Link } from "react-router-dom";
import { Car, Bike, Bus, ShieldCheck, ArrowRight, MapPin, Users, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="pb-24 pt-6 max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white p-8 sm:p-12 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative z-10 max-w-2xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified RCPIT Campus Mobility Network
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Campus commutes made <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">safe, affordable & simple</span>.
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Connect exclusively with verified RCPIT students & staff. Share rides between campus & Shirpur Bus Stand, rent bikes, or check the bus timetable in one tap.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to={isAuthenticated ? "/rides" : "/register"}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5"
            >
              Get Started Now <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/bus-stand"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 font-semibold text-sm transition"
            >
              <Bus className="w-4 h-4" /> Bus Timetable
            </Link>
          </div>
        </div>
      </section>

      {/* Core Facilities */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Campus Mobility Services</h2>
          <p className="text-slate-500 text-sm">Designed specifically for the transportation needs of RCPIT Shirpur</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Ride Sharing */}
          <div className="bg-white rounded-2xl p-6 border border-emerald-200/80 shadow-sm hover:shadow-md transition space-y-4">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Car className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Fixed ₹12 / KM Fuel Rate
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Peer Ride Sharing & Carpool</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Traveling between RCPIT Campus and Shirpur Bus Stand or town? Post your empty seats or join a classmate’s ride with transparent, map-verified ₹12/KM fuel cost sharing.
            </p>
            <Link to="/rides" className="inline-flex items-center text-xs font-semibold text-emerald-600 hover:text-emerald-700 gap-1">
              Explore Available Rides & Map <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2: Shirpur Bus Dashboard */}
          <div className="bg-white rounded-2xl p-6 border border-amber-200/80 shadow-sm hover:shadow-md transition space-y-4">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Bus className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                Official MSRTC Timetable
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Shirpur MSRTC Bus Stand</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Find accurate bus departures, real ticket fares, and platform numbers from Shirpur to Dhule, Jalgaon, Nashik, Pune, and Indore.
            </p>
            <Link to="/bus-stand" className="inline-flex items-center text-xs font-semibold text-amber-600 hover:text-amber-700 gap-1">
              View Verified Timetables <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Safety & RCPIT Trust Badge */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span>100% Institutional Trust & Safety</span>
          </div>
          <p className="text-slate-600 text-xs sm:text-sm max-w-xl">
            Only users with active <strong className="text-slate-800">@rcpit.ac.in</strong> email IDs can access the system. Drivers and vehicle owners go through document verification, and both parties rate each other after rides.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm whitespace-nowrap">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          Verified Students & Staff Only
        </div>
      </section>
    </div>
  );
}
