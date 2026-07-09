# Order Statuses

## Full Status List

| Status Key | Label | Phase | Description |
|-----------|-------|-------|-------------|
| `order_received` | Order Received | Intake | Order has been created in the system |
| `in_queue` | In Queue | Intake | Order is queued for processing |
| `parts_arranging` | Parts Arranging | Production | Parts are being sourced/arranged |
| `build_in_progress` | Build In Progress | Production | Active build/assembly underway |
| `quality_check` | Quality Check | Production | Undergoing quality assurance |
| `photography` | Photography | Production | Final product photos being taken |
| `packing` | Packing | Production | Order being packed for shipping |
| `shipped` | Shipped | Fulfillment | Dispatched via courier |
| `delivered` | Delivered | Fulfillment | Confirmed delivered |
| `order_completed` | Order Completed | Complete | Order lifecycle complete |
| `on_hold` | On Hold | Hold | Order temporarily paused |
| `cancelled` | Cancelled | Complete | Order cancelled |
| `warranty_active` | Warranty Active | Warranty | Under warranty period |
| `warranty_claimed` | Warranty Claimed | Warranty | Warranty claim filed |
| `warranty_completed` | Warranty Completed | Warranty | Warranty service completed |
| `warranty_expired` | Warranty Expired | Warranty | Warranty period ended |

## Progress Indicator

The tracking page groups statuses into the following phases for the progress bar:

```
Order Received → In Queue → Parts Arranging → Build In Progress →
Quality Check → Photography → Packing → Shipped → Delivered →
Order Completed
```

Each phase represents ~10% progress. Non-linear statuses (On Hold, Cancelled, Warranty) are shown as badges rather than progress steps.

## Color Coding

Statuses have semantic colors:

| Phase | Color |
|-------|-------|
| Intake | Blue |
| Production | Amber/Orange |
| Fulfillment | Green |
| Complete | Emerald |
| Hold | Yellow |
| Cancelled | Red |
| Warranty | Purple |
