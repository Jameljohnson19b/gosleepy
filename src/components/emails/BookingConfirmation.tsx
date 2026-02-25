import {
    Html,
    Head,
    Body,
    Container,
    Section,
    Text,
    Hr,
    Link,
    Img
} from '@react-email/components';
import * as React from 'react';

interface BookingConfirmationEmailProps {
    firstName: string;
    lastName: string;
    hotelName: string;
    checkIn: string;
    checkOut: string;
    confirmationNumber: string;
    totalAmount: number;
    currency: string;
}

export const BookingConfirmationEmail = ({
    firstName = 'Traveler',
    lastName = '',
    hotelName = 'Go Sleepy Hotel',
    checkIn = '2026-06-01',
    checkOut = '2026-06-02',
    confirmationNumber = 'GS-000000',
    totalAmount = 0,
    currency = 'USD'
}: BookingConfirmationEmailProps) => {
    return (
        <Html>
            <Head />
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <Text style={logoText}>GO SLEEPY</Text>
                    </Section>

                    <Section style={contentSection}>
                        <Text style={heading}>CONFIRMED</Text>
                        <Text style={subheading}>Hi {firstName}, your room at {hotelName} is secure.</Text>

                        <Hr style={hr} />

                        <Section style={detailsGrid}>
                            <Text style={detailLabel}>Confirmation Number:</Text>
                            <Text style={detailValue}>{confirmationNumber}</Text>

                            <Text style={detailLabel}>Check In:</Text>
                            <Text style={detailValue}>{checkIn}</Text>

                            <Text style={detailLabel}>Check Out:</Text>
                            <Text style={detailValue}>{checkOut}</Text>

                            <Text style={detailLabel}>Total (Due at Property):</Text>
                            <Text style={detailValue}>${totalAmount.toFixed(2)} {currency}</Text>
                        </Section>

                        <Hr style={hr} />

                        <Text style={footerText}>
                            Please present your confirmation number and a valid ID to the front desk upon arrival.
                        </Text>

                        <Text style={supportText}>
                            Need help? Visit our <Link href="https://gosleepy.xyz/support" style={link}>Support Center</Link>.
                        </Text>
                    </Section>

                    <Section style={footer}>
                        <Text style={footerLegalText}>© {new Date().getFullYear()} prpl. travel · ALL RIGHTS RESERVED</Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

// Styles for the email
const main = {
    backgroundColor: '#000000',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: '#111111',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
    borderRadius: '12px',
    border: '1px solid #333333',
    maxWidth: '600px',
};

const header = {
    padding: '24px 32px',
    textAlign: 'center' as const,
};

const logoText = {
    color: '#ff10f0',
    fontSize: '24px',
    fontWeight: '900',
    letterSpacing: '0.1em',
    margin: '0',
};

const contentSection = {
    padding: '0 32px',
};

const heading = {
    color: '#ffffff',
    fontSize: '32px',
    fontWeight: '900',
    letterSpacing: '0.05em',
    margin: '24px 0 8px',
};

const subheading = {
    color: '#a3a3a3',
    fontSize: '16px',
    lineHeight: '24px',
    margin: '0 0 24px',
};

const hr = {
    borderColor: '#333333',
    margin: '24px 0',
};

const detailsGrid = {
    backgroundColor: '#0a0a0a',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #333333',
};

const detailLabel = {
    color: '#6b7280',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    margin: '0 0 4px',
};

const detailValue = {
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '700',
    margin: '0 0 16px',
};

const footerText = {
    color: '#a3a3a3',
    fontSize: '14px',
    lineHeight: '24px',
};

const supportText = {
    color: '#a3a3a3',
    fontSize: '14px',
    lineHeight: '24px',
};

const link = {
    color: '#ff10f0',
    textDecoration: 'none',
};

const footer = {
    padding: '0 32px',
    textAlign: 'center' as const,
    marginTop: '32px',
};

const footerLegalText = {
    color: '#4b5563',
    fontSize: '10px',
    fontWeight: '700',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
};

export default BookingConfirmationEmail;
