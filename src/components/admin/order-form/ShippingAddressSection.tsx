"use client";

import { INDIAN_STATES_AND_UTS } from "@/constants/india-states";
import SearchableSelect from "@/components/admin/order-form/SearchableSelect";
import { Field, inputClass } from "@/components/ui/Field";

export interface ShippingInfo {
  street_address: string;
  city: string;
  pincode: string;
  state: string;
}

export default function ShippingAddressSection({
  shipping,
  onChange,
  pincodeError,
}: {
  shipping: ShippingInfo;
  onChange: (patch: Partial<ShippingInfo>) => void;
  pincodeError?: string;
}) {
  return (
    <div className="space-y-5">
      <Field label="Address">
        <input
          value={shipping.street_address}
          onChange={(e) => onChange({ street_address: e.target.value })}
          className={inputClass}
          placeholder="Street address, locality, landmark"
        />
      </Field>
      <div className="grid gap-5 md:grid-cols-3">
        <Field label="City">
          <input
            value={shipping.city}
            onChange={(e) => onChange({ city: e.target.value })}
            className={inputClass}
            placeholder="e.g. Bengaluru"
          />
        </Field>
        <Field label="State / Union Territory" required>
          <SearchableSelect
            options={INDIAN_STATES_AND_UTS}
            value={shipping.state}
            onChange={(state) => onChange({ state })}
            placeholder="Search state or UT..."
            required
          />
        </Field>
        <Field label="Pincode" error={pincodeError}>
          <input
            value={shipping.pincode}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "");
              if (digits.length <= 6) {
                onChange({ pincode: digits });
              }
            }}
            className={`${inputClass} font-mono`}
            placeholder="6-digit pincode"
            maxLength={6}
          />
        </Field>
      </div>
    </div>
  );
}
