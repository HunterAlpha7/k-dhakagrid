"use client";
import DynamicMap from "@/components/DynamicMap";
import MapControls from "@/components/MapControls";
import { Power, Drop, Fire, WifiHigh, WifiSlash, CheckCircle, Info, Users, X } from "@phosphor-icons/react/dist/ssr";
import { useDhakaGrid } from "@/hooks/useDhakaGrid";
import { useState, useEffect } from "react";
import { Capacitor } from "@capacitor/core";

export default function Home() {
  const { reports, onlineCount, reportDisruption, userLocation, requestLocation } = useDhakaGrid();

  // Default map location if no user location is available
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [reportState, setReportState] = useState<{ water: boolean, gas: boolean }>({ water: false, gas: false });
  const [filter, setFilter] = useState("All");
  const [isOnline, setIsOnline] = useState(true);
  const [toastMsg, setToastMsg] = useState("");
  const [isPanelMinimized, setIsPanelMinimized] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isWeb, setIsWeb] = useState(false);

  useEffect(() => {
    // If we have user location from GPS, use it by default if user hasn't dropped a pin
    if (userLocation) {
      setSelectedLocation(userLocation);
    }
  }, [userLocation]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsWeb(!Capacitor.isNativePlatform());
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let intervalId: NodeJS.Timeout;
    if (reportState.water || reportState.gas) {
      let isAlert = false;
      intervalId = setInterval(() => {
        document.title = isAlert ? "🚨 OUTAGE REPORTED" : "GridPulse";
        isAlert = !isAlert;
      }, 1000);
    } else {
      document.title = "GridPulse";
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      document.title = "GridPulse";
    };
  }, [reportState.water, reportState.gas]);

  const handleReport = async (type: "Water" | "Gas") => {
    if (!selectedLocation) {
      setToastMsg("Please drop a pin on the map first!");
      setTimeout(() => setToastMsg(""), 4000);
      return;
    }

    await reportDisruption(type, selectedLocation.lat, selectedLocation.lng);

    if (type === "Water") setReportState(s => ({ ...s, water: true }));
    if (type === "Gas") setReportState(s => ({ ...s, gas: true }));

    setToastMsg(`Reported ${type} outage at your pinned location.`);
    setTimeout(() => setToastMsg(""), 4000);

    setTimeout(() => {
      if (type === "Water") setReportState(s => ({ ...s, water: false }));
      if (type === "Gas") setReportState(s => ({ ...s, gas: false }));
    }, 30000);
  };

  const filteredReports = reports.filter(r => {
    if (filter === "All") return true;
    return r.utility_type === filter;
  });

  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-slate-50 overflow-hidden relative">
      <header className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/80 backdrop-blur-md z-10 absolute top-0 w-full">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            GridPulse
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">Real-Time Utility Outage Tracker</p>
        </div>

        <div className="flex items-center gap-2">
          {isWeb && (
            <a href="https://github.com/HunterAlpha7/k-dhakagrid/raw/main/GridPulse.apk" download className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-full font-medium transition-colors border border-slate-700 flex items-center gap-1.5 shadow-sm">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 16L7 11l1.4-1.4 2.6 2.6V4h2v8.2l2.6-2.6L17 11l-5 5zm-6 4v-2h12v2H6z" /></svg>
              Get Android App
            </a>
          )}
          <button
            onClick={() => setIsTeamModalOpen(true)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full border border-slate-700 transition-colors"
            aria-label="About Team"
          >
            <Users size={18} weight="fill" />
          </button>
        </div>
      </header>

      {toastMsg && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-blue-500/90 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg shadow-blue-500/20 z-50 flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle size={18} weight="fill" />
          {toastMsg}
        </div>
      )}

      <div className="flex-1 relative w-full h-full pt-20 pb-40">
        <MapControls filter={filter} setFilter={setFilter} />
        <div className="absolute inset-0 z-0">
          <DynamicMap
            reports={filteredReports}
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
            allowManualPin={!userLocation}
          />
        </div>
      </div>

      <div className="absolute bottom-0 w-full max-w-md mx-auto left-0 right-0 bg-slate-900 border-t border-slate-800 rounded-t-3xl p-6 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-10 transition-all duration-300">
        {/* Grabber Area */}
        <div
          className="w-full h-8 -mt-4 mb-2 flex items-center justify-center cursor-pointer"
          onClick={() => setIsPanelMinimized(!isPanelMinimized)}
        >
          <div className="w-12 h-1 bg-slate-700 rounded-full"></div>
        </div>

        <div className={`transition-all duration-300 overflow-hidden ${isPanelMinimized ? 'h-0 opacity-0' : 'h-auto opacity-100 mb-4'}`}>
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-1">Report Disruption</h2>
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">{userLocation ? 'Using precise GPS location' : (!selectedLocation ? 'Tap map to set pin location' : 'Ready to report at pin location')}</p>
            {!userLocation && (
              <button
                onClick={() => requestLocation()}
                className="text-[10px] font-semibold bg-slate-800 text-blue-400 px-3 py-1.5 rounded-full border border-slate-700 active:scale-95 transition-transform whitespace-nowrap"
              >
                Locate Me
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <button
            disabled={reportState.water || !selectedLocation}
            onClick={() => handleReport("Water")}
            className={`flex flex-col items-center justify-center rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700 transition-all active:scale-95 group ${isPanelMinimized ? 'p-3' : 'p-4'}`}
          >
            <div className={`rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform ${isPanelMinimized ? 'w-10 h-10' : 'w-12 h-12 mb-3'}`}>
              <Drop size={isPanelMinimized ? 20 : 24} weight="fill" />
            </div>
            {!isPanelMinimized && <span className="text-sm font-semibold text-center">{reportState.water ? "Reported" : "No Water"}</span>}
          </button>

          <button
            disabled={reportState.gas || !selectedLocation}
            onClick={() => handleReport("Gas")}
            className={`flex flex-col items-center justify-center rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700 transition-all active:scale-95 group ${isPanelMinimized ? 'p-3' : 'p-4'}`}
          >
            <div className={`rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform ${isPanelMinimized ? 'w-10 h-10' : 'w-12 h-12 mb-3'}`}>
              <Fire size={isPanelMinimized ? 20 : 24} weight="fill" />
            </div>
            {!isPanelMinimized && <span className="text-sm font-semibold text-center">{reportState.gas ? "Reported" : "No Gas"}</span>}
          </button>

          <div className={`flex flex-col items-center justify-center rounded-2xl bg-slate-800/50 border border-slate-800 transition-all ${isPanelMinimized ? 'p-3' : 'p-4'}`}>
            <div className={`rounded-full flex items-center justify-center ${isOnline ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'} ${isPanelMinimized ? 'w-10 h-10' : 'w-12 h-12 mb-3'}`}>
              {isOnline ? <WifiHigh size={isPanelMinimized ? 20 : 24} weight="bold" /> : <WifiSlash size={isPanelMinimized ? 20 : 24} weight="bold" />}
            </div>
            {!isPanelMinimized && (
              <>
                <span className="text-sm font-semibold text-center">Power Status</span>
                <span className={`text-[10px] font-bold mt-1 ${isOnline ? 'text-green-500' : 'text-red-500'}`}>
                  {isOnline ? 'No Outage' : 'Outage Detected'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Floating Team Panel */}
      {isTeamModalOpen && (
        <div className="absolute top-20 right-4 z-40 w-64 bg-slate-900/90 border border-slate-700/50 p-4 rounded-xl shadow-2xl backdrop-blur-md animate-in slide-in-from-right-8 fade-in duration-200">
          <button
            onClick={() => setIsTeamModalOpen(false)}
            className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors"
          >
            <X size={16} weight="bold" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center">
              <Users size={16} weight="fill" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Team GridPulse</h2>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Project Members</p>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-xs space-y-2">
            <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
              <span className="font-semibold text-slate-200">Seyam Bin H Rahman</span>
              <span className="text-slate-400">U177</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
              <span className="font-semibold text-slate-200">Muhammad Al-Efad</span>
              <span className="text-slate-400">U147</span>
            </div>
            <div className="pt-1">
              <span className="text-slate-400">Batch: </span>
              <span className="text-blue-400 font-medium">Batch-1</span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
