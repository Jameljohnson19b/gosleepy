import { useState, useEffect } from 'react';

export function useResolvedPhone(initialPhone: string, hotelName: string, address: string) {
    const [phone, setPhone] = useState(initialPhone);
    const [resolving, setResolving] = useState(false);

    useEffect(() => {
        if (!initialPhone || initialPhone.includes('Property') || initialPhone === "5550123" || initialPhone === "0") {
            let isMounted = true;
            async function resolve() {
                setResolving(true);
                try {
                    const res = await fetch(`/api/hotel/phone?name=${encodeURIComponent(hotelName)}&address=${encodeURIComponent(address)}`);
                    const data = await res.json();
                    if (isMounted && data.phone) {
                        setPhone(data.phone);
                    }
                } catch (err) {
                    console.error("Failed to resolve phone", err);
                } finally {
                    if (isMounted) setResolving(false);
                }
            }
            resolve();
            return () => { isMounted = false; };
        } else {
            setPhone(initialPhone);
        }
    }, [initialPhone, hotelName, address]);

    return { phone, resolving };
}
