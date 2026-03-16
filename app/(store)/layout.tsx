import { auth } from "@/app/(auth)/auth";
import { getCategories, getCartItems } from "@/lib/db/store-queries";
import { StoreHeader } from "@/components/store/store-header";
import { CartProvider } from "@/components/store/cart-provider";
import {
  addToCartAction,
  updateQuantityAction,
  removeFromCartAction,
} from "./actions";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, categories] = await Promise.all([auth(), getCategories()]);

  const cartItems = session?.user?.id
    ? await getCartItems(session.user.id)
    : [];

  const user = session?.user?.email ? { email: session.user.email } : null;

  return (
    <CartProvider
      initialItems={cartItems}
      addToCartAction={addToCartAction}
      updateQuantityAction={updateQuantityAction}
      removeFromCartAction={removeFromCartAction}
    >
      <div className="flex min-h-screen flex-col">
        <StoreHeader categories={categories} user={user} />
        <main className="flex-1">{children}</main>
        <footer className="border-t bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              <div>
                <h3 className="font-semibold">Shop</h3>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li>All Products</li>
                  <li>New Arrivals</li>
                  <li>Best Sellers</li>
                  <li>Sale</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold">Support</h3>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li>Contact Us</li>
                  <li>FAQs</li>
                  <li>Shipping Info</li>
                  <li>Returns</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold">Company</h3>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li>About Us</li>
                  <li>Careers</li>
                  <li>Press</li>
                  <li>Blog</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold">Legal</h3>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li>Privacy Policy</li>
                  <li>Terms of Service</li>
                  <li>Cookie Policy</li>
                </ul>
              </div>
            </div>
            <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
              <p>2026 Store. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </CartProvider>
  );
}
