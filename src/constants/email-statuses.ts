import type { OrderStatus } from "@/constants/order-statuses";

export interface EmailStatusContent {
  subject: string;
  headline: string;
  description: string;
  emoji: string;
}

const EMAIL_STATUS_CONTENT: Record<OrderStatus, EmailStatusContent> = {
  "Order Received": {
    subject: "We've Received Your Order",
    headline: "We've Received Your Order",
    description:
      "Thank you for choosing KeebForge. We've successfully received your order and our team will review it shortly. You'll receive another update once your order has been confirmed.",
    emoji: "📥",
  },
  "Order Confirmed": {
    subject: "Your Order Has Been Confirmed",
    headline: "Your Order Has Been Confirmed",
    description:
      "Your order has been confirmed and is now in our system. We'll begin preparing everything required for your build and keep you updated as it progresses.",
    emoji: "✅",
  },
  "Payment Pending": {
    subject: "Payment Pending — Awaiting Payment",
    headline: "Payment Pending",
    description:
      "We're waiting for payment confirmation before work can begin. Once payment has been received, we'll immediately move your order to the next stage.",
    emoji: "⏳",
  },
  "Payment Received": {
    subject: "Payment Received — Thank You!",
    headline: "Payment Received",
    description:
      "We've successfully received your payment. Your order is now ready to enter our production workflow, and we'll notify you when work begins.",
    emoji: "💰",
  },
  "Parts Booked": {
    subject: "Parts Booked — Sourcing Components",
    headline: "Parts Booked",
    description:
      "We've started sourcing the parts and components needed for your order. We'll update you once everything has been dispatched from our suppliers.",
    emoji: "🔧",
  },
  "Parts Shipped": {
    subject: "Parts Shipped — Components on the Way",
    headline: "Parts Shipped",
    description:
      "The components for your order have been dispatched from our suppliers and are on their way to our workshop.",
    emoji: "📦",
  },
  "Parts Received": {
    subject: "Parts Received — All Components Are In",
    headline: "Parts Received",
    description:
      "All required parts for your order have arrived safely. Our technicians will begin preparing your order for assembly.",
    emoji: "✅",
  },
  "In Queue": {
    subject: "Your Order Is In the Queue",
    headline: "Your Order Is In the Queue",
    description:
      "Your order has been added to the build queue. We'll begin work as soon as your turn comes up and will notify you once work starts.",
    emoji: "🎯",
  },
  "Work Started": {
    subject: "Work Has Started on Your Order",
    headline: "Work Has Started on Your Order",
    description:
      "Work on your order has officially begun. Our technicians are carefully assembling and preparing your product.",
    emoji: "⚡",
  },
  Testing: {
    subject: "Your Order Is Undergoing Quality Testing",
    headline: "Your Order Is Undergoing Quality Testing",
    description:
      "Your order is currently undergoing quality assurance and functional testing. We're verifying that everything meets our quality standards before moving to the next stage.",
    emoji: "🧪",
  },
  Completed: {
    subject: "Your Order Has Completed Testing",
    headline: "Your Order Has Completed Testing",
    description:
      "Your order has successfully passed all quality checks and is complete. We'll begin packing your product for shipment shortly.",
    emoji: "🏆",
  },
  Packing: {
    subject: "Your Order Is Being Packed",
    headline: "Your Order Is Being Packed",
    description:
      "Your order has successfully completed testing. We're carefully packing your product to ensure it arrives safely during shipping.",
    emoji: "📤",
  },
  "Shipment Booked": {
    subject: "Shipment Booked — Courier Confirmed",
    headline: "Shipment Booked",
    description:
      "Your shipment has been booked with our courier partner. We'll notify you again once the package has been picked up and begins its journey.",
    emoji: "🚚",
  },
  "Shipment Picked Up": {
    subject: "Shipment Picked Up — On Its Way!",
    headline: "Shipment Picked Up",
    description:
      "Your package has been collected by our courier partner and is now on its way. You can track its delivery using the tracking link provided.",
    emoji: "📬",
  },
  "In Transit": {
    subject: "Your Package Is In Transit",
    headline: "Your Package Is In Transit",
    description:
      "Your shipment is currently in transit and making its way to you. Keep an eye on the tracking for delivery updates.",
    emoji: "🚛",
  },
  Delivered: {
    subject: "Your Order Has Been Delivered",
    headline: "Your Order Has Been Delivered",
    description:
      "Your order has been delivered. We hope everything arrived safely and that you're happy with your purchase. If you need any assistance, our support team is always here to help.",
    emoji: "🎉",
  },
  "Testing Warranty Active": {
    subject: "Your Product Warranty Is Now Active",
    headline: "Your Product Warranty Is Now Active",
    description:
      "Your product has been delivered and your warranty is now active. We recommend thoroughly testing it to ensure everything is working as expected. If you notice any issues or suspect a fault, please contact our support team immediately. We'll be happy to assist you and resolve the problem as quickly as possible.",
    emoji: "🛡️",
  },
  "Order Completed": {
    subject: "Order Completed — Thank You for Choosing KeebForge!",
    headline: "Order Completed",
    description:
      "This order has been fully completed. Thank you for choosing KeebForge. We appreciate your trust and hope you enjoy your product. We'd love to build for you again!",
    emoji: "✨",
  },
};

export function getEmailStatusContent(
  status: string
): EmailStatusContent {
  return (
    EMAIL_STATUS_CONTENT[status as OrderStatus] ?? {
      subject: `Order Update — ${status}`,
      headline: status,
      description: `Your order status has been updated to "${status}".`,
      emoji: "📬",
    }
  );
}
