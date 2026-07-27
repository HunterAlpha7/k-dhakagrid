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
        const { error, data } = await supabase.auth.signInAnonymously();
        if (error) {
          console.error("Anonymous Sign-In Error:", error);
        } else if (data.user) {
          // Generate a device UUID if not present (simple fallback for now)
          let deviceId = localStorage.getItem("device_uuid");
          if (!deviceId) {
            deviceId = crypto.randomUUID();
            localStorage.setItem("device_uuid", deviceId);
          }
          
          // Upsert the user into the database
          await supabase.from("users").upsert({
            id: data.user.id,
            device_uuid: deviceId,
          });
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
