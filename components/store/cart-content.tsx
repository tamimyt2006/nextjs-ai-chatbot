"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "./cart-provider";
import { createCheckoutSession } from "@/app/(store)/actions";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

export function CartContent() {
  const { items, total, updateQuantity, removeItem, isPending } = useCart();
  const [isCheckingOut, startCheckout] = useTransition();

  const handleCheckout = () => {
    startCheckout(async () => {
      try {
        const checkoutUrl = await createCheckoutSession();
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        }
      } catch (error) {
        toast.error("Failed to create checkout session. Please try again.");
      }
    });
  };

  if (items.length === 0) {
    return (
      <div className="mt-12 flex flex-col items-center justify-center gap-6 py-12">
        <ShoppingBag className="h-16 w-16 text-muted-foreground" />
        <div className="text-center">
          <h2 className="text-xl font-semibold">Your cart is empty</h2>
          <p className="mt-2 text-muted-foreground">
            Looks like you haven&apos;t added anything to your cart yet.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/store">
            Continue Shopping
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  const subtotal = total;
  const shipping = subtotal >= 5000 ? 0 : 999; // Free shipping over $50
  const orderTotal = subtotal + shipping;

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-3">
      {/* Cart Items */}
      <div className="lg:col-span-2">
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex gap-4 p-4">
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                  {item.product.imageUrl ? (
                    <Image
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between">
                    <Link
                      href={`/store/product/${item.product.slug}`}
                      className="font-medium hover:underline"
                    >
                      {item.product.name}
                    </Link>
                    <span className="font-semibold">
                      {formatPrice(item.product.priceInCents * item.quantity)}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatPrice(item.product.priceInCents)} each
                  </span>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={isPending}
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={isPending}
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={isPending}
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6">
          <Button variant="outline" asChild>
            <Link href="/store">
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>

      {/* Order Summary */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>
                {shipping === 0 ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  formatPrice(shipping)
                )}
              </span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-muted-foreground">
                Free shipping on orders over $50
              </p>
            )}
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatPrice(orderTotal)}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              size="lg"
              disabled={isCheckingOut || isPending}
              onClick={handleCheckout}
            >
              {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
