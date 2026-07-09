# API Examples

## Create a Full Order

```bash
curl -X POST https://order.keebforge.in/api/orders \
  -H "Content-Type: application/json" \
  -b "supabase-auth-token=..." \
  -d '{
    "customer": {
      "name": "Rahul Sharma",
      "email": "rahul@example.com",
      "phone": "+91-9876543210",
      "discord_username": "rahul#1234"
    },
    "address": {
      "street_address": "42, BKC",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400051"
    },
    "service_type": "full_build",
    "products": [
      { "type": "keyboard", "name": "KBDFans 67 Lite", "sort_order": 0 },
      { "type": "keycap_set", "name": "GMK Botanical", "sort_order": 1 },
      { "type": "switch", "name": "Gateron Milky Yellows (x70)", "sort_order": 2 }
    ],
    "services": [
      { "service_id": "full_assembly", "quantity": 1 },
      { "service_id": "soldering", "quantity": 1 },
      { "service_id": "stabilizer_tuning", "quantity": 1 }
    ],
    "billing_details": {
      "extraCharges": [{ "label": "Express shipping", "amount": 500 }],
      "flatDiscount": 1000,
      "percentageDiscount": 0,
      "taxPercentage": 18
    },
    "shipping_info": {
      "shipping_cost": 150,
      "packaging_cost": 100,
      "estimated_dispatch_date": "2026-07-20",
      "estimated_delivery_date": "2026-07-25"
    },
    "payment": {
      "payment_status": "partial",
      "amount_paid": 15000
    },
    "customer_message": "Please use a smoke-colored case if available",
    "admin_customer_notes": [
      { "text": "Customer prefers tactile switches" }
    ],
    "admin_internal_notes": [
      { "text": "Loyal customer — priority queue" }
    ]
  }'
```

**Response:**

```json
{
  "success": true,
  "order": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "order_number": "KF-7X9M2K",
    "customer_id": "550e8400-e29b-41d4-a716-446655440001",
    "address_id": "550e8400-e29b-41d4-a716-446655440002"
  }
}
```

## Update Order Status

```bash
curl -X PATCH https://order.keebforge.in/api/orders/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -b "supabase-auth-token=..." \
  -d '{
    "current_status": "quality_check"
  }'
```

**Response:**

```json
{
  "success": true,
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Add Timeline Entry

```bash
curl -X POST https://order.keebforge.in/api/orders/550e8400-e29b-41d4-a716-446655440000/timeline \
  -H "Content-Type: application/json" \
  -b "supabase-auth-token=..." \
  -d '{
    "status": "quality_check",
    "note": "All switches passed sound test"
  }'
```

**Response:**

```json
{
  "success": true
}
```

## Update Billing

```bash
curl -X PATCH https://order.keebforge.in/api/orders/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -b "supabase-auth-token=..." \
  -d '{
    "billing_details": {
      "extraCharges": [{ "label": "Rush fee", "amount": 500 }],
      "flatDiscount": 500,
      "percentageDiscount": 5,
      "taxPercentage": 18
    },
    "payment": {
      "payment_status": "paid",
      "amount_paid": 25000
    }
  }'
```

## Soft-Delete Order

```bash
curl -X DELETE https://order.keebforge.in/api/orders/550e8400-e29b-41d4-a716-446655440000 \
  -b "supabase-auth-token=..."
```

**Response:**

```json
{
  "success": true,
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Error Example

```bash
curl -X POST https://order.keebforge.in/api/orders \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response (401):**

```json
{
  "success": false,
  "error": "Unauthorized"
}
```
