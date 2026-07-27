"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Users, FileText, Layout } from "@phosphor-icons/react/dist/ssr";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    const auth = sessionStorage.getItem("admin_auth");
    if (auth === "true") setIsAuthenticated(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem("admin_auth", "true");
    } else {
      alert("Invalid password");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-slate-50">
        <form onSubmit={handleLogin} className="bg-slate-900 p-8 rounded-2xl border border-slate-800 flex flex-col gap-4 w-80 shadow-2xl">
          <div className="flex justify-center text-green-500 mb-2">
            <ShieldCheck size={48} weight="fill" />
          </div>
          <h2 className="text-xl font-bold text-center mb-2">Admin Access</h2>
          <input 
            type="password" 
            placeholder="Enter Admin Password" 
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg outline-none focus:border-green-500"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button type="submit" className="bg-green-600 hover:bg-green-500 py-2 rounded-lg font-semibold transition-colors mt-2">
            Unlock Grid
          </button>
        </form>
      </div>
    );
  }

  const navItems = [
    { name: "Overview", path: "/admin", icon: Layout },
    { name: "Users & Trust", path: "/admin/users", icon: Users },
    { name: "Report Logs", path: "/admin/reports", icon: FileText },
  ];

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldCheck size={24} className="text-green-500" weight="fill" />
            Admin Panel
          </h1>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link key={item.path} href={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-green-500/10 text-green-400 font-semibold' : 'hover:bg-slate-800 text-slate-300'}`}>
                <Icon size={20} weight={isActive ? "fill" : "regular"} />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => { sessionStorage.removeItem("admin_auth"); setIsAuthenticated(false); }}
            className="w-full py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            Lock Terminal
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        {children}
      </div>
    </div>
  );
}
