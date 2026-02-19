"use client";

import Link from "next/link";
import { Shield, LifeBuoy, Scale, Info, MapPin } from "lucide-react";

export function SiteFooter() {
    return (
        <footer className="w-full bg-[#050505] border-t border-white/5 py-12 px-6 mt-20">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-3 mb-6">
                            <img
                                src="/logo.png"
                                alt=""
                                className="w-10 h-10 object-contain drop-shadow-[0_0_15px_rgba(255,16,240,0.4)]"
                            />
                            <span className="text-[#ff10f0] font-black tracking-tighter text-2xl uppercase">Go Sleepy</span>
                        </Link>
                        <p className="text-gray-500 text-xs font-medium leading-relaxed max-w-[200px]">
                            Intercepting high-value rest windows for the tired traveler.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Navigation</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/results" className="text-xs text-gray-500 hover:text-[#ff10f0] transition-colors flex items-center gap-2 group">
                                    <MapPin className="w-3 h-3 text-gray-600 group-hover:text-[#ff10f0]" />
                                    Find Low-Cost Stops
                                </Link>
                            </li>
                            <li>
                                <Link href="/safety" className="text-xs text-gray-500 hover:text-[#ff10f0] transition-colors flex items-center gap-2 group">
                                    <Shield className="w-3 h-3 text-gray-600 group-hover:text-[#ff10f0]" />
                                    Economic Radar
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Support</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/support" className="text-xs text-gray-500 hover:text-[#ff10f0] transition-colors flex items-center gap-2 group">
                                    <LifeBuoy className="w-3 h-3 text-gray-600 group-hover:text-[#ff10f0]" />
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link href="/support" className="text-xs text-gray-500 hover:text-[#ff10f0] transition-colors flex items-center gap-2 group">
                                    <Info className="w-3 h-3 text-gray-600 group-hover:text-[#ff10f0]" />
                                    24/7 Roadside Help
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Legal</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/terms" className="text-xs text-gray-500 hover:text-[#ff10f0] transition-colors flex items-center gap-2 group">
                                    <Scale className="w-3 h-3 text-gray-600 group-hover:text-[#ff10f0]" />
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-xs text-gray-500 hover:text-[#ff10f0] transition-colors flex items-center gap-2 group">
                                    <Scale className="w-3 h-3 text-gray-600 group-hover:text-[#ff10f0]" />
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between pt-12 border-t border-white/5 gap-6">
                    <div className="text-[10px] text-gray-600 font-black uppercase tracking-widest">
                        © {new Date().getFullYear()} 19B PROJECTS · ALL RIGHTS RESERVED
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="h-1 w-1 rounded-full bg-gray-800" />
                        <div className="text-[10px] text-[#ff10f0] font-black uppercase tracking-widest animate-pulse">
                            1AM Mode Active
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
