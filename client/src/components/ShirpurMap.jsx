import React, { useState } from "react";
import { MapPin, Navigation, Car, Bike, Calculator, Info, ExternalLink, ShieldCheck, Clock } from "lucide-react";

const SHIRPUR_LANDMARKS = [
  {
    id: "bus_stand",
    name: "Shirpur Bus Stand (MSRTC)",
    type: "Transit Hub",
    distanceKm: 3.2,
    timeMins: "8 mins",
    desc: "Key transit depot for buses to Dhule, Jalgaon, Nashik, Pune & Shahada.",
    popular: true,
  },
  {
    id: "nimzari",
    name: "Nimzari Naka",
    type: "Highway Junction",
    distanceKm: 1.8,
    timeMins: "4 mins",
    desc: "Main campus intersection connecting food hubs, cafes & hostels.",
    popular: true,
  },
  {
    id: "karwand",
    name: "Karwand Naka / Main Market",
    type: "Commercial Hub",
    distanceKm: 2.5,
    timeMins: "6 mins",
    desc: "Central Shirpur shopping, stationery, printing & electronics market.",
    popular: true,
  },
  {
    id: "hostels",
    name: "RCPIT Student Hostels Area",
    type: "Residential",
    distanceKm: 0.8,
    timeMins: "2 mins",
    desc: "Campus hostel clusters & private student paying-guest accommodations.",
    popular: false,
  },
  {
    id: "stadium",
    name: "Mukeshbhai Patel Sports Complex",
    type: "Sports & Recreation",
    distanceKm: 2.2,
    timeMins: "5 mins",
    desc: "Campus sports ground, gymnasium and recreation park.",
    popular: false,
  },
  {
    id: "subhash_chowk",
    name: "Subhash Chowk / Old City",
    type: "Town Center",
    distanceKm: 2.9,
    timeMins: "7 mins",
    desc: "Heritage city area, medical shops, banks and local transport.",
    popular: false,
  },
];

export default function ShirpurMap({ onSelectRoute, onSelectDestination }) {
  const [selectedLandmark, setSelectedLandmark] = useState(SHIRPUR_LANDMARKS[0]);
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [customKm, setCustomKm] = useState(selectedLandmark.distanceKm);

  const handleSelect = (lm) => {
    setSelectedLandmark(lm);
    setCustomKm(lm.distanceKm);
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

  const calculatedDistance = isRoundTrip ? (customKm * 2).toFixed(1) : customKm;
  const calculatedFare = Math.round(calculatedDistance * 12); // Standard ₹12/KM rule

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            Shirpur Campus Route Map & Distance Calculator
          </div>
          <span className="text-xs text-slate-300 font-medium">
            Origin: <strong className="text-white">RCPIT Main Gate</strong>
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          Shirpur Live Route Map & ₹12/KM Ride-Share Calculator
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          Tap any destination below to view the route distance from RCPIT campus and calculate the exact ₹12 per KM ride-sharing fare.
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Landmark Buttons */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Select Campus Landmark / Route:
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
                    <span className={`text-[10px] block ${isSelected ? "text-emerald-100" : "text-slate-500"}`}>
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
                <span className="text-base font-extrabold text-slate-900">{selectedLandmark.distanceKm} KM</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-medium block">Estimated Ride Time</span>
                <span className="text-base font-extrabold text-emerald-600">{selectedLandmark.timeMins}</span>
              </div>
            </div>

            {/* Round Trip Toggle */}
            <div className="pt-2 flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-700">Include Return Trip? (Round-trip)</span>
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
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">CampusRide Mobility Rule</span>
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
                  <span>Standard Fuel Sharing Rate:</span>
                  <span className="font-semibold text-slate-900">{calculatedDistance} KM × ₹12/KM</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Trip Contribution Rate</span>
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
                  Use for Ride Sharing
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Embedded Map Visual Frame */}
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative h-64 sm:h-72 bg-slate-100">
          <iframe
            title="Shirpur Maharashtra Map"
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight="0"
            marginWidth="0"
            src="https://www.openstreetmap.org/export/embed.html?bbox=74.8400%2C21.3300%2C74.9200%2C21.3800&amp;layer=mapnik&amp;marker=21.3533%2C74.8776"
            className="w-full h-full filter saturate-150"
          ></iframe>
          <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-[10px] text-slate-600 shadow border border-slate-200">
            📍 Shirpur, Maharashtra • RCPIT Campus Area • Route: RCPIT ➔ {selectedLandmark.name} ({selectedLandmark.distanceKm} KM)
          </div>
        </div>
      </div>
    </div>
  );
}
