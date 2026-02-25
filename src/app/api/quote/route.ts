import { NextRequest, NextResponse } from 'next/server';
import { MockSupplierAdapter } from '@/lib/supplier/mock';
import { AmadeusAdapter } from '@/lib/supplier/amadeus';

const supplier = process.env.AMADEUS_CLIENT_ID ? new AmadeusAdapter() : new MockSupplierAdapter();

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { ratePayload } = body;

        if (!ratePayload) {
            return NextResponse.json({ error: 'Missing ratePayload' }, { status: 400 });
        }

        const quote = await supplier.quote(ratePayload);

        if (!quote.ok) {
            return NextResponse.json({ error: quote.error || 'Failed to quote' }, { status: 400 });
        }

        return NextResponse.json(quote);

    } catch (error: any) {
        console.error('Quote API Error:', error);
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}
