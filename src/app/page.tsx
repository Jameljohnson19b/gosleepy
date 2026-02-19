"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Moon, Zap, ShieldCheck, TrendingDown, Clock, Target, Info } from "lucide-react";
import Link from "next/link";

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
    <main className="min-h-screen bg-black text-white selection:bg-[#ff10f0] selection:text-white">
      {/* 1AM Mode Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center p-6 text-center overflow-hidden border-b border-white/5">
        {/* Cinematic Background */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="/hero-resort.png"
            alt="Deep rest at resort"
            className="w-full h-full object-cover opacity-70 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-60" />
        </div>

        <div className="z-10 max-w-2xl w-full pt-16 pb-12">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 blur-3xl bg-[#ff10f0]/30 animate-pulse-slow" />
              <img
                src="/logo.png"
                alt="Go Sleepy Logo"
                className="w-32 h-32 object-contain relative animate-pulse-slow"
              />
            </div>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-[-0.05em] mb-4 uppercase leading-none">
            GO SLEEPY
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-xl mx-auto font-medium lowercase tracking-tight">
            Stop pushing. find the <span className="text-[#ff10f0] font-black uppercase">Low-Cost Stays</span> worth pulling over for — <span className="text-white italic">before you hit the wall.</span>
          </p>

          <div className="bg-[#111]/80 backdrop-blur-2xl p-2 rounded-[32px] mb-8 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="flex bg-black/40 p-1.5 rounded-2xl mb-6">
              <button
                onClick={() => setMode("nearby")}
                className={`flex-1 py-4 px-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all ${mode === "nearby" ? "bg-[#ff10f0] text-white shadow-[0_0_20px_rgba(255,16,240,0.4)]" : "text-gray-500 hover:text-white"}`}
              >
                Nearby
              </button>
              <button
                onClick={() => setMode("route")}
                className={`flex-1 py-4 px-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all ${mode === "route" ? "bg-[#ff10f0] text-white shadow-[0_0_20px_rgba(255,16,240,0.4)]" : "text-gray-500 hover:text-white"}`}
              >
                Road Trip
              </button>
            </div>

            <div className="px-4 pb-4">
              {mode === "nearby" ? (
                <button
                  onClick={handleFindRooms}
                  disabled={loading}
                  className="w-full bg-white text-black font-black py-6 rounded-2xl text-xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_10px_30px_rgba(255,255,255,0.1)] mb-4"
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
                        <Zap className="w-6 h-6" />
                        SCAN FOR LOW-COST STOPS
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* OUR GOAL STATEMENT */}
              <div className="mt-6 flex items-start gap-3 text-left p-4 bg-[#ff10f0]/5 border border-[#ff10f0]/20 rounded-2xl">
                <Target className="w-5 h-5 text-[#ff10f0] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#ff10f0] mb-0.5">Our Goal</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                    To find the cheapest places to sleep nearby, so you can rest without overpaying when you're tired.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-[8px] font-black uppercase tracking-[0.4em]">How it works</span>
          <div className="w-0.5 h-12 bg-gradient-to-b from-[#ff10f0] to-transparent" />
        </div>
      </section>

      {/* Who & What Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-b border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-[#ff10f0]/10 border border-[#ff10f0]/30 flex items-center justify-center">
                <Info className="w-4 h-4 text-[#ff10f0]" />
              </div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff10f0]">About Us</h2>
            </div>
            <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8 italic">
              Built for travelers who<br /><span className="text-gray-600">just need a place to sleep.</span>
            </h3>
            <div className="space-y-6 text-gray-400 font-medium leading-[1.6]">
              <p>
                We’ve all been there: It’s late, you’re hours from home, and you're getting tired.
                Other apps show you fancy hotels or expensive last-minute rooms that cost too much.
              </p>
              <p className="text-white">
                <span className="text-[#ff10f0] font-black uppercase">Go Sleepy is the solution.</span> We find the best budget-friendly hotels located right where you are or along your route.
              </p>
              <p>
                No complicated filters. No distracting photos. Just the lowest price for a clean room and safe parking—shown in a high-contrast design that's easy to read at night.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                icon: <ShieldCheck className="w-6 h-6" />,
                title: "Pay at the Hotel",
                desc: "No need to pay now. We book the room, and you pay when you arrive."
              },
              {
                icon: <TrendingDown className="w-6 h-6" />,
                title: "Hourly Sleep Math",
                desc: "We show you the cost per hour of rest. It's often cheaper to stop than to keep driving."
              },
              {
                icon: <Clock className="w-6 h-6" />,
                title: "Made for Night",
                desc: "Simple, high-contrast design that's easy on the eyes during late-night drives."
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Real-Time Deals",
                desc: "We check with hotel chains directly for the latest availability and lowest prices."
              }
            ].map((feat, i) => (
              <div key={i} className="bg-[#111] p-8 rounded-[32px] border border-white/5 hover:border-[#ff10f0]/30 transition-all group">
                <div className="text-[#ff10f0] mb-6 group-hover:scale-110 transition-transform">{feat.icon}</div>
                <h4 className="text-sm font-black uppercase tracking-widest mb-3">{feat.title}</h4>
                <p className="text-xs text-gray-500 font-medium leading-[1.6]">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stat Box */}
      <section className="bg-[#ff10f0] py-1">
        <div className="flex overflow-hidden whitespace-nowrap bg-black border-y border-white/10 py-6">
          <div className="flex animate-dash gap-12 px-12 items-center">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center gap-12">
                <span className="text-2xl font-black uppercase tracking-tighter text-white">FIND CHEAP HOTELS FAST</span>
                <Zap className="w-6 h-6 text-[#ff10f0]" />
                <span className="text-2xl font-black uppercase tracking-tighter text-gray-800">STOPPING IS SMARTER THAN DRIVING TIRED</span>
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
