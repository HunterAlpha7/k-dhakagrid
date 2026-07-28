"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { Network } from "@capacitor/network";
import { Geolocation } from "@capacitor/geolocation";

export function useDhakaGrid() {
  const supabase = createClient();
  const [reports, setReports] = useState<any[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: rData } = await supabase.from("reports").select("*").order("created_at", { ascending: false }).limit(1000);
      if (rData) setReports(rData);
    };
    fetchData();

    const reportsChannel = supabase
      .channel("reports-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reports" },
        (payload) => {
          setReports((current) => [payload.new, ...current]);
        }
      )
      .subscribe();

    // Heartbeat channel: global online presence
    const heartbeatChannel = supabase.channel("heartbeat", {
      config: {
        presence: {
          key: "global",
        },
      },
    });

    heartbeatChannel
      .on("presence", { event: "sync" }, () => {
        const state = heartbeatChannel.presenceState();
        let count = 0;
        for (const key in state) {
          count += state[key].length;
        }
        setOnlineCount(count);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          const netStatus = await Network.getStatus();
          if (netStatus.connectionType === "wifi" || netStatus.connectionType === "unknown") {
            await heartbeatChannel.track({ online_at: new Date().toISOString() });
          }
        }
      });

    const networkListener = Network.addListener("networkStatusChange", async (status) => {
      if (status.connectionType === "wifi") {
        await heartbeatChannel.track({ online_at: new Date().toISOString() });
      } else {
        await heartbeatChannel.untrack();
      }
    });

    // Try to get user real location once on load
    Geolocation.getCurrentPosition().then(pos => {
      setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    }).catch(e => console.warn("Could not get initial location", e));

    return () => {
      networkListener.then(l => l.remove());
      supabase.removeChannel(reportsChannel);
      supabase.removeChannel(heartbeatChannel);
    };
  }, [supabase]);

  const reportDisruption = async (utilityType: "Electricity" | "Water" | "Gas", lat: number, lng: number) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    await supabase.from("reports").insert({
      lat,
      lng,
      utility_type: utilityType,
      reporter_id: session.user.id,
    });
  };

  return { reports, onlineCount, reportDisruption, userLocation };
}
