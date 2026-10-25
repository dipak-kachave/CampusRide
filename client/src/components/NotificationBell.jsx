import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, Clock, X, Info, AlertTriangle, ShieldCheck, Car } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function NotificationBell() {
  const { token, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!token || !isAuthenticated) return;
    try {
      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Notifications poll error:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [token, isAuthenticated]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications/mark-read", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0) {
            markAllRead();
          }
        }}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition focus:outline-none"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-extrabold text-white bg-rose-600 rounded-full animate-pulse shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
              <Bell className="w-3.5 h-3.5 text-blue-600" /> Notifications
            </div>
            {notifications.length > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 italic">
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`p-3 space-y-1 transition text-xs ${
                    n.isRead ? "bg-white" : "bg-blue-50/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-[11px] flex items-center gap-1">
                      {n.type === "ride_request" && <Car className="w-3 h-3 text-emerald-600" />}
                      {n.type === "request_accepted" && <Check className="w-3 h-3 text-emerald-600" />}
                      {n.type === "request_cancelled" && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                      {n.type === "ride_cancelled" && <X className="w-3 h-3 text-rose-600" />}
                      {n.type === "verification" && <ShieldCheck className="w-3 h-3 text-blue-600" />}
                      {n.title}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{n.message}</p>
                </div>
              ))
            )}
          </div>

          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-bold text-slate-700 hover:text-emerald-700"
            >
              View Dashboard & Active Rides →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
