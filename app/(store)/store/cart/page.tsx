import type { Metadata } from "next";
import { CartContent } from "@/components/store/cart-content";

export const metadata: Metadata = {
  title: "Shopping Cart - Store",
  description: "Review your shopping cart and proceed to checkout.",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
      <CartContent />
    </div>
  );
}
