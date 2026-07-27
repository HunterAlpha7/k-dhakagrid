"use client";
import DynamicMap from "@/components/DynamicMap";
import { Power, Drop, Fire } from "@phosphor-icons/react/dist/ssr";
import { useDhakaGrid } from "@/hooks/useDhakaGrid";
import { useState } from "react";

export default function Home() {
  const UTTARA_ZONE_ID = "b84467e7-a2d8-4897-96dc-d0cfa2554c1f"; // Mock location for MVP
  const { zones, onlineCount, reportDisruption } = useDhakaGrid(UTTARA_ZONE_ID);
  
  const [reportState, setReportState] = useState<{ water: boolean, gas: boolean }>({ water: false, gas: false });

  const handleReport = async (type: "Water" | "Gas") => {
    await reportDisruption(type);
    if (type === "Water") setReportState(s => ({ ...s, water: true }));
    if (type === "Gas") setReportState(s => ({ ...s, gas: true }));
    
    // Simulate debounce UI
    setTimeout(() => {
      if (type === "Water") setReportState(s => ({ ...s, water: false }));
      if (type === "Gas") setReportState(s => ({ ...s, gas: false }));
    }, 30000);
  };

  const myZone = zones.find(z => z.id === UTTARA_ZONE_ID);

  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-slate-50 overflow-hidden">
      
      {/* Header */}
      <header className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/80 backdrop-blur-md z-10 absolute top-0 w-full">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            DhakaGrid
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">Real-Time Utility Tracker</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold">{myZone?.zone_name || "Uttara"}</div>
          <div className="text-xs text-green-400">{onlineCount} Grid Devices Online</div>
        </div>
      </header>

      {/* Map Container */}
      <div className="flex-1 relative w-full h-full pt-20 pb-40">
        <div className="absolute inset-0 z-0">
          <DynamicMap zones={zones} />
        </div>
      </div>

      {/* Bottom Action Sheet */}
      <div className="absolute bottom-0 w-full bg-slate-900 border-t border-slate-800 rounded-t-3xl p-6 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-10">
        <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-6"></div>
        
        <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Report Disruption</h2>
        
        <div className="grid grid-cols-3 gap-4">
          <button 
            disabled={reportState.water}
            onClick={() => handleReport("Water")}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 transition-all active:scale-95 group"
          >
            <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Drop size={24} weight="fill" />
            </div>
            <span className="text-sm font-semibold">{reportState.water ? "Reported" : "No Water"}</span>
          </button>
          
          <button 
            disabled={reportState.gas}
            onClick={() => handleReport("Gas")}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 transition-all active:scale-95 group"
          >
            <div className="w-12 h-12 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Fire size={24} weight="fill" />
            </div>
            <span className="text-sm font-semibold">{reportState.gas ? "Reported" : "No Gas"}</span>
          </button>

          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-800/50 border border-slate-800 opacity-60">
            <div className="w-12 h-12 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center mb-3">
              <Power size={24} weight="fill" />
            </div>
            <span className="text-sm font-semibold">Auto Power</span>
            <span className="text-[10px] text-slate-500 mt-1 flex flex-col items-center">
              <span>Dead Man's Switch</span>
              <span className="text-green-500 font-bold mt-1">ACTIVE</span>
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
