import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const name = searchParams.get('name');
    const address = searchParams.get('address');

    if (!name || !address) {
        return NextResponse.json({ phone: null }, { status: 400 });
    }

    try {
        const q = `${name} ${address} phone number`;
        const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
        });

        if (!res.ok) {
            return NextResponse.json({ phone: null });
        }

        const text = await res.text();

        // Match standard North American phone numbers
        const phoneRegex = /(?:\+?1[-.\s]?)?\(?[2-9][0-9]{2}\)?[-.\s]?[2-9][0-9]{2}[-.\s]?[0-9]{4}/;
        const phoneMatch = text.match(phoneRegex);

        if (phoneMatch) {
            return NextResponse.json({ phone: phoneMatch[0] });
        }

        return NextResponse.json({ phone: null });

    } catch (error) {
        console.error('Phone extraction error:', error);
        return NextResponse.json({ phone: null }, { status: 500 });
    }
}
