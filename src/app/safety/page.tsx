"use client";

import { ArrowLeft, Shield, CheckCircle, Info } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SafetyPage() {
    const router = useRouter();

    const safetyRules = [
        {
            title: "Verified Properties",
            description: "We only list hotels with clear 24/7 front desks and high safety ratings.",
            icon: <CheckCircle className="w-6 h-6 text-emerald-400" />
        },
        {
            title: "Pay at Property",
            description: "No payment is handled on our site. You pay the hotel directly, ensuring you see the room before you pay.",
            icon: <Shield className="w-6 h-6 text-[#ff10f0]" />
        },
        {
            title: "Roadside Intelligence",
            description: "Our algorithm deprioritizes properties with historic check-in issues or safety complaints.",
            icon: <Info className="w-6 h-6 text-blue-400" />
        }
    ];

    return (
        <main className="min-h-screen bg-black text-white p-6 pb-20">
            <header className="flex items-center gap-4 mb-12">
                <button onClick={() => router.back()} className="p-2 border border-gray-800 rounded-full">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-black uppercase tracking-tighter">Safety Standards</h1>
            </header>

            <div className="max-w-xl mx-auto space-y-8">
                <div className="bg-[#111] p-8 rounded-3xl border border-white/5">
                    <h2 className="text-[#ff10f0] text-3xl font-black uppercase tracking-tighter mb-4">Your safety is our priority.</h2>
                    <p className="text-gray-400 font-medium leading-relaxed">
                        Go Sleepy was built for the tired traveler at 1 AM. We know that safety isn't just an option—it's the only priority.
                    </p>
                </div>

                <div className="space-y-4">
                    {safetyRules.map((rule, i) => (
                        <div key={i} className="p-6 bg-[#0a0a0a] border border-gray-900 rounded-2xl flex gap-5">
                            <div className="shrink-0 pt-1">{rule.icon}</div>
                            <div>
                                <h3 className="font-black uppercase tracking-widest text-xs mb-2 text-white">{rule.title}</h3>
                                <p className="text-sm text-gray-500 font-medium">{rule.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-8 border-t border-gray-900 text-center">
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                        Last Updated: February 2026
                    </p>
                </div>
            </div>
        </main>
    );
}
