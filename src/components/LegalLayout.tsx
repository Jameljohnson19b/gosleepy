"use client";

import { ArrowLeft, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LegalPage({ title, content }: { title: string, content: string }) {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-black text-white p-6 pb-20">
            <header className="flex items-center gap-4 mb-12">
                <button onClick={() => router.back()} className="p-2 border border-gray-800 rounded-full">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-black uppercase tracking-tighter">{title}</h1>
            </header>

            <div className="max-w-2xl mx-auto prose prose-invert">
                <div className="flex items-center gap-3 mb-8 text-[#ff10f0]">
                    <FileText className="w-8 h-8" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Legal Document 2026-v1</span>
                </div>
                <div className="text-gray-400 space-y-6 font-medium leading-relaxed">
                    {content.split('\n\n').map((paragraph, i) => (
                        <p key={i}>{paragraph}</p>
                    ))}
                </div>
            </div>
        </main>
    );
}
