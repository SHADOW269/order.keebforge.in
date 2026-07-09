"use client";

import { Field, inputClass } from "@/components/ui/Field";

export interface CustomerInfo {
  customer_name: string;
  discord_username: string;
  customer_email: string;
  customer_phone: string;
  customer_message: string;
}

export default function CustomerInfoSection({
  customer,
  onChange,
}: {
  customer: CustomerInfo;
  onChange: (patch: Partial<CustomerInfo>) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Customer Name" required>
          <input
            value={customer.customer_name}
            onChange={(e) => onChange({ customer_name: e.target.value })}
            className={inputClass}
            placeholder="Full name"
          />
        </Field>
        <Field label="Discord">
          <input
            value={customer.discord_username}
            onChange={(e) => onChange({ discord_username: e.target.value })}
            placeholder="@username"
            className={inputClass}
          />
        </Field>
        <Field label="Email" required>
          <input
            type="email"
            value={customer.customer_email}
            onChange={(e) => onChange({ customer_email: e.target.value })}
            className={inputClass}
            placeholder="customer@example.com"
          />
        </Field>
        <Field label="Phone / WhatsApp" required>
          <input
            type="tel"
            inputMode="numeric"
            value={customer.customer_phone}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
              onChange({ customer_phone: digits });
            }}
            className={inputClass}
            placeholder="9999999999"
            maxLength={10}
          />
        </Field>
      </div>
    </div>
  );
}
