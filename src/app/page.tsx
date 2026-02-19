"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Zap,
  TrendingDown,
  Clock,
  Target,
  Receipt,
  TimerReset,
  Route,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"nearby" | "route">("nearby");
  const [radius, setRadius] = useState(10);
  const [bookingTime, setBookingTime] = useState<"now" | "nextDay">("now");
  const [duration, setDuration] = useState(1);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

  // 1AM Mode Detection (10PM - 6AM) — used for subtle theme + copy
  const [is1AM, setIs1AM] = useState(false);
  useEffect(() => {
    const tick = () => {
      const h = new Date().getHours();
      setIs1AM(h >= 22 || h < 6);
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  const routeParams = useMemo(() => {
    const sp = new URLSearchParams({
      radius: radius.toString(),
      bookingTime,
      duration: duration.toString(),
    });
    if (mode === "route") {
      sp.set("origin", origin);
      sp.set("destination", destination);
    }
    return sp;
  }, [radius, bookingTime, duration, mode, origin, destination]);

  const handleFindRooms = () => {
    setLoading(true);

    const pushWithCoords = (lat: string, lng: string) => {
      const sp = new URLSearchParams({
        lat,
        lng,
        radius: radius.toString(),
        bookingTime,
        duration: duration.toString(),
      });
      router.push(`/results?${sp.toString()}`);
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          pushWithCoords(latitude.toString(), longitude.toString());
        },
        () => {
          // fallback: NYC
          pushWithCoords("40.7128", "-74.0060");
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 }
      );
    } else {
      pushWithCoords("40.7128", "-74.0060");
    }
  };

  const handleRouteSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) return;
    setLoading(true);

    const sp = new URLSearchParams({
      origin: origin.trim(),
      destination: destination.trim(),
      radius: radius.toString(),
      bookingTime,
      duration: duration.toString(),
    });

    router.push(`/results/route?${sp.toString()}`);
  };

  return (
    <main
      className={[
        "min-h-screen text-white selection:bg-[#ff10f0] selection:text-white",
        is1AM ? "bg-[#050005]" : "bg-black",
      ].join(" ")}
    >
      {/* HERO — UNBLOCKED VIEW */}
      <section className="relative min-h-[95vh] flex flex-col items-center justify-end pb-24 px-6 text-center overflow-hidden border-b border-white/5">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="/hero-resort.png"
            alt="Night drive rest"
            className="w-full h-full object-cover opacity-60 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-40" />
        </div>

        {/* Content - Shifted lower to unblock the view */}
        <div className="z-10 max-w-2xl w-full">
          {/* Brand - Transparent Blend Mode */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 blur-3xl bg-[#ff10f0]/30 animate-pulse-slow" />
              <img
                src="/logo-sheep.png"
                alt="Go Sleepy Logo"
                className="w-20 h-20 object-contain relative mix-blend-screen animate-pulse-slow"
              />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-[-0.05em] mb-2 uppercase leading-none text-white drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
            GO SLEEPY
          </h1>

          <p className="text-base md:text-lg text-gray-200 mb-10 max-w-xl mx-auto font-medium lowercase tracking-tight drop-shadow-md">
            Find <span className="text-[#ff10f0] font-black uppercase">low-cost stays</span> —
            <span className="text-white italic font-bold"> before you hit the wall.</span>
          </p>

          {/* Tool Box — Glassmorphism */}
          <div className="bg-black/40 backdrop-blur-3xl p-2 rounded-[32px] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
            {/* Mode switch (secondary, but clear) */}
            <div className="flex bg-black/40 p-1.5 rounded-2xl mb-4">
              <button
                onClick={() => setMode("nearby")}
                className={[
                  "flex-1 py-4 px-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all",
                  mode === "nearby"
                    ? "bg-[#ff10f0] text-white shadow-[0_0_20px_rgba(255,16,240,0.4)]"
                    : "text-gray-500 hover:text-white",
                ].join(" ")}
              >
                Nearby
              </button>

              <button
                onClick={() => setMode("route")}
                className={[
                  "flex-1 py-4 px-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all",
                  mode === "route"
                    ? "bg-[#ff10f0] text-white shadow-[0_0_20px_rgba(255,16,240,0.4)]"
                    : "text-gray-500 hover:text-white",
                ].join(" ")}
              >
                Road Trip
              </button>
            </div>

            {/* Inputs + Primary CTA */}
            <div className="px-4 pb-4">
              {mode === "nearby" ? (
                <button
                  onClick={handleFindRooms}
                  disabled={loading}
                  className="w-full bg-white text-black font-black py-6 rounded-2xl text-xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
                >
                  {loading ? (
                    <Zap className="animate-spin w-6 h-6" />
                  ) : (
                    <>
                      <MapPin className="w-6 h-6" />
                      FIND LOW-COST STOPS
                    </>
                  )}
                </button>
              ) : (
                <form onSubmit={handleRouteSearch} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      required
                      type="text"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      placeholder="ORIGIN"
                      className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 text-white placeholder:text-gray-700 focus:border-[#ff10f0] outline-none transition-all text-sm font-black tracking-widest uppercase"
                    />
                    <input
                      required
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="DESTINATION"
                      className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 text-white placeholder:text-gray-700 focus:border-[#ff10f0] outline-none transition-all text-sm font-black tracking-widest uppercase"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white text-black font-black py-6 rounded-2xl text-xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
                  >
                    {loading ? (
                      <Zap className="animate-spin w-6 h-6" />
                    ) : (
                      <>
                        <Route className="w-6 h-6" />
                        SCAN FOR LOW-COST STOPS AHEAD
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    Tip: “NYC” and “Atlanta” works — we’ll handle the rest.
                  </p>
                </form>
              )}

              {/* Trust Row (directly under CTA) */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
                <div className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <Receipt className="w-5 h-5 text-[#ff10f0] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white mb-0.5">
                      Pay at property
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                      Reserve now. Pay when you arrive.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <TrendingDown className="w-5 h-5 text-[#ff10f0] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white mb-0.5">
                      Low-cost first
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                      Lowest-cost options show up first.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <TimerReset className="w-5 h-5 text-[#ff10f0] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white mb-0.5">
                      Price drops
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                      See when today’s rate falls.
                    </p>
                  </div>
                </div>
              </div>

              {/* Our Goal (kept, but less dominant + cost-first) */}
              <div className="mt-5 flex items-start gap-3 text-left p-4 bg-[#ff10f0]/5 border border-[#ff10f0]/20 rounded-2xl">
                <Target className="w-5 h-5 text-[#ff10f0] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#ff10f0] mb-0.5">
                    Our Goal
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                    To find the lowest-cost places to sleep nearby — fast — so you can rest without overpaying.
                  </p>
                </div>
              </div>

              {/* Night helper copy (only when relevant) */}
              {is1AM && (
                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <Clock className="w-4 h-4 text-[#ff10f0]" />
                  1AM mode: built for night driving
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scroll Hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-[8px] font-black uppercase tracking-[0.4em]">How it works</span>
          <div className="w-0.5 h-12 bg-gradient-to-b from-[#ff10f0] to-transparent" />
        </div>
      </section>

      {/* WHO & WHAT (shortened emphasis, still your structure) */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-b border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-[#ff10f0]/10 border border-[#ff10f0]/30 flex items-center justify-center">
                <img
                  src="/logo-sheep.png"
                  alt=""
                  className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(255,16,240,0.4)]"
                />
              </div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff10f0]">
                About Us
              </h2>
            </div>

            <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8 italic">
              Built for travelers who<br />
              <span className="text-gray-600">just need a place to sleep.</span>
            </h3>

            <div className="space-y-6 text-gray-400 font-medium leading-[1.6]">
              <p>
                It’s late, you’re hours from home, and you’re getting tired. Most travel apps push expensive
                last-minute rooms or endless filters.
              </p>
              <p className="text-white">
                <span className="text-[#ff10f0] font-black uppercase">Go Sleepy</span> finds low-cost hotels right where
                you are or along your route — fast.
              </p>
              <p>
                No complicated filters. No distracting photos. Just the lowest price for a clean room — shown in a
                high-contrast design that’s easy to read at night.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                icon: <Receipt className="w-6 h-6" />,
                title: "Pay at the Hotel",
                desc: "Reserve now. Pay when you arrive. No prepay stress.",
              },
              {
                icon: <TrendingDown className="w-6 h-6" />,
                title: "Low-Cost First",
                desc: "We show the lowest-cost options first so you don’t waste time scrolling.",
              },
              {
                icon: <Clock className="w-6 h-6" />,
                title: "Cost-Per-Hour Rest",
                desc: "See what a stop costs per hour of rest — often smarter than pushing through.",
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Prices Change All Day",
                desc: "Rates move throughout the day. We show you when prices drop.",
              },
            ].map((feat, i) => (
              <div
                key={i}
                className="bg-[#111] p-8 rounded-[32px] border border-white/5 hover:border-[#ff10f0]/30 transition-all group"
              >
                <div className="text-[#ff10f0] mb-6 group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <h4 className="text-sm font-black uppercase tracking-widest mb-3">{feat.title}</h4>
                <p className="text-xs text-gray-500 font-medium leading-[1.6]">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ticker (low-cost focused) */}
      <section className="bg-[#ff10f0] py-1">
        <div className="flex overflow-hidden whitespace-nowrap bg-black border-y border-white/10 py-6">
          <div className="flex animate-dash gap-12 px-12 items-center">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center gap-12">
                <span className="text-2xl font-black uppercase tracking-tighter text-white">
                  FIND LOW-COST STOPS FAST
                </span>
                <Zap className="w-6 h-6 text-[#ff10f0]" />
                <span className="text-2xl font-black uppercase tracking-tighter text-gray-800">
                  PAY AT PROPERTY • LOW-COST REST
                </span>
                <div className="w-2 h-2 rounded-full bg-[#ff10f0]" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Version Indicator */}
      <div className="py-12 flex flex-col items-center gap-4 opacity-40 grayscale">
        <div className="flex items-center gap-3">
          <div className="w-1 h-1 rounded-full bg-white animate-ping" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Go Sleepy v1.02</span>
        </div>
      </div>
    </main>
  );
}
