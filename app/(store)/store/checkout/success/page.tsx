import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { stripe } from "@/lib/stripe";
import { updateOrderStatus, getOrderByStripeSessionId } from "@/lib/db/store-queries";

export const metadata: Metadata = {
  title: "Order Confirmed - Store",
  description: "Your order has been placed successfully.",
};

interface CheckoutSuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const { session_id } = await searchParams;

  let orderDetails = null;

  if (session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);

      if (session.payment_status === "paid" && session.metadata?.orderId) {
        // Update order status
        await updateOrderStatus(
          session.metadata.orderId,
          "completed",
          session.payment_intent as string
        );

        orderDetails = {
          orderId: session.metadata.orderId,
          amount: session.amount_total,
          email: session.customer_details?.email,
        };
      }
    } catch (error) {
      console.error("Error retrieving session:", error);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6 lg:px-8">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Thank you for your purchase. Your order has been placed successfully.
          </p>
          {orderDetails && (
            <div className="rounded-lg bg-muted p-4 text-left text-sm">
              <p>
                <span className="font-medium">Order ID:</span>{" "}
                {orderDetails.orderId.slice(0, 8).toUpperCase()}
              </p>
              {orderDetails.email && (
                <p className="mt-1">
                  <span className="font-medium">Confirmation sent to:</span>{" "}
                  {orderDetails.email}
                </p>
              )}
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            You will receive an email confirmation with your order details and tracking
            information once your order ships.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link href="/store">Continue Shopping</Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/store/account">View Orders</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
