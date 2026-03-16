"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import {
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  getCartItems,
  createOrder,
} from "@/lib/db/store-queries";
import { stripe } from "@/lib/stripe";

export async function addToCartAction(productId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  await addToCart(session.user.id, productId, 1);
  revalidatePath("/store", "layout");
}

export async function updateQuantityAction(itemId: string, quantity: number) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  await updateCartItemQuantity(session.user.id, itemId, quantity);
  revalidatePath("/store", "layout");
}

export async function removeFromCartAction(itemId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  await removeFromCart(session.user.id, itemId);
  revalidatePath("/store", "layout");
}

export async function createCheckoutSession() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const cartItems = await getCartItems(session.user.id);

  if (cartItems.length === 0) {
    throw new Error("Cart is empty");
  }

  // Calculate total
  const totalInCents = cartItems.reduce(
    (sum, item) => sum + item.product.priceInCents * item.quantity,
    0
  );

  // Create line items for Stripe
  const lineItems = cartItems.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.product.name,
        description: item.product.description || undefined,
      },
      unit_amount: item.product.priceInCents,
    },
    quantity: item.quantity,
  }));

  // Create order in our database first
  const order = await createOrder(
    session.user.id,
    cartItems.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      priceInCents: item.product.priceInCents,
      name: item.product.name,
    })),
    totalInCents
  );

  // Create Stripe checkout session
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/store/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/store/cart`,
    metadata: {
      orderId: order.id,
      userId: session.user.id,
    },
  });

  // Clear the cart
  await clearCart(session.user.id);
  revalidatePath("/store", "layout");

  return checkoutSession.url;
}
