import {
    Html,
    Head,
    Body,
    Container,
    Section,
    Text,
    Hr,
    Link
} from '@react-email/components';
import * as React from 'react';

interface SupportTicketEmailProps {
    ticketId: string;
    category: string;
    subject: string;
    message: string;
}

export const SupportTicketEmail = ({
    ticketId = 'TKT-0000',
    category = 'General',
    subject = 'No subject',
    message = ''
}: SupportTicketEmailProps) => {
    return (
        <Html>
            <Head />
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <Text style={logoText}>GO SLEEPY SUPPORT</Text>
                    </Section>

                    <Section style={contentSection}>
                        <Text style={heading}>TICKET RECEIVED</Text>
                        <Text style={subheading}>We've received your support request. Our team is investigating.</Text>

                        <Hr style={hr} />

                        <Section style={detailsGrid}>
                            <Text style={detailLabel}>Ticket ID:</Text>
                            <Text style={detailValue}>{ticketId}</Text>

                            <Text style={detailLabel}>Category:</Text>
                            <Text style={detailValue}>{category}</Text>

                            <Text style={detailLabel}>Subject:</Text>
                            <Text style={detailValue}>{subject}</Text>
                        </Section>

                        <Hr style={hr} />

                        <Text style={messageHeading}>Your Message:</Text>
                        <Text style={messageContent}>{message}</Text>

                        <Hr style={hr} />

                        <Text style={footerText}>
                            We typically respond within 15 minutes for HIGH priority issues.
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

const messageHeading = {
    color: '#6b7280',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    margin: '0 0 8px',
};

const messageContent = {
    color: '#ffffff',
    fontSize: '14px',
    lineHeight: '21px',
    backgroundColor: '#0a0a0a',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #333333',
};

const footerText = {
    color: '#a3a3a3',
    fontSize: '14px',
    lineHeight: '24px',
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

export default SupportTicketEmail;
