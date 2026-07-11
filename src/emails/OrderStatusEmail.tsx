import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Hr,
} from "@react-email/components";
import type { CSSProperties } from "react";
import {
  EmailHeader,
  EmailFooter,
  StatusBadge,
  Section,
  Button,
  textPrimary,
  textSecondary,
  labelStyle,
  contentStyle,
} from "./components";
import { getEmailStatusContent } from "@/constants/email-statuses";

interface OrderStatusEmailProps {
  customerName: string;
  orderNumber: string;
  status: string;
  trackingUrl: string;
}

const divider: CSSProperties = {
  border: "none",
  borderTop: "1px solid #1e1e2a",
  margin: "24px 0",
};

export default function OrderStatusEmail({
  customerName,
  orderNumber,
  status,
  trackingUrl,
}: OrderStatusEmailProps) {
  const content = getEmailStatusContent(status);

  return (
    <Html>
      <Head />
      <Preview>{content.subject}</Preview>
      <Body
        style={{
          backgroundColor: "#0a0a0f",
          fontFamily: "Inter, 'Segoe UI', sans-serif",
          margin: 0,
          padding: 0,
        }}
      >
        <Container
          style={{
            maxWidth: "520px",
            margin: "0 auto",
            padding: "24px 12px",
          }}
        >
          <table
            role="presentation"
            cellPadding="0"
            cellSpacing="0"
            style={contentStyle}
          >
            <EmailHeader />

            <Section style={{ paddingTop: "8px" }}>
              <p style={textPrimary}>Hi {customerName},</p>
              <p
                style={{
                  ...textPrimary,
                  marginTop: "12px",
                }}
              >
                {content.description}
              </p>
            </Section>

            <Section style={{ textAlign: "center", paddingTop: "8px" }}>
              <StatusBadge status={content.headline} emoji={content.emoji} />
            </Section>

            <Section style={{ textAlign: "center", paddingTop: "16px" }}>
              <p style={{ ...labelStyle, marginBottom: "8px" }}>Order Number</p>
              <p
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#c084fc",
                  margin: 0,
                  letterSpacing: "2px",
                }}
              >
                {orderNumber}
              </p>
            </Section>

            <Section style={{ textAlign: "center" }}>
              <Button href={trackingUrl}>Track Your Order</Button>
            </Section>

            <Section>
              <Hr style={divider} />
              <p style={textSecondary}>
                If you have any questions, reply to this email or reach out to us
                at{" "}
                <a
                  href="mailto:support@keebforge.in"
                  style={{ color: "#a855f7", textDecoration: "underline" }}
                >
                  support@keebforge.in
                </a>
                .
              </p>
            </Section>

            <EmailFooter />
          </table>
        </Container>
      </Body>
    </Html>
  );
}
