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
  labelStyle,
  PURPLE,
  PURPLE_LIGHT,
} from "./components";
import { getEmailStatusContent } from "@/constants/email-statuses";

interface OrderStatusChangedEmailProps {
  customerName: string;
  orderNumber: string;
  previousStatus: string;
  newStatus: string;
  trackingUrl: string;
  lastUpdated: string;
  estimatedCompletion?: string;
  intro: string;
  description: string;
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

export default function OrderStatusChangedEmail({
  customerName,
  orderNumber,
  previousStatus,
  newStatus,
  trackingUrl,
  lastUpdated,
  estimatedCompletion,
  intro,
  description,
  timeline = [],
  logoUrl,
  orderDetails,
}: OrderStatusChangedEmailProps) {
  const content = getEmailStatusContent(newStatus);
  
  return (
    <Html>
      <Head />
      <Preview>{`Order #${orderNumber} Status Updated to ${newStatus} — KeebForge`}</Preview>
      <Body style={{ backgroundColor: "#0a0a0f", margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: "480px", margin: "0 auto", padding: "12px 6px" }}>
          <table role="presentation" cellPadding="0" cellSpacing="0" style={contentStyle}>
            <tr>
              <td>
                <AccentGraphics />
                <BetterHeader subtitle="Order Update" logoUrl={logoUrl} />
                
                {/* 1. Order Update Section */}
                <Section style={{ paddingBottom: 0 }}>
                  <SectionHeader icon="📦" title="Order Update" />
                  <ProgressBar currentStatus={newStatus} />
                </Section>
                
                <Section style={{ paddingTop: 0, paddingBottom: 0 }}>
                  <StatusSummaryCard
                    orderNumber={orderNumber}
                    status={newStatus}
                    lastUpdated={lastUpdated}
                    estimatedCompletion={estimatedCompletion}
                    trackingUrl={trackingUrl}
                  />
                </Section>

                {/* Previous vs New Status Graphic */}
                <Section style={{ paddingBottom: 0 }}>
                  <table role="presentation" style={{ width: "100%", margin: "8px 0" }}>
                    <tr>
                      <td style={{ textAlign: "center" }}>
                        <div style={{ backgroundColor: "#12121a", border: "1px solid #2a1f3d", borderRadius: "8px", padding: "8px 16px", minWidth: "140px", display: "inline-block" }}>
                          <p style={{ ...labelStyle, fontSize: "9px", marginBottom: "2px" }}>Previous Status</p>
                          <p style={{ ...textPrimary, fontSize: "13px", fontWeight: 600, color: "#94a3b8", margin: 0 }}>{previousStatus}</p>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: "center", padding: "6px 0" }}>
                        <span style={{ fontSize: "18px", color: PURPLE, fontWeight: "bold" }}>↓</span>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: "center" }}>
                        <div style={{ backgroundColor: "rgba(168, 85, 247, 0.08)", border: `1px solid ${PURPLE}`, borderRadius: "8px", padding: "8px 16px", minWidth: "140px", display: "inline-block" }}>
                          <p style={{ ...labelStyle, fontSize: "9px", marginBottom: "2px", color: PURPLE_LIGHT }}>New Status</p>
                          <p style={{ ...textPrimary, fontSize: "14px", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>{content.emoji} {newStatus}</p>
                        </div>
                      </td>
                    </tr>
                  </table>
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
