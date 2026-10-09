import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Car, Bike, Bus, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function MobileBottomNav() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const links = [
    { to: "/", label: "Home", icon: Home },
    { to: "/rides", label: "Rides (₹12/KM)", icon: Car },
    // Rentals temporarily hidden
    { to: "/bus-stand", label: "Buses", icon: Bus },
    { to: isAuthenticated ? "/dashboard" : "/login", label: isAuthenticated ? "Profile" : "Login", icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 py-1.5 px-3">
      <div className="flex justify-around items-center">
        {links.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[11px] font-medium transition ${
                isActive ? "text-blue-600 font-semibold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
