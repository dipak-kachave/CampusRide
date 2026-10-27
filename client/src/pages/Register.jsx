import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  Phone,
  BookOpen,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  IdCard,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import IdCardScanner from "../components/IdCardScanner";

export default function Register() {
  const [userRole, setUserRole] = useState("student"); // "student" | "staff"
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    prn: "",
    role: "student",
    gender: "Female",
    department: "Computer Engineering",
    year: "2nd Year",
  });
  const [idCardData, setIdCardData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRoleToggle = (role) => {
    setUserRole(role);
    setFormData((prev) => ({
      ...prev,
      role: role,
      year: role === "staff" ? "Staff" : "2nd Year",
    }));
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleIdCardScan = (scanResult) => {
    if (scanResult) {
      setIdCardData(scanResult);
      if (scanResult.prn) {
        setFormData((prev) => ({ ...prev, prn: scanResult.prn }));
      }
      if (scanResult.department) {
        setFormData((prev) => ({ ...prev, department: scanResult.department }));
      }
    } else {
      setIdCardData(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanEmail = formData.email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    const cleanPhone = formData.phone.trim();
    if (cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      await register({
        ...formData,
        email: cleanEmail,
        phone: cleanPhone,
        idCardImage: idCardData?.imageData || "",
        idCardVerified: !!idCardData?.collegeVerified || !!idCardData?.prn,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10 bg-slate-50">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-[#00AFF5] text-xs font-bold border border-sky-200">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00AFF5]" />
            RCPIT Campus Registration
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Create Account</h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Open for all RCPIT students & staff. Fast sign up with your personal Gmail.
          </p>
        </div>

        {/* Student vs Staff Role Segmented Tab */}
        <div className="flex rounded-2xl bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => handleRoleToggle("student")}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
              userRole === "student"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <GraduationCap className="w-4 h-4 text-[#00AFF5]" />
            <span>Student</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleToggle("staff")}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
              userRole === "staff"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Briefcase className="w-4 h-4 text-indigo-600" />
            <span>Faculty / Staff</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 shadow-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder={userRole === "staff" ? "Prof. / Dr. Name" : "e.g. Dipak Patil"}
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#00AFF5] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#00AFF5] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Personal Email (Gmail / Any)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                required
                placeholder="yourname@gmail.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#00AFF5] focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Any personal email is supported.
            </p>
          </div>

          {/* Optional ID Card Camera / Upload Scanner */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                {userRole === "staff" ? "Staff / Employee ID Card" : "College ID Card"}
              </label>
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Optional for instant verification
              </span>
            </div>
            <IdCardScanner
              onScanComplete={handleIdCardScan}
              currentPrn={formData.prn}
              onPrnChange={(newPrn) => setFormData((prev) => ({ ...prev, prn: newPrn }))}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {userRole === "staff" ? "Staff / Faculty Employee ID" : "College PRN / Roll Number"}
              <span className="text-slate-400 font-normal ml-1">(Optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <IdCard className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="prn"
                placeholder={userRole === "staff" ? "e.g. RCPIT-EMP-1042" : "Auto-detected or enter e.g. 251107012"}
                value={formData.prn}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#00AFF5] focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {userRole === "staff"
                ? "Used to verify your faculty/staff institutional status."
                : "You can also verify this anytime later from your profile or dashboard."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#00AFF5] focus:outline-none bg-white cursor-pointer"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#00AFF5] focus:outline-none bg-white cursor-pointer"
              >
                <option value="Artificial Intelligence and Machine Learning (AI & ML)">AI & ML</option>
                <option value="Artificial Intelligence and Data Science (AI & DS)">AI & DS</option>
                <option value="Computer Engineering">Computer Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Telecommunication (E&TC)">E&TC</option>
                <option value="Mechanical Engineering">Mechanical</option>
                <option value="Electrical Engineering">Electrical</option>
                <option value="Civil Engineering">Civil</option>
                <option value="Applied Sciences & Humanities">Applied Sciences / ASH</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Year / Designation</label>
              {userRole === "staff" ? (
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#00AFF5] focus:outline-none bg-white cursor-pointer"
                >
                  <option value="Staff">Faculty / Professor</option>
                  <option value="Staff">Lab Assistant / Staff</option>
                </select>
              ) : (
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#00AFF5] focus:outline-none bg-white cursor-pointer"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="Final Year">Final Year</option>
                </select>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                name="password"
                required
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#00AFF5] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-full bg-[#00AFF5] hover:bg-[#0098d6] active:scale-98 text-white font-black text-sm shadow-md shadow-sky-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? "Creating Account..." : "Create Account"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already have an account?{" "}
          <Link to="/login" className="text-[#00AFF5] font-bold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
