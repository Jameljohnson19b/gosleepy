import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { sendSupportTicketConfirmation } from '@/lib/email/resend';

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

        // 5. Send Support Confirmation Email
        try {
            await sendSupportTicketConfirmation({
                to: email,
                ticketId: data[0].id,
                category,
                subject,
                message
            });
        } catch (emailError) {
            console.error("Failed to send support confirmation email:", emailError);
        }

        return NextResponse.json({ success: true, ticketId: data[0].id });
    } catch (error: any) {
        console.error('Support Ticket Error:', error);
        return NextResponse.json({ error: 'Failed to submit ticket' }, { status: 500 });
    }
}
