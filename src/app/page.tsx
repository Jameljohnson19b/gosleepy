"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Moon, Zap } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"nearby" | "route">("nearby");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

  const handleFindRooms = () => {
    setLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          router.push(`/results?lat=${latitude}&lng=${longitude}&checkIn=${new Date().toISOString().split('T')[0]}`);
        },
        (error) => {
          console.error("Location error:", error);
          // Fallback location (e.g., NYC)
          router.push(`/results?lat=40.7128&lng=-74.0060`);
        }
      );
    } else {
      router.push(`/results?lat=40.7128&lng=-74.0060`);
    }
  };

  const handleRouteSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination) return;
    setLoading(true);
    router.push(`/results/route?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`);
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      {/* 1AM Mode Aesthetic */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-black" />
      </div>

      <div className="z-10 max-w-md w-full">
        <div className="flex justify-center mb-12">
          <img
            src="/logo.png"
            alt="Go Sleepy Logo"
            className="w-40 h-40 object-contain drop-shadow-[0_0_30px_rgba(255,16,240,0.6)] animate-pulse-slow"
          />
        </div>

        <h1 className="text-5xl font-extrabold tracking-tighter mb-4">
          GO SLEEPY
        </h1>

        <p className="text-xl text-gray-400 mb-12">
          Help tired travelers find the next safe place to sleep — <span className="text-white italic">FAST.</span>
        </p>

        <div className="flex bg-[#111] p-1 rounded-xl mb-8 border border-white/5">
          <button
            onClick={() => setMode("nearby")}
            className={`flex-1 py-3 px-4 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${mode === "nearby" ? "bg-[#ff10f0] text-white" : "text-gray-500 hover:text-white"}`}
          >
            Nearby
          </button>
          <button
            onClick={() => setMode("route")}
            className={`flex-1 py-3 px-4 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${mode === "route" ? "bg-[#ff10f0] text-white" : "text-gray-500 hover:text-white"}`}
          >
            Road Trip
          </button>
        </div>

        {mode === "nearby" ? (
          <button
            onClick={handleFindRooms}
            disabled={loading}
            className="w-full bg-[#ff10f0] hover:bg-[#ff10f0]/80 text-white font-black py-6 rounded-2xl text-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_0_40px_rgba(255,16,240,0.3)]"
          >
            {loading ? (
              <Zap className="animate-spin w-8 h-8 text-white" />
            ) : (
              <>
                <MapPin className="w-8 h-8" />
                FIND ROOMS NEAR ME
              </>
            )}
          </button>
        ) : (
          <form onSubmit={handleRouteSearch} className="space-y-4">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Start City</label>
              <input
                required
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. New York"
                className="w-full bg-[#111] border border-gray-800 rounded-2xl p-5 text-white placeholder:text-gray-700 focus:border-[#ff10f0] outline-none transition-all text-xl font-bold"
              />
            </div>
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">End City</label>
              <input
                required
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Miami"
                className="w-full bg-[#111] border border-gray-800 rounded-2xl p-5 text-white placeholder:text-gray-700 focus:border-[#ff10f0] outline-none transition-all text-xl font-bold"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ff10f0] hover:bg-[#ff10f0]/80 text-white font-black py-6 rounded-2xl text-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_0_40px_rgba(255,16,240,0.3)] mt-4"
            >
              {loading ? (
                <Zap className="animate-spin w-8 h-8 text-white" />
              ) : (
                <>
                  <Zap className="w-8 h-8" />
                  FIND STOPS ALONG ROUTE
                </>
              )}
            </button>
          </form>
        )}

        <p className="mt-8 text-sm text-gray-500 font-medium">
          TONIGHT · 2 GUESTS · PAY AT PROPERTY
        </p>
      </div>

      {/* Drive Mode Indicator */}
      <div className="fixed bottom-8 text-xs text-gray-600 tracking-widest uppercase">
        Roadside Optimized v1.0
      </div>
    </main>
  );
}
