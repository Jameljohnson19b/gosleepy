"use client";

import { Offer } from "@/types/hotel";
import { Star, MapPin, TrendingDown, Clock, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import { PriceTrendBar } from "./PriceTrendBar";

interface HotelCardProps {
    offer: Offer;
    duration?: number;
}

export function HotelCard({ offer, duration = 1 }: HotelCardProps) {
    const lowestRate = offer.rates[0];
    const is1AM = typeof window !== 'undefined' && (new Date().getHours() >= 23 || new Date().getHours() <= 4);

    return (
        <Link
            href={`/hotel/${offer.hotelId}?risk=${offer.supportRisk?.label || 'LOW'}&name=${encodeURIComponent(offer.hotelName)}&amount=${lowestRate.totalAmount}&address=${encodeURIComponent(offer.address || '')}&rating=${offer.rating || ''}&stars=${offer.stars || ''}&phone=${encodeURIComponent(offer.hotelPhone || '')}&lat=${offer.lat}&lng=${offer.lng}&official=${offer.hasOfficialMedia}&duration=${duration}`}
            className={`block group bg-[#111] border ${is1AM ? 'border-[#ff10f0]/30' : 'border-gray-800'} rounded-2xl lg:rounded-3xl overflow-hidden active:scale-[0.98] transition-all hover:border-[#ff10f0]/60 relative`}
        >
            {is1AM && (
                <div className="absolute top-0 right-0 px-3 py-1 bg-[#ff10f0] text-white text-[8px] font-black uppercase tracking-widest z-10 rounded-bl-xl shadow-lg animate-pulse">
                    1AM Mode Priority
                </div>
            )}

            <div className="relative h-28 lg:h-44 w-full border-b border-gray-800">
                <img
                    src={offer.images?.[0] || "/hotel-placeholder.jpg"}
                    alt={offer.hotelName}
                    className={`w-full h-full object-cover ${is1AM ? 'grayscale-[0.4]' : 'grayscale-[0.2]'} group-hover:grayscale-0 transition-all opacity-80`}
                />

                {!offer.hasOfficialMedia && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                        <div className="bg-black/80 border border-white/5 px-3 py-1.5 rounded-full">
                            <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Representative View</span>
                        </div>
                    </div>
                )}

                <div className="absolute top-2 left-2 flex flex-col gap-2">
                    <div className="bg-black/80 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 border border-white/10">
                        <MapPin className="w-3 h-3 text-[#ff10f0]" />
                        <span className="text-[10px] font-bold text-white">{offer.distanceMiles}mi</span>
                    </div>

                    <div className="bg-[#ff10f0] shadow-[0_0_15px_rgba(255,16,240,0.5)] p-1.5 rounded-full flex items-center justify-center border border-white/20">
                        <Zap className="w-3 h-3 text-white fill-white" />
                    </div>
                </div>

                {offer.rating && (
                    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 border border-white/10">
                        <Star className="w-3 h-3 text-[#ff10f0] fill-[#ff10f0]" />
                        <span className="text-[10px] font-bold text-white">{offer.rating}</span>
                    </div>
                )}
            </div>

            <div className="p-4 lg:p-6">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-base lg:text-lg font-black tracking-tighter leading-[1.1] uppercase group-hover:text-[#ff10f0] transition-colors">
                        {offer.hotelName}
                    </h3>
                </div>

                <div className="flex items-end justify-between mb-4">
                    <div className="flex flex-col">
                        <div className="text-2xl lg:text-3xl font-black text-white leading-none tracking-tighter">
                            ${lowestRate.totalAmount}
                        </div>
                        <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest mt-1">
                            Total · {duration} {duration === 1 ? 'night' : 'nights'}
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1 text-emerald-400 font-black text-[9px] bg-emerald-400/10 px-2 py-1 rounded-lg border border-emerald-400/20">
                            <ShieldCheck className="w-3 h-3" />
                            PAY AT PROPERTY
                        </div>
                    </div>
                </div>

                {/* Intelligence Layer */}
                <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-900">
                    {offer.confidenceScore && (
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[9px] uppercase tracking-tighter">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Confirms Fast {offer.confidenceScore.toFixed(1)}
                        </div>
                    )}

                    {offer.pressureLabel && (
                        <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${offer.pressureLabel === 'LIMITED' ? 'bg-[#ff10f0]/10 border-[#ff10f0]/30 text-[#ff10f0]' : 'bg-blue-400/10 border-blue-400/30 text-blue-400'}`}>
                            {offer.pressureLabel}
                        </div>
                    )}

                    <div className={`flex items-center gap-1 font-bold text-[9px] px-1.5 py-0.5 rounded ${offer.supportRisk?.label === 'HIGH' ? 'text-[#ff10f0] bg-[#ff10f0]/10 animate-pulse' : 'text-blue-400 bg-blue-400/10'}`}>
                        {offer.supportRisk?.label === 'HIGH' ? 'SUPPORT RISK' : '24H DESK ACTIVE'}
                    </div>

                    {offer.amenities?.some(a => a.toUpperCase().includes('PARKING')) && (
                        <div className="text-gray-400 font-bold text-[9px] uppercase">
                            Free Parking Included
                        </div>
                    )}
                </div>

                <div className="mt-4 opacity-40 group-hover:opacity-100 transition-opacity">
                    <PriceTrendBar hotelId={offer.hotelId} />
                </div>
            </div>
        </Link>
    );
}
