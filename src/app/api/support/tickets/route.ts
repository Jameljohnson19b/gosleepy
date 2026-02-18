import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { bookingId, email, category, subject, message } = body;

        const { data, error } = await supabase
            .from('support_tickets')
            .insert([
                {
                    booking_id: bookingId || null,
                    email,
                    category,
                    subject,
                    message,
                    status: 'OPEN',
                    priority: category === 'RES_NOT_FOUND' ? 'HIGH' : 'MEDIUM'
                }
            ])
            .select();

        if (error) throw error;

        // Also log outcome if booking exists
        if (bookingId) {
            await supabase.from('support_outcomes').insert([
                {
                    booking_id: bookingId,
                    had_ticket: true,
                    ticket_category: category
                }
            ]);
        }

        return NextResponse.json({ success: true, ticketId: data[0].id });
    } catch (error: any) {
        console.error('Support Ticket Error:', error);
        return NextResponse.json({ error: 'Failed to submit ticket' }, { status: 500 });
    }
}
