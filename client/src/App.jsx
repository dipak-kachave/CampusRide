import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import MobileBottomNav from "./components/MobileBottomNav";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import BusDashboard from "./pages/BusDashboard";
import Rides from "./pages/Rides";
import Rentals from "./pages/Rentals";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-500 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/bus-stand" element={<BusDashboard />} />
              <Route path="/rides" element={<Rides />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/rentals" element={<Rentals />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <MobileBottomNav />
        </div>
      </Router>
    </AuthProvider>
  );
}
