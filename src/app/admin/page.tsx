"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";

export default function AdminOverview() {
  const [stats, setStats] = useState({ totalUsers: 0, totalReports: 0, activeOutages: 0 });
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      // For MVP, we will fetch raw counts by querying the tables directly using the RPC
      // Wait, we can't easily count users without the RPC, let's call get_all_users()
      const { data: usersData } = await supabase.rpc("get_all_users");
      const { data: reportsData } = await supabase.from("reports").select("id");
      const { data: zonesData } = await supabase.from("zones").select("current_status");

      setStats({
        totalUsers: usersData?.length || 0,
        totalReports: reportsData?.length || 0,
        activeOutages: zonesData?.filter(z => z.current_status !== 'Green').length || 0
      });
    };
    fetchStats();
  }, [supabase]);

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-3xl font-bold">Overview</h2>
      
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="text-sm text-slate-400 font-medium mb-1">Total Users</div>
          <div className="text-4xl font-bold">{stats.totalUsers}</div>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="text-sm text-slate-400 font-medium mb-1">Total Reports Logged</div>
          <div className="text-4xl font-bold text-blue-400">{stats.totalReports}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="text-sm text-slate-400 font-medium mb-1">Active Outage Zones</div>
          <div className="text-4xl font-bold text-red-500">{stats.activeOutages}</div>
        </div>
      </div>
      
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-64 flex items-center justify-center">
        <div className="text-slate-500">Live grid status graph will appear here.</div>
      </div>
    </div>
  );
}
