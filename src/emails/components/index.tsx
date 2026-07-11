import React from "react";
import type { CSSProperties } from "react";
import { getEmailStatusContent } from "@/constants/email-statuses";

export const PURPLE = "#A855F7";
export const PURPLE_LIGHT = "#C084FC";
export const ORANGE = PURPLE;
export const ORANGE_LIGHT = PURPLE_LIGHT;
export const BG_DARK = "#0a0a0f";
export const BG_CARD = "#0d0d14";
export const TEXT_PRIMARY = "#f1f5f9";
export const TEXT_SECONDARY = "#94a3b8";
export const TEXT_MUTED = "#64748b";
export const BORDER = "#2A1F3D";

export const contentStyle: CSSProperties = {
  backgroundColor: BG_DARK,
  borderRadius: "12px",
  border: `1px solid ${BORDER}`,
  overflow: "hidden",
  width: "100%",
  maxHeight: "none",
};

export const textPrimary: CSSProperties = {
  fontFamily: "Inter, 'Segoe UI', sans-serif",
  fontSize: "14px",
  color: TEXT_PRIMARY,
  lineHeight: "22px",
  margin: 0,
};

export const textSecondary: CSSProperties = {
  fontFamily: "Inter, 'Segoe UI', sans-serif",
  fontSize: "12px",
  color: TEXT_SECONDARY,
  lineHeight: "18px",
  margin: 0,
};

export const labelStyle: CSSProperties = {
  fontFamily: "Inter, 'Segoe UI', sans-serif",
  fontSize: "11px",
  color: TEXT_MUTED,
  textTransform: "uppercase",
  letterSpacing: "1.5px",
  margin: 0,
  fontWeight: 600,
};

export function Section({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: CSSProperties;
}) {
  return (
    <table role="presentation" cellPadding="0" cellSpacing="0" style={{ width: "100%" }}>
      <tr>
        <td style={{ padding: "8px 20px", ...style }}>{children}</td>
      </tr>
    </table>
  );
}

export function AccentGraphics() {
  return (
    <table role="presentation" cellPadding="0" cellSpacing="0" style={{ width: "100%" }}>
      <tr>
        <td style={{ height: "4px", backgroundColor: PURPLE, borderTopLeftRadius: "12px", borderTopRightRadius: "12px" }}></td>
      </tr>
    </table>
  );
}

export function BetterHeader({
  subtitle = "Order Update",
  logoUrl = "https://order.keebforge.in/logo.png"
}: {
  subtitle?: string;
  logoUrl?: string;
}) {
  return (
    <table role="presentation" cellPadding="0" cellSpacing="0" style={{ width: "100%", backgroundColor: BG_DARK }}>
      <tr>
        <td style={{ padding: "24px 16px 12px", textAlign: "center" }}>
          {logoUrl && (
            <img
              src={logoUrl}
              alt="KeebForge Logo"
              width="60"
              height="60"
              style={{
                display: "block",
                margin: "0 auto 10px",
                width: "60px",
                height: "60px",
                border: "none",
                outline: "none",
                textDecoration: "none",
              }}
            />
          )}
          <h1 style={{
            fontFamily: "'Courier New', monospace",
            fontSize: "22px",
            fontWeight: 800,
            color: PURPLE,
            letterSpacing: "4px",
            margin: "0",
            textTransform: "uppercase"
          }}>
            KeebForge
          </h1>
          <p style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "10px",
            color: TEXT_MUTED,
            letterSpacing: "2px",
            margin: "2px 0 10px",
            textTransform: "uppercase",
            fontWeight: 600
          }}>
            Custom Mechanical Keyboard Workshop
          </p>
          <div style={{
            display: "inline-block",
            borderTop: `1px solid ${BORDER}`,
            borderBottom: `1px solid ${BORDER}`,
            padding: "4px 12px",
            fontSize: "11px",
            fontWeight: 700,
            color: PURPLE_LIGHT,
            textTransform: "uppercase",
            letterSpacing: "1px",
            fontFamily: "Inter, sans-serif"
          }}>
            {subtitle}
          </div>
        </td>
      </tr>
    </table>
  );
}

export function SectionHeader({
  icon,
  title,
}: {
  icon: string;
  title: string;
}) {
  return (
    <table role="presentation" style={{ width: "100%", marginTop: "16px", marginBottom: "8px" }}>
      <tr>
        <td style={{ paddingBottom: "4px" }}>
          <p style={{ margin: 0, fontSize: "11px", fontWeight: 700, color: PURPLE_LIGHT, textTransform: "uppercase", letterSpacing: "1.5px", fontFamily: "Inter, sans-serif" }}>
            {icon} {title}
          </p>
        </td>
      </tr>
      <tr>
        <td style={{ height: "1px", backgroundColor: BORDER }}></td>
      </tr>
    </table>
  );
}

export function OrderDetailsCard({
  details,
}: {
  details?: {
    keyboard?: string;
    service?: string | string[];
    color?: string;
    switches?: string;
    keycaps?: string;
    extras?: string | string[];
  };
}) {
  if (!details) return null;

  // Build the list of active fields
  const fields: Array<{ icon: string; label: string; value: string | string[] }> = [];

  if (details.keyboard) {
    fields.push({ icon: "⌨️", label: "Keyboard", value: details.keyboard });
  }
  if (details.service) {
    fields.push({ icon: "🛠", label: "Service", value: details.service });
  }
  if (details.color) {
    fields.push({ icon: "🎨", label: "Color", value: details.color });
  }
  if (details.switches) {
    fields.push({ icon: "⌨️", label: "Switches", value: details.switches });
  }
  if (details.keycaps) {
    fields.push({ icon: "🧩", label: "Keycaps", value: details.keycaps });
  }
  if (details.extras && (Array.isArray(details.extras) ? details.extras.length > 0 : details.extras)) {
    fields.push({ icon: "🎁", label: "Extras", value: details.extras });
  }

  if (fields.length === 0) return null;

  return (
    <table role="presentation" style={{ width: "100%", backgroundColor: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "16px", margin: "12px 0", borderCollapse: "collapse" }}>
      {fields.map((field, idx) => {
        const isLast = idx === fields.length - 1;
        const borderStyle = isLast ? {} : { borderBottom: `1px solid ${BORDER}` };
        
        const renderValue = () => {
          if (Array.isArray(field.value)) {
            return field.value.map((v, vIdx) => (
              <p key={vIdx} style={{ margin: "2px 0 0", fontSize: "13px", fontWeight: 600, color: TEXT_PRIMARY, fontFamily: "Inter, sans-serif" }}>
                {v}
              </p>
            ));
          }
          return (
            <p style={{ margin: "2px 0 0", fontSize: "13px", fontWeight: 600, color: TEXT_PRIMARY, fontFamily: "Inter, sans-serif" }}>
              {field.value}
            </p>
          );
        };

        return (
          <tr key={idx}>
            <td style={{ padding: "8px 0", ...borderStyle }}>
              <p style={{ margin: 0, fontSize: "10px", color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "1px", fontFamily: "Inter, sans-serif", fontWeight: 600 }}>
                {field.icon} {field.label}
              </p>
              {renderValue()}
            </td>
          </tr>
        );
      })}
    </table>
  );
}

export function BetterFooter({ trackingUrl }: { trackingUrl: string }) {
  return (
    <table role="presentation" cellPadding="0" cellSpacing="0" style={{ width: "100%", backgroundColor: BG_CARD, borderTop: `1px solid ${BORDER}`, marginTop: "16px" }}>
      <tr>
        <td style={{ padding: "16px 20px", textAlign: "center" }}>
          <p style={{ margin: "0 0 10px", fontSize: "11px", fontWeight: 700, color: TEXT_PRIMARY, textTransform: "uppercase", letterSpacing: "1.5px", fontFamily: "Inter, sans-serif" }}>
            Need Help?
          </p>
          <table role="presentation" style={{ margin: "0 auto", marginBottom: "8px" }}>
            <tr>
              <td style={{ padding: "0 10px" }}>
                <a href="mailto:support@keebforge.in" style={{ color: PURPLE_LIGHT, fontSize: "11px", textDecoration: "none", fontFamily: "Inter, sans-serif" }}>
                  📧 support@keebforge.in
                </a>
              </td>
              <td style={{ padding: "0 10px" }}>
                <a href="https://keebforge.in" style={{ color: PURPLE_LIGHT, fontSize: "11px", textDecoration: "none", fontFamily: "Inter, sans-serif" }}>
                  🌐 keebforge.in
                </a>
              </td>
              <td style={{ padding: "0 10px" }}>
                <a href={trackingUrl} style={{ color: PURPLE_LIGHT, fontSize: "11px", textDecoration: "none", fontFamily: "Inter, sans-serif" }}>
                  🔗 Track Order
                </a>
              </td>
            </tr>
          </table>
          <p style={{ margin: "8px 0 0", fontSize: "9px", color: TEXT_MUTED, fontFamily: "Inter, sans-serif" }}>
            © {new Date().getFullYear()} KeebForge
          </p>
        </td>
      </tr>
    </table>
  );
}

export function getProgressPercentage(status: string): number {
  const s = status.toLowerCase();
  
  if (
    s.includes("delivered") ||
    s.includes("warranty") ||
    (s.includes("completed") && s.includes("order"))
  ) {
    return 100;
  }
  if (s.includes("transit")) return 95;
  if (s.includes("picked up") || s.includes("shipped")) return 90;
  if (s.includes("booked") && s.includes("ship")) return 85;
  if (s.includes("packing")) return 80;
  if (s === "completed") return 75;
  if (s.includes("testing")) return 65;
  if (s.includes("work") || s.includes("started")) return 55;
  if (s.includes("queue")) return 45;
  if (s.includes("received") && s.includes("part")) return 38;
  if (s.includes("shipped") && s.includes("part")) return 32;
  if (s.includes("booked") && s.includes("part")) return 26;
  if (s.includes("received") && s.includes("payment")) return 20;
  if (s.includes("pending") && s.includes("payment")) return 15;
  if (s.includes("confirmed")) return 10;
  if (s.includes("received") && s.includes("order")) return 5;
  
  return 10;
}

export function ProgressBar({ currentStatus }: { currentStatus: string }) {
  const percentage = getProgressPercentage(currentStatus);
  
  return (
    <table role="presentation" cellPadding="0" cellSpacing="0" style={{ width: "100%", margin: "8px 0 12px" }}>
      <tr>
        <td style={{ verticalAlign: "middle" }}>
          <table role="presentation" cellPadding="0" cellSpacing="0" style={{ width: "100%", backgroundColor: "#13131a", border: `1px solid ${BORDER}`, borderRadius: "6px", height: "8px", overflow: "hidden" }}>
            <tr>
              <td style={{ width: `${percentage}%`, backgroundColor: PURPLE, height: "6px", borderRadius: "6px" }}></td>
              <td style={{ width: `${100 - percentage}%`, height: "6px" }}></td>
            </tr>
          </table>
        </td>
        <td style={{ width: "40px", textAlign: "right", verticalAlign: "middle", paddingLeft: "8px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: PURPLE_LIGHT, fontFamily: "Inter, sans-serif" }}>
            {percentage}%
          </span>
        </td>
      </tr>
    </table>
  );
}

export function StatusSummaryCard({
  orderNumber,
  status,
  lastUpdated,
  estimatedCompletion,
  trackingUrl
}: {
  orderNumber: string;
  status: string;
  lastUpdated: string;
  estimatedCompletion?: string;
  trackingUrl: string;
}) {
  const statusContent = getEmailStatusContent(status);
  
  return (
    <table role="presentation" style={{ width: "100%", backgroundColor: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "12px 14px", margin: "10px 0" }}>
      <tr>
        <td style={{ verticalAlign: "middle" }}>
          <p style={{ margin: "0 0 6px", fontSize: "14px", fontWeight: 700, color: TEXT_PRIMARY, fontFamily: "'Courier New', monospace", letterSpacing: "1px" }}>
            📦 Order #{orderNumber}
          </p>
          <table role="presentation" style={{ width: "100%" }}>
            <tr>
              <td style={{ padding: "2px 0", fontSize: "10px", color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "1px", fontFamily: "Inter, sans-serif", fontWeight: 600 }}>Current Status</td>
              <td style={{ padding: "2px 0", fontSize: "11px", fontWeight: 700, color: PURPLE_LIGHT, textAlign: "right", fontFamily: "Inter, sans-serif" }}>
                {statusContent.emoji} {status}
              </td>
            </tr>
            <tr>
              <td style={{ padding: "2px 0", fontSize: "10px", color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "1px", fontFamily: "Inter, sans-serif", fontWeight: 600 }}>Last Updated</td>
              <td style={{ padding: "2px 0", fontSize: "10px", fontWeight: 500, color: TEXT_PRIMARY, textAlign: "right", fontFamily: "Inter, sans-serif" }}>
                🕒 {lastUpdated}
              </td>
            </tr>
            {estimatedCompletion && (
              <tr>
                <td style={{ padding: "2px 0", fontSize: "10px", color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "1px", fontFamily: "Inter, sans-serif", fontWeight: 600 }}>Estimated Completion</td>
                <td style={{ padding: "2px 0", fontSize: "10px", fontWeight: 500, color: TEXT_PRIMARY, textAlign: "right", fontFamily: "Inter, sans-serif" }}>
                  {estimatedCompletion}
                </td>
              </tr>
            )}
          </table>
        </td>
        <td style={{ width: "100px", textAlign: "right", verticalAlign: "middle", paddingLeft: "10px" }}>
          <a href={trackingUrl} style={{
            display: "inline-block",
            backgroundColor: PURPLE,
            color: "#ffffff",
            textDecoration: "none",
            fontSize: "10px",
            fontWeight: 700,
            padding: "8px 12px",
            borderRadius: "5px",
            textTransform: "uppercase",
            letterSpacing: "1px",
            fontFamily: "Inter, sans-serif",
            textAlign: "center",
            width: "76px"
          }}>
            Track Order
          </a>
        </td>
      </tr>
    </table>
  );
}

export function ProductInformation({
  keyboardName = "Custom Keyboard",
  serviceType = "Build Service",
  orderNumber
}: {
  keyboardName?: string;
  serviceType?: string;
  orderNumber: string;
}) {
  return (
    <table role="presentation" style={{ width: "100%", margin: "12px 0", border: `1px solid ${BORDER}`, borderRadius: "8px", padding: "10px", backgroundColor: BG_DARK }}>
      <tr>
        <td style={{ width: "33.3%", textAlign: "left", verticalAlign: "top" }}>
          <p style={{ margin: "0 0 3px", fontSize: "8px", color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "1.5px", fontFamily: "Inter, sans-serif", fontWeight: 600 }}>⌨️ Keyboard</p>
          <p style={{ margin: 0, fontSize: "12px", fontWeight: 600, color: TEXT_PRIMARY, fontFamily: "Inter, sans-serif" }}>{keyboardName}</p>
        </td>
        <td style={{ width: "33.3%", textAlign: "center", verticalAlign: "top", borderLeft: `1px solid ${BORDER}`, borderRight: `1px solid ${BORDER}`, padding: "0 6px" }}>
          <p style={{ margin: "0 0 3px", fontSize: "8px", color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "1.5px", fontFamily: "Inter, sans-serif", fontWeight: 600 }}>🛠 Service</p>
          <p style={{ margin: 0, fontSize: "12px", fontWeight: 600, color: TEXT_PRIMARY, fontFamily: "Inter, sans-serif" }}>{serviceType}</p>
        </td>
        <td style={{ width: "33.3%", textAlign: "right", verticalAlign: "top" }}>
          <p style={{ margin: "0 0 3px", fontSize: "8px", color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "1.5px", fontFamily: "Inter, sans-serif", fontWeight: 600 }}>📦 Order</p>
          <p style={{ margin: 0, fontSize: "12px", fontWeight: 600, color: PURPLE_LIGHT, fontFamily: "'Courier New', monospace" }}>#{orderNumber}</p>
        </td>
      </tr>
    </table>
  );
}

export function WorkshopNotes({ note }: { note: string }) {
  return (
    <table role="presentation" style={{ width: "100%", margin: "12px 0", borderCollapse: "collapse" }}>
      <tr>
        <td style={{ padding: "10px 14px", backgroundColor: BG_CARD, borderLeft: `3px solid ${PURPLE}`, borderRadius: "0 6px 6px 0", border: `1px solid ${BORDER}`, borderLeftColor: PURPLE }}>
          <p style={{ margin: "0 0 4px", fontSize: "10px", fontWeight: 700, color: PURPLE_LIGHT, textTransform: "uppercase", letterSpacing: "1px", fontFamily: "Inter, sans-serif" }}>
            🛠 Workshop Notes
          </p>
          <p style={{ margin: 0, fontSize: "12px", color: TEXT_PRIMARY, lineHeight: "18px", whiteSpace: "pre-line", fontFamily: "Inter, sans-serif" }}>
            {note}
          </p>
        </td>
      </tr>
    </table>
  );
}

export function QuickOrderDetails({
  orderNumber,
  status,
  customerName,
}: {
  orderNumber: string;
  status: string;
  customerName: string;
}) {
  return (
    <table role="presentation" style={{ width: "100%", margin: "12px 0", borderCollapse: "collapse" }}>
      <tr>
        <td style={{ padding: "8px 6px", borderBottom: `1px solid ${BORDER}` }}>
          <span style={{ fontSize: "11px", color: TEXT_MUTED, fontFamily: "Inter, sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>📦 Order Number</span>
        </td>
        <td style={{ padding: "8px 6px", borderBottom: `1px solid ${BORDER}`, textAlign: "right" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: PURPLE_LIGHT, fontFamily: "'Courier New', monospace" }}>{orderNumber}</span>
        </td>
      </tr>
      <tr>
        <td style={{ padding: "8px 6px", borderBottom: `1px solid ${BORDER}` }}>
          <span style={{ fontSize: "11px", color: TEXT_MUTED, fontFamily: "Inter, sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>🛠 Current Stage</span>
        </td>
        <td style={{ padding: "8px 6px", borderBottom: `1px solid ${BORDER}`, textAlign: "right" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: TEXT_PRIMARY, fontFamily: "Inter, sans-serif" }}>{status}</span>
        </td>
      </tr>
      <tr>
        <td style={{ padding: "8px 6px", borderBottom: `1px solid ${BORDER}` }}>
          <span style={{ fontSize: "11px", color: TEXT_MUTED, fontFamily: "Inter, sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>👤 Customer</span>
        </td>
        <td style={{ padding: "8px 6px", borderBottom: `1px solid ${BORDER}`, textAlign: "right" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: TEXT_PRIMARY, fontFamily: "Inter, sans-serif" }}>{customerName}</span>
        </td>
      </tr>
    </table>
  );
}

export function TrackingButton({ href }: { href: string }) {
  return (
    <table role="presentation" style={{ width: "100%", margin: "16px 0", textAlign: "center" }}>
      <tr>
        <td>
          <div style={{ borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, padding: "12px 0", margin: "6px 0" }}>
            <a href={href} style={{
              display: "inline-block",
              color: PURPLE_LIGHT,
              textDecoration: "none",
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "2.5px",
              fontFamily: "Inter, sans-serif"
            }}>
              TRACK YOUR ORDER &rarr;
            </a>
          </div>
          <p style={{ margin: "6px 0 0", fontSize: "10px", color: TEXT_MUTED, fontFamily: "Inter, sans-serif" }}>
            If the link is blocked, paste this in your browser:
          </p>
          <p style={{ margin: "2px 0 0", fontSize: "10px", color: PURPLE, wordBreak: "break-all", fontFamily: "monospace" }}>
            {href}
          </p>
        </td>
      </tr>
    </table>
  );
}

export function CompactTimeline({
  timeline = [],
  trackingUrl,
}: {
  timeline: Array<{ status: string; note: string | null; created_at: string }>;
  trackingUrl: string;
}) {
  if (timeline.length === 0) return null;

  const events = timeline.slice(0, 5);

  return (
    <table role="presentation" style={{ width: "100%", margin: "4px 0", borderCollapse: "collapse" }}>
      <tr>
        <td>
          <table role="presentation" style={{ width: "100%", borderCollapse: "collapse" }}>
            {events.map((item, index) => {
              const isCurrent = index === 0;
              const marker = isCurrent ? "🟣" : "✓";
              const titleColor = isCurrent ? PURPLE_LIGHT : TEXT_PRIMARY;
              const fontWeight = isCurrent ? "700" : "500";
              const timeDisplay = item.created_at;
              
              return (
                <tr key={index}>
                  <td style={{ padding: "4px 0", verticalAlign: "top", fontFamily: "Inter, sans-serif" }}>
                    <span style={{ fontSize: "12px", marginRight: "8px" }}>{marker}</span>
                    <span style={{ fontSize: "12px", color: titleColor, fontWeight, fontFamily: "Inter, sans-serif" }}>
                      {item.status} {isCurrent && "(Current)"}
                    </span>
                  </td>
                  <td style={{ padding: "4px 0", verticalAlign: "top", textAlign: "right", fontSize: "11px", color: TEXT_MUTED, fontFamily: "Inter, sans-serif" }}>
                    {timeDisplay}
                  </td>
                </tr>
              );
            })}
          </table>
          <div style={{ marginTop: "12px" }}>
            <a href={trackingUrl} style={{ fontSize: "11px", color: PURPLE_LIGHT, fontWeight: "600", textDecoration: "none", fontFamily: "Inter, sans-serif" }}>
              View Full Timeline &rarr;
            </a>
          </div>
        </td>
      </tr>
    </table>
  );
}

export function EmailHeader() {
  return <BetterHeader subtitle="Order Update" />;
}

export function EmailFooter() {
  return <BetterFooter trackingUrl="https://order.keebforge.in" />;
}

export function StatusBadge({ status, emoji }: { status: string; emoji: string }) {
  return (
    <table role="presentation" style={{ margin: "0 auto" }}>
      <tr>
        <td style={{ backgroundColor: "rgba(168, 85, 247, 0.08)", border: `1px solid ${PURPLE}`, borderRadius: "8px", padding: "8px 16px", textAlign: "center" }}>
          <span style={{ fontSize: "14px", fontWeight: 700, color: TEXT_PRIMARY, fontFamily: "Inter, sans-serif" }}>{emoji} {status}</span>
        </td>
      </tr>
    </table>
  );
}

export function Button({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} style={{
      display: "inline-block",
      backgroundColor: PURPLE,
      color: "#ffffff",
      textDecoration: "none",
      fontSize: "12px",
      fontWeight: 700,
      padding: "10px 20px",
      borderRadius: "6px",
      textTransform: "uppercase",
      letterSpacing: "1px",
      fontFamily: "Inter, sans-serif"
    }}>
      {children}
    </a>
  );
}


