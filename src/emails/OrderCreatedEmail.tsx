import React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
} from "@react-email/components";
import {
  AccentGraphics,
  BetterHeader,
  ProgressBar,
  StatusSummaryCard,
  SectionHeader,
  OrderDetailsCard,
  CompactTimeline,
  BetterFooter,
  contentStyle,
  Section,
  textPrimary,
  PURPLE_LIGHT,
} from "./components";

interface OrderCreatedEmailProps {
  customerName: string;
  orderNumber: string;
  status: string;
  trackingUrl: string;
  lastUpdated: string;
  estimatedCompletion?: string;
  intro?: string;
  description?: string;
  timeline?: Array<{ status: string; note: string | null; created_at: string }>;
  logoUrl?: string;
  orderDetails?: {
    keyboard?: string;
    service?: string | string[];
    color?: string;
    switches?: string;
    keycaps?: string;
    extras?: string | string[];
  };
}

export default function OrderCreatedEmail({
  customerName,
  orderNumber,
  status,
  trackingUrl,
  lastUpdated,
  estimatedCompletion,
  intro = "Great news!",
  description = "Your order has been successfully created. We have verified your spot in the workshop queue and will begin sourcing parts shortly.",
  timeline = [],
  logoUrl,
  orderDetails,
}: OrderCreatedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{`Order #${orderNumber} Confirmed — KeebForge`}</Preview>
      <Body style={{ backgroundColor: "#0a0a0f", margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: "480px", margin: "0 auto", padding: "12px 6px" }}>
          <table role="presentation" cellPadding="0" cellSpacing="0" style={contentStyle}>
            <tr>
              <td>
                <AccentGraphics />
                <BetterHeader subtitle="Order Confirmed" logoUrl={logoUrl} />
                
                {/* 1. Order Update Section */}
                <Section style={{ paddingBottom: 0 }}>
                  <SectionHeader icon="📦" title="Order Update" />
                  <ProgressBar currentStatus={status} />
                </Section>
                
                <Section style={{ paddingTop: 0, paddingBottom: 0 }}>
                  <StatusSummaryCard
                    orderNumber={orderNumber}
                    status={status}
                    lastUpdated={lastUpdated}
                    estimatedCompletion={estimatedCompletion}
                    trackingUrl={trackingUrl}
                  />
                </Section>
                
                <Section style={{ paddingBottom: 0 }}>
                  <p style={textPrimary}><strong>Hi {customerName},</strong></p>
                  <p style={{ ...textPrimary, marginTop: "8px", fontWeight: "bold", fontSize: "15px", color: PURPLE_LIGHT }}>
                    {intro}
                  </p>
                  <p style={{ ...textPrimary, marginTop: "6px", color: "#e2e8f0" }}>
                    {description}
                  </p>
                  <p style={{ ...textPrimary, marginTop: "8px", color: "#94a3b8", fontSize: "13px" }}>
                    We&apos;ll email you again when the next milestone is reached.
                  </p>
                </Section>
                
                {/* 2. Order Details Section */}
                {orderDetails && (
                  <Section style={{ paddingBottom: 0 }}>
                    <SectionHeader icon="🛠" title="Order Details" />
                    <OrderDetailsCard details={orderDetails} />
                  </Section>
                )}
                
                {/* 3. Latest Activity Section */}
                <Section style={{ paddingBottom: "24px" }}>
                  <SectionHeader icon="🕒" title="Latest Activity" />
                  <CompactTimeline
                    timeline={timeline}
                    trackingUrl={trackingUrl}
                  />
                </Section>
                
                <BetterFooter trackingUrl={trackingUrl} />
              </td>
            </tr>
          </table>
        </Container>
      </Body>
    </Html>
  );
}
