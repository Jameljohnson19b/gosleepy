"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { User } from "lucide-react";
import SoftAuthSheet from "./SoftAuthSheet";
import { usePathname } from "next/navigation";

export default function AuthButton() {
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [showAuth, setShowAuth] = useState(false);

    useEffect(() => {
        // Only initialize client on the client-side to avoid build-time environment variable errors
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            console.warn("Supabase credentials missing, auth button disabled.");
            return;
        }

        const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (user) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <div className="w-5 h-5 rounded-full bg-[#ff10f0]/20 flex items-center justify-center border border-[#ff10f0]/30 shadow-[0_0_10px_rgba(255,16,240,0.2)]">
                    <User className="w-3 h-3 text-[#ff10f0]" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                    {user.email?.split("@")[0]}
                </span>
            </div>
        );
    }

    return (
        <>
            <button
                onClick={() => setShowAuth(true)}
                className="text-[10px] font-black uppercase tracking-widest text-[#ff10f0] border border-[#ff10f0]/30 px-5 py-2 rounded-full hover:bg-[#ff10f0]/10 hover:shadow-[0_0_15px_rgba(255,16,240,0.2)] transition-all active:scale-95"
            >
                Sign In
            </button>

            <SoftAuthSheet
                open={showAuth}
                onClose={() => setShowAuth(false)}
                nextUrl={pathname || "/"}
            />
        </>
    );
}
