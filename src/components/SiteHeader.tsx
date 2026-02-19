"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthButton from "./auth/AuthButton";

export function SiteHeader() {
    const pathname = usePathname();

    // Show header everywhere for consistent navigation
    const isLanding = pathname === "/";

    return (
        <header className="w-full bg-black/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-[100]">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 active:scale-95 transition-all">
                    <img
                        src="/logo-sheep.png"
                        alt=""
                        className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(255,16,240,0.6)]"
                    />
                    <span className="text-[#ff10f0] font-black tracking-tighter text-xl uppercase">Go Sleepy</span>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/results" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#ff10f0] transition-colors">Find Rooms</Link>
                    <Link href="/safety" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#ff10f0] transition-colors">Safety</Link>
                    <Link href="/support" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#ff10f0] transition-colors">Support</Link>
                    <AuthButton />
                </nav>

                <div className="md:hidden flex items-center gap-4">
                    <AuthButton />
                    {/* Mobile menu could go here, but keeping it minimalist for now */}
                    <div className="w-8 h-8" />
                </div>
            </div>
        </header>
    );
}
