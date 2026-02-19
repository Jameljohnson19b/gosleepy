"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Moon, Zap } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"nearby" | "route">("nearby");
  const [radius, setRadius] = useState(10);
  const [bookingTime, setBookingTime] = useState<"now" | "nextDay">("now");
  const [duration, setDuration] = useState(1);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

  const handleFindRooms = () => {
    setLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const searchParams = new URLSearchParams({
            lat: latitude.toString(),
            lng: longitude.toString(),
            radius: radius.toString(),
            bookingTime,
            duration: duration.toString()
          });
          router.push(`/results?${searchParams.toString()}`);
        },
        (error) => {
          console.error("Location error:", error);
          const searchParams = new URLSearchParams({
            lat: "40.7128",
            lng: "-74.0060",
            radius: radius.toString(),
            bookingTime,
            duration: duration.toString()
          });
          router.push(`/results?${searchParams.toString()}`);
        }
      );
    } else {
      const searchParams = new URLSearchParams({
        lat: "40.7128",
        lng: "-74.0060",
        radius: radius.toString(),
        bookingTime,
        duration: duration.toString()
      });
      router.push(`/results?${searchParams.toString()}`);
    }
  };

  const handleRouteSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination) return;
    setLoading(true);
    const searchParams = new URLSearchParams({
      origin,
      destination,
      radius: radius.toString(),
      bookingTime,
      duration: duration.toString()
    });
    router.push(`/results/route?${searchParams.toString()}`);
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
          Find the <span className="text-[#ff10f0] font-black uppercase">Low-Cost Stays</span> worth the stop — <span className="text-white italic">so you don't push too far or waste the trip budget.</span>
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

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block text-center">Check-In</label>
            <div className="flex bg-[#111] p-1 rounded-xl border border-white/5">
              {[
                { id: 'now', label: 'Now' },
                { id: 'nextDay', label: 'Tomorrow' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setBookingTime(t.id as "now" | "nextDay")}
                  className={`flex-1 py-2 px-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${bookingTime === t.id ? "bg-[#ff10f0] text-white" : "text-gray-500 hover:text-white"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block text-center">Duration</label>
            <div className="flex bg-[#111] p-1 rounded-xl border border-white/5">
              {[1, 2, 3, 5].map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`flex-1 py-2 px-1 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${duration === d ? "bg-[#ff10f0] text-white" : "text-gray-500 hover:text-white"}`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-8 space-y-3">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block text-center">Proximity Alert (Miles)</label>
          <div className="flex bg-[#111] p-1 rounded-xl border border-white/5">
            {[10, 25, 50, 100].map((r) => (
              <button
                key={r}
                onClick={() => setRadius(r)}
                className={`flex-1 py-2 px-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${radius === r ? "bg-[#ff10f0] text-white" : "text-gray-500 hover:text-white"}`}
              >
                {r}mi
              </button>
            ))}
          </div>
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
                FIND LOW-COST STOPS
              </>
            )}
          </button>
        ) : (
          <form onSubmit={handleRouteSearch} className="space-y-4">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Origin</label>
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
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Destination</label>
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
                  SCAN FOR LOW-COST STOPS
                </>
              )}
            </button>
          </form>
        )}

        <p className="mt-8 text-sm text-gray-500 font-black uppercase tracking-[0.2em]">
          {bookingTime === 'now' ? 'TONIGHT' : 'TOMORROW'} · {duration} {duration === 1 ? 'NIGHT' : 'NIGHTS'} · 2 GUESTS
        </p>
      </div>

      {/* Drive Mode Indicator */}
      <div className="fixed bottom-8 text-xs text-gray-600 tracking-widest uppercase">
        Roadside Optimized v1.0
      </div>
    </main>
  );
}
