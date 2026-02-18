"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Moon, Zap } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      {/* 1AM Mode Aesthetic */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-black" />
      </div>

      <div className="z-10 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <Moon className="w-16 h-16 text-yellow-400 fill-yellow-400 animate-pulse" />
        </div>

        <h1 className="text-5xl font-extrabold tracking-tighter mb-4">
          GO SLEEPY
        </h1>

        <p className="text-xl text-gray-400 mb-12">
          Help tired travelers find the next safe place to sleep — <span className="text-white italic">FAST.</span>
        </p>

        <button
          onClick={handleFindRooms}
          disabled={loading}
          className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black py-6 rounded-2xl text-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_0_40px_rgba(250,204,21,0.3)]"
        >
          {loading ? (
            <Zap className="animate-spin w-8 h-8" />
          ) : (
            <>
              <MapPin className="w-8 h-8" />
              FIND ROOMS NEAR ME
            </>
          )}
        </button>

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
