"use client";
import { useState } from "react";
import { List, X, ShieldWarning, CheckCircle, Warning } from "@phosphor-icons/react/dist/ssr";

export default function MapControls({ filter, setFilter }: { filter: string, setFilter: (f: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="absolute top-24 right-6 z-20 bg-slate-900 text-white p-3 rounded-full border border-slate-700 shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:bg-slate-800 transition-colors"
      >
        <List size={24} />
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div 
          className="absolute inset-0 bg-black/40 z-20" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div 
        className={`absolute top-0 right-0 w-80 h-full bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 z-30 shadow-2xl transition-transform duration-300 flex flex-col pt-20 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold">Grid Legend</h2>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Status Matrix</h3>
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex items-center gap-3">
              <CheckCircle size={24} className="text-green-500" weight="fill" />
              <div>
                <div className="font-bold">Normal (Green)</div>
                <div className="text-xs text-slate-400">Stable grid, no confirmed disruptions.</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Warning size={24} className="text-yellow-500" weight="fill" />
              <div>
                <div className="font-bold">Unverified (Yellow)</div>
                <div className="text-xs text-slate-400">Isolated reports, waiting for consensus.</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShieldWarning size={24} className="text-red-500" weight="fill" />
              <div>
                <div className="font-bold">Outage (Red)</div>
                <div className="text-xs text-slate-400">Confirmed cluster of reports/drop-offs.</div>
              </div>
            </div>
          </div>

          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Filters (Utility)</h3>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => { setFilter("All"); setIsOpen(false); }}
              className={`text-left px-4 py-3 rounded-lg border transition-colors ${filter === "All" ? "bg-slate-800 border-slate-500 text-white font-semibold" : "border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300"}`}
            >
              Show All Disruptions
            </button>
            <button 
              onClick={() => { setFilter("Electricity"); setIsOpen(false); }}
              className={`text-left px-4 py-3 rounded-lg border transition-colors ${filter === "Electricity" ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400 font-semibold" : "border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300"}`}
            >
              Electricity (Grid Drop-offs)
            </button>
            <button 
              onClick={() => { setFilter("Water"); setIsOpen(false); }}
              className={`text-left px-4 py-3 rounded-lg border transition-colors ${filter === "Water" ? "bg-blue-500/20 border-blue-500/50 text-blue-400 font-semibold" : "border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300"}`}
            >
              Water Outages
            </button>
            <button 
              onClick={() => { setFilter("Gas"); setIsOpen(false); }}
              className={`text-left px-4 py-3 rounded-lg border transition-colors ${filter === "Gas" ? "bg-orange-500/20 border-orange-500/50 text-orange-400 font-semibold" : "border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300"}`}
            >
              Gas Outages
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
