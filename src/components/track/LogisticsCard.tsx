export default function LogisticsCard({
  courier, trackingNumber, trackingUrl, shippingStatus, estimatedDispatch, estimatedDelivery,
}: {
  courier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  shippingStatus: string | null;
  estimatedDispatch: string | null;
  estimatedDelivery: string | null;
}) {
  return (
    <div className="space-y-4 text-sm">
      {courier && <Field label="Courier" value={courier} />}
      {trackingNumber && <Field label="Tracking Number" value={trackingNumber} mono />}
      
      {trackingUrl && (
        <a
          href={trackingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--acc)] px-4 py-2.5 text-xs font-bold text-black transition hover:brightness-110"
        >
          Track Shipment ↗
        </a>
      )}

      {shippingStatus && <Field label="Shipping Status" value={shippingStatus} />}
      {estimatedDispatch && <Field label="Estimated Dispatch" value={estimatedDispatch} />}
      {estimatedDelivery && <Field label="Estimated Delivery" value={estimatedDelivery} />}
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--t3)]">{label}</p>
      <p className={`mt-0.5 text-[var(--t1)] font-medium ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}