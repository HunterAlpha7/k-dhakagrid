"use client";

import { useEffect, useState, ReactNode } from "react";
import { createClient } from "@/lib/client";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const signInAnonymously = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.error("Anonymous Sign-In Error:", error);
        }
      }
      setLoading(false);
    };

    signInAnonymously();
  }, []);

  if (loading) {
    return <div className="flex h-screen w-screen items-center justify-center bg-black text-white">Initializing Grid...</div>;
  }

  return <>{children}</>;
}
