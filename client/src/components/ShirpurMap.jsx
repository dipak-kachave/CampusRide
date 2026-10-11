import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Navigation,
  Compass,
  Radio,
  ExternalLink,
  Play,
  Square,
  AlertCircle,
  LocateFixed,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export const SHIRPUR_LANDMARKS = [
  {
    id: "bus_stand",
    name: "Shirpur Bus Stand (MSRTC)",
    type: "Transit Hub",
    distanceKm: 3.2,
    timeMins: "8 mins",
    lat: 21.3496,
    lng: 74.8812,
    desc: "Key transit depot for MSRTC buses to Dhule, Jalgaon, Nashik, Pune & Indore.",
    popular: true,
  },
  {
    id: "nimzari",
    name: "Nimzari Naka",
    type: "Highway Junction",
    distanceKm: 1.8,
    timeMins: "4 mins",
    lat: 21.3575,
    lng: 74.8778,
    desc: "Main highway junction connecting student cafes, fast food hubs & hostels.",
    popular: true,
  },
  {
    id: "karwand",
    name: "Karwand Naka / Main Market",
    type: "Commercial Center",
    distanceKm: 2.5,
    timeMins: "6 mins",
    lat: 21.3521,
    lng: 74.8732,
    desc: "Central Shirpur commercial market for stationery, books & electronics.",
    popular: true,
  },
  {
    id: "hostels",
    name: "RCPIT Student Hostels Area",
    type: "Campus Hostels",
    distanceKm: 0.8,
    timeMins: "2 mins",
    lat: 21.3638,
    lng: 74.8825,
    desc: "Boys & Girls hostel campus clusters and private student residencies.",
    popular: false,
  },
  {
    id: "stadium",
    name: "Mukeshbhai Patel Sports Complex",
    type: "Sports Complex",
    distanceKm: 2.2,
    timeMins: "5 mins",
    lat: 21.3552,
    lng: 74.8856,
    desc: "Campus sports ground, synthetic track, gymnasium and open park.",
    popular: false,
  },
  {
    id: "subhash_chowk",
    name: "Subhash Chowk / Old City",
    type: "City Center",
    distanceKm: 2.9,
    timeMins: "7 mins",
    lat: 21.3482,
    lng: 74.8765,
    desc: "Shirpur city center with medical stores, banks and historic town square.",
    popular: false,
  },
];

export default function ShirpurMap({ onSelectRoute, onSelectDestination }) {
  const [selectedLandmark, setSelectedLandmark] = useState(SHIRPUR_LANDMARKS[0]);
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [mapMode, setMapMode] = useState("google"); // "google" | "satellite"

  // Live GPS Tracking States
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [gpsSpeed, setGpsSpeed] = useState(null);
  const [gpsError, setGpsError] = useState("");
  const [tripProgress, setTripProgress] = useState(0); // 0% to 100%
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedDistanceCovered, setSimulatedDistanceCovered] = useState(0);

  const watchIdRef = useRef(null);
  const simulationIntervalRef = useRef(null);

  // Haversine formula to compute actual distance in KM between 2 points
  const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(2));
  };

  // Toggle Browser GPS Live Tracking
  const toggleLiveGpsTracking = () => {
    if (isLiveTracking) {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      setIsLiveTracking(false);
      setGpsError("");
      return;
    }

    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your current browser.");
      return;
    }

    setGpsError("");
    setIsLiveTracking(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy, speed } = pos.coords;
        setGpsAccuracy(Math.round(accuracy));
        setGpsSpeed(speed ? Math.round(speed * 3.6) : 0);

        const totalDist = selectedLandmark.distanceKm;
        const distToDest = calculateDistanceKm(
          latitude,
          longitude,
          selectedLandmark.lat,
          selectedLandmark.lng
        );
        const covered = Math.max(0, totalDist - distToDest);
        const percent = Math.min(100, Math.round((covered / totalDist) * 100));
        setTripProgress(percent);
      },
      (err) => {
        console.error("GPS Watch error:", err);
        setGpsError(
          err.code === 1
            ? "Location permission denied. Please allow location access in your browser."
            : "Unable to retrieve GPS coordinates. Defaulting to Campus simulation."
        );
        setIsLiveTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Live Transit Simulation (demonstrable anytime for college reviews)
  const toggleRideSimulation = () => {
    if (isSimulating) {
      clearInterval(simulationIntervalRef.current);
      setIsSimulating(false);
      return;
    }

    setIsSimulating(true);
    setTripProgress(0);
    setSimulatedDistanceCovered(0);

    const totalKm = selectedLandmark.distanceKm;
    const stepKm = totalKm / 20;

    simulationIntervalRef.current = setInterval(() => {
      setSimulatedDistanceCovered((prev) => {
        const next = Number((prev + stepKm).toFixed(2));
        if (next >= totalKm) {
          clearInterval(simulationIntervalRef.current);
          setIsSimulating(false);
          setTripProgress(100);
          return totalKm;
        }
        const pct = Math.round((next / totalKm) * 100);
        setTripProgress(pct);
        return next;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    };
  }, []);

  const handleSelect = (lm) => {
    setSelectedLandmark(lm);
    setTripProgress(0);
    setSimulatedDistanceCovered(0);
    if (isSimulating) {
      clearInterval(simulationIntervalRef.current);
      setIsSimulating(false);
    }
    if (onSelectRoute) {
      onSelectRoute({
        from: "RCPIT Main Gate",
        to: lm.name,
        distanceKm: lm.distanceKm,
        ratePerKm: 12,
        estimatedCost: Math.round(lm.distanceKm * 12),
      });
    }
  };

  const calculatedDistance = isRoundTrip
    ? (selectedLandmark.distanceKm * 2).toFixed(1)
    : selectedLandmark.distanceKm;
  const calculatedFare = Math.round(calculatedDistance * 12); // Standard ₹12/KM rule

  // Real Google Maps Directions & Search URL
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    "RCPIT Main Gate Shirpur Maharashtra"
  )}&destination=${encodeURIComponent(
    `${selectedLandmark.name} Shirpur Maharashtra`
  )}&travelmode=driving`;

  // Proper Google Maps Live Embed with Mode Switch
  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    `${selectedLandmark.name}, Shirpur, Maharashtra`
  )}&t=${mapMode === "satellite" ? "k" : "m"}&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            Google Maps & Real-Time Shirpur Campus Tracking
          </div>
          <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Origin: <strong className="text-white">RCPIT Main Gate (21.3621° N, 74.8804° E)</strong>
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Shirpur Live GPS Route Map & ₹12/KM Fare Engine
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
              Navigate real Shirpur campus routes via Google Maps, monitor live vehicle speed & ETA, and verify accurate ₹12 per KM ride sharing contributions.
            </p>
          </div>

          {/* External Google Maps Button */}
          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-slate-900 text-xs font-bold shadow-md hover:bg-slate-100 transition whitespace-nowrap self-start md:self-auto"
          >
            <span>Open in Google Maps App</span>
            <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
          </a>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Landmark Buttons */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Select Campus Destination / Route:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {SHIRPUR_LANDMARKS.map((lm) => {
              const isSelected = selectedLandmark.id === lm.id;
              return (
                <button
                  key={lm.id}
                  onClick={() => handleSelect(lm)}
                  className={`p-3 rounded-2xl text-left border transition flex flex-col justify-between ${
                    isSelected
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/80"
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold line-clamp-1 block">{lm.name}</span>
                    <span
                      className={`text-[10px] block ${
                        isSelected ? "text-emerald-100" : "text-slate-500"
                      }`}
                    >
                      {lm.distanceKm} KM • {lm.timeMins}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-bold mt-2 inline-block ${
                      isSelected ? "text-cyan-300" : "text-emerald-600"
                    }`}
                  >
                    ₹{Math.round(lm.distanceKm * 12)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live GPS Tracking & Controls Bar */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 rounded-2xl space-y-4 shadow-sm border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-3 h-3 rounded-full ${
                  isLiveTracking || isSimulating ? "bg-emerald-400 animate-ping" : "bg-slate-500"
                }`}
              />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
                  {isLiveTracking
                    ? "🔴 Live GPS Satellite Tracking Active"
                    : isSimulating
                    ? "🚗 Live Transit Simulation Running"
                    : "Live GPS Navigation Ready"}
                </span>
                <span className="text-[11px] text-slate-300">
                  Target: <strong>{selectedLandmark.name}</strong> ({selectedLandmark.distanceKm} KM)
                </span>
              </div>
            </div>

            {/* GPS Control Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={toggleLiveGpsTracking}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  isLiveTracking
                    ? "bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                }`}
              >
                <LocateFixed className="w-3.5 h-3.5" />
                {isLiveTracking ? "Stop Live GPS" : "Enable Live GPS"}
              </button>

              <button
                type="button"
                onClick={toggleRideSimulation}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${
                  isSimulating
                    ? "bg-amber-500/20 border-amber-400 text-amber-300"
                    : "bg-white/10 hover:bg-white/20 border-white/20 text-slate-200"
                }`}
              >
                {isSimulating ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isSimulating ? "Stop Simulation" : "Simulate Trip"}
              </button>
            </div>
          </div>

          {gpsError && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{gpsError}</span>
            </div>
          )}

          {/* Real-time Telemetry Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 font-medium block">Route ETA</span>
              <span className="text-base font-bold text-white">{selectedLandmark.timeMins}</span>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 font-medium block">Live Speed</span>
              <span className="text-base font-bold text-emerald-400">
                {isLiveTracking ? `${gpsSpeed || 0} km/h` : isSimulating ? "28 km/h" : "0 km/h"}
              </span>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 font-medium block">Distance Covered</span>
              <span className="text-base font-bold text-cyan-300">
                {isSimulating
                  ? `${simulatedDistanceCovered} / ${selectedLandmark.distanceKm} KM`
                  : `${((tripProgress / 100) * selectedLandmark.distanceKm).toFixed(1)} / ${
                      selectedLandmark.distanceKm
                    } KM`}
              </span>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 font-medium block">Trip Progress</span>
              <span className="text-base font-bold text-amber-300">{tripProgress}%</span>
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="space-y-1">
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 via-cyan-400 to-blue-500 h-full transition-all duration-500"
                style={{ width: `${tripProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>📍 RCPIT Campus</span>
              <span>🏁 {selectedLandmark.name}</span>
            </div>
          </div>
        </div>

        {/* Selected Route Info & Cost Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 rounded-2xl p-5 border border-slate-200">
          {/* Left: Destination Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>Route: RCPIT Campus ➔ {selectedLandmark.name}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{selectedLandmark.desc}</p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-medium block">Route Distance</span>
                <span className="text-base font-extrabold text-slate-900">
                  {selectedLandmark.distanceKm} KM
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-medium block">Estimated Ride Time</span>
                <span className="text-base font-extrabold text-emerald-600">
                  {selectedLandmark.timeMins}
                </span>
              </div>
            </div>

            {/* Round Trip Toggle */}
            <div className="pt-2 flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-700">
                Include Return Trip? (Round-trip)
              </span>
              <button
                type="button"
                onClick={() => setIsRoundTrip(!isRoundTrip)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                  isRoundTrip ? "bg-emerald-600 justify-end" : "bg-slate-300 justify-start"
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md transform"></div>
              </button>
            </div>
          </div>

          {/* Right: ₹12/KM Live Calculator */}
          <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  CampusRide Mobility Rule
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Fixed ₹12 / KM
                </span>
              </div>

              <div className="space-y-1.5 pt-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Actual Route Distance:</span>
                  <span className="font-semibold text-slate-900">{calculatedDistance} KM</span>
                </div>
                <div className="flex justify-between">
                  <span>Fuel Sharing Rate:</span>
                  <span className="font-semibold text-slate-900">{calculatedDistance} KM × ₹12/KM</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">
                  Trip Contribution Rate
                </span>
                <span className="text-3xl font-extrabold text-emerald-600">₹{calculatedFare}</span>
              </div>

              {(onSelectRoute || onSelectDestination) && (
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectRoute) {
                      onSelectRoute({
                        from: "RCPIT Main Gate",
                        to: selectedLandmark.name,
                        distanceKm: calculatedDistance,
                        ratePerKm: 12,
                        estimatedCost: calculatedFare,
                      });
                    }
                    if (onSelectDestination) {
                      onSelectDestination(selectedLandmark.name, calculatedDistance);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-500/20 transition"
                >
                  Apply to Ride Booking
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Google Maps Visual Frame with Mode Switcher */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Google Map Layer:</span>
              <button
                type="button"
                onClick={() => setMapMode("google")}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  mapMode === "google"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                🗺️ Standard Road Map
              </button>
              <button
                type="button"
                onClick={() => setMapMode("satellite")}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  mapMode === "satellite"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                🛰️ Google Satellite
              </button>
            </div>

            <a
              href={googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1 text-xs"
            >
              Directions on Google Maps App <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative h-80 sm:h-96 bg-slate-100">
            <iframe
              title={`Google Map - ${selectedLandmark.name} Shirpur`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={googleMapsEmbedUrl}
              className="w-full h-full"
            ></iframe>

            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 shadow-md border border-slate-200 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                📍 Route: RCPIT ➔ {selectedLandmark.name} ({selectedLandmark.distanceKm} KM)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
