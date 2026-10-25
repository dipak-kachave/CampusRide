import React, { useState, useRef } from "react";
import { X, ShieldCheck, Upload, Camera, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function VerifyIdCardModal({ isOpen, onClose, onUploadSuccess }) {
  const { token, user, refreshUser } = useAuth();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!["image/jpeg", "image/png", "image/jpg"].includes(selected.type)) {
      setError("Please select a valid image file (.jpg, .jpeg, or .png).");
      return;
    }

    if (selected.size > 2 * 1024 * 1024) {
      setError("Image size exceeds 2 MB. Please select a smaller photo.");
      return;
    }

    setError("");
    setFile(selected);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(selected);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select or capture a photo of your College ID Card.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("idCard", file);

      const res = await fetch("/api/auth/upload-id-card", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to upload ID card photo.");
      }

      setSuccess("ID Card submitted successfully! Status updated to Pending Review.");
      if (refreshUser) refreshUser();
      if (onUploadSuccess) onUploadSuccess();

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || "Error uploading ID card");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-md border border-slate-200 shadow-2xl overflow-hidden my-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">RCPIT Student Verification</h2>
              <p className="text-[11px] text-blue-100">Upload college ID card (Max 2 MB)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleUpload} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Photo guidelines */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs text-slate-600 space-y-1">
            <p className="font-bold text-slate-800">Verification Requirement:</p>
            <p className="text-[11px]">
              Only verified RCPIT students/staff can publish rides or request empty seats. Your photo is securely stored and reviewed solely by college administration.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleFileSelect}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />

          {!preview ? (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-blue-200 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50 text-blue-700 transition cursor-pointer text-xs font-bold"
              >
                <Camera className="w-6 h-6 text-blue-600" />
                <span>Snap Camera Photo</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-700 transition cursor-pointer text-xs font-bold"
              >
                <Upload className="w-6 h-6 text-slate-600" />
                <span>Upload JPG / PNG</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-48 bg-slate-950 flex items-center justify-center">
                <img src={preview} alt="ID preview" className="w-full h-full object-contain max-h-48" />
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-center text-slate-500 font-medium">
                Photo selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !file}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Submit for Verification"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
