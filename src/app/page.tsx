"use client";
import DynamicMap from "@/components/DynamicMap";
import MapControls from "@/components/MapControls";
import { Power, Drop, Fire, WifiHigh, WifiSlash } from "@phosphor-icons/react/dist/ssr";
import { useDhakaGrid } from "@/hooks/useDhakaGrid";
import { useState, useEffect } from "react";

export default function Home() {
  const { reports, onlineCount, reportDisruption, userLocation } = useDhakaGrid();
  
  // Default map location if no user location is available
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null);
  const [reportState, setReportState] = useState<{ water: boolean, gas: boolean }>({ water: false, gas: false });
  const [filter, setFilter] = useState("All");
  const [isOnline, setIsOnline] = useState(true);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    // If we have user location from GPS, use it by default if user hasn't dropped a pin
    if (userLocation && !selectedLocation) {
      setSelectedLocation(userLocation);
    }
  }, [userLocation]);

  useEffect(() => {
    if (typeof window !== "undefined") {
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
        document.title = isAlert ? "🚨 OUTAGE REPORTED" : "DhakaGrid";
        isAlert = !isAlert;
      }, 1000);
    } else {
      document.title = "DhakaGrid";
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      document.title = "DhakaGrid";
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
            DhakaGrid
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">Real-Time Utility Tracker</p>
        </div>
        <div className="text-right flex flex-col items-end">
        </div>
      </header>

      {toastMsg && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 px-4 py-2 rounded-full text-sm font-semibold z-50 shadow-lg animate-in slide-in-from-top-4 fade-in duration-300">
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

      <div className="absolute bottom-0 w-full max-w-md mx-auto left-0 right-0 bg-slate-900 border-t border-slate-800 rounded-t-3xl p-6 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-10">
        <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-6"></div>
        <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-1">Report Disruption</h2>
        <p className="text-xs text-slate-500 mb-4">{userLocation ? 'Using precise GPS location' : (!selectedLocation ? 'Tap map to set pin location' : 'Ready to report at pin location')}</p>
        
        <div className="grid grid-cols-3 gap-4">
          <button 
            disabled={reportState.water}
            onClick={() => handleReport("Water")}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 transition-all active:scale-95 group"
          >
            <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Drop size={24} weight="fill" />
            </div>
            <span className="text-sm font-semibold text-center">{reportState.water ? "Reported" : "No Water"}</span>
          </button>
          
          <button 
            disabled={reportState.gas}
            onClick={() => handleReport("Gas")}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 transition-all active:scale-95 group"
          >
            <div className="w-12 h-12 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Fire size={24} weight="fill" />
            </div>
            <span className="text-sm font-semibold text-center">{reportState.gas ? "Reported" : "No Gas"}</span>
          </button>

          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-800/50 border border-slate-800 transition-all">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${isOnline ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {isOnline ? <WifiHigh size={24} weight="bold" /> : <WifiSlash size={24} weight="bold" />}
            </div>
            <span className="text-sm font-semibold text-center">Power Status</span>
            <span className={`text-[10px] font-bold mt-1 ${isOnline ? 'text-green-500' : 'text-red-500'}`}>
              {isOnline ? 'No Outage' : 'Outage Detected'}
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
