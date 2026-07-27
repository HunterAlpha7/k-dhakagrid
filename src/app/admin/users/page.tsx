"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { Prohibit } from "@phosphor-icons/react/dist/ssr";

export default function UsersManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    fetchUsers();
  }, [supabase]);

  const fetchUsers = async () => {
    // Calling the RPC to bypass RLS for viewing all users
    const { data } = await supabase.rpc("get_all_users");
    if (data) setUsers(data);
  };

  const banUser = async (id: string) => {
    if (!confirm("Are you sure you want to shadow ban this user? Their reports will be ignored.")) return;
    await supabase.rpc("ban_user", { target_user_id: id });
    fetchUsers();
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold">Users & Trust Scores</h2>
        <p className="text-slate-400 mt-2">Manage device identities and prevent trolling syndicates by shadowbanning malicious actors.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950 border-b border-slate-800">
              <th className="p-4 font-semibold text-slate-300">Device UUID</th>
              <th className="p-4 font-semibold text-slate-300">Auth ID</th>
              <th className="p-4 font-semibold text-slate-300">Trust Score</th>
              <th className="p-4 font-semibold text-slate-300 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">No users found.</td>
              </tr>
            ) : (
              users.map(u => (
                <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                  <td className="p-4 font-mono text-sm text-slate-400">{u.device_uuid}</td>
                  <td className="p-4 font-mono text-xs text-slate-500">{u.id}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.trust_score > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-500'}`}>
                      {u.trust_score > 0 ? `Trusted (${u.trust_score})` : 'Shadow Banned'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {u.trust_score > 0 && (
                      <button 
                        onClick={() => banUser(u.id)}
                        className="flex items-center gap-2 ml-auto text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-sm font-semibold"
                      >
                        <Prohibit size={16} weight="bold" />
                        Ban
                      </button>
                    )}
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
