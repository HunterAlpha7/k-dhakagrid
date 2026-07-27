"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";

export default function ReportsLog() {
  const [reports, setReports] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchReports = async () => {
      // RLS is open for SELECT on reports, so we can query normally
      const { data } = await supabase
        .from("reports")
        .select(`
          id,
          utility_type,
          created_at,
          reporter_id,
          zones ( zone_name )
        `)
        .order("created_at", { ascending: false })
        .limit(100);
        
      if (data) setReports(data);
    };
    fetchReports();
  }, [supabase]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold">Report Logs</h2>
        <p className="text-slate-400 mt-2">Instant log of all manual and automated utility reports.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950 border-b border-slate-800">
              <th className="p-4 font-semibold text-slate-300">Timestamp</th>
              <th className="p-4 font-semibold text-slate-300">Zone</th>
              <th className="p-4 font-semibold text-slate-300">Utility</th>
              <th className="p-4 font-semibold text-slate-300">Reporter ID</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">No reports logged yet.</td>
              </tr>
            ) : (
              reports.map(r => (
                <tr key={r.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                  <td className="p-4 text-sm text-slate-300">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="p-4 text-sm font-semibold text-white">
                    {r.zones?.zone_name}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      r.utility_type === 'Water' ? 'bg-blue-500/10 text-blue-400' :
                      r.utility_type === 'Gas' ? 'bg-orange-500/10 text-orange-400' :
                      'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {r.utility_type}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-xs text-slate-500">
                    {r.reporter_id}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
