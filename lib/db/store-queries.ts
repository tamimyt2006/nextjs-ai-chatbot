import "server-only";

import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  category,
  product,
  cartItem,
  order,
  orderItem,
  type Category,
  type Product,
  type CartItem,
  type Order,
  type OrderItem,
} from "./store-schema";

const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

// Categories
export async function getCategories(): Promise<Category[]> {
  return await db.select().from(category).orderBy(category.name);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const [result] = await db
    .select()
    .from(category)
    .where(eq(category.slug, slug))
    .limit(1);
  return result || null;
}

// Products
export async function getProducts(options?: {
  categoryId?: string;
  featured?: boolean;
  limit?: number;
}): Promise<Product[]> {
  let query = db.select().from(product);

  const conditions = [];
  if (options?.categoryId) {
    conditions.push(eq(product.categoryId, options.categoryId));
  }
  if (options?.featured !== undefined) {
    conditions.push(eq(product.featured, options.featured));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }

  query = query.orderBy(desc(product.createdAt)) as typeof query;

  if (options?.limit) {
    query = query.limit(options.limit) as typeof query;
  }

  return await query;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const [result] = await db
    .select()
    .from(product)
    .where(eq(product.slug, slug))
    .limit(1);
  return result || null;
}

export async function getProductById(id: string): Promise<Product | null> {
  const [result] = await db
    .select()
    .from(product)
    .where(eq(product.id, id))
    .limit(1);
  return result || null;
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  return await db
    .select()
    .from(product)
    .where(eq(product.featured, true))
    .orderBy(desc(product.createdAt))
    .limit(limit);
}

export async function searchProducts(query: string): Promise<Product[]> {
  return await db
    .select()
    .from(product)
    .where(
      sql`${product.name} ILIKE ${"%" + query + "%"} OR ${product.description} ILIKE ${"%" + query + "%"}`
    )
    .orderBy(desc(product.createdAt))
    .limit(20);
}

// Cart
export async function getCartItems(userId: string): Promise<
  (CartItem & { product: Product })[]
> {
  const items = await db
    .select({
      cartItem: cartItem,
      product: product,
    })
    .from(cartItem)
    .innerJoin(product, eq(cartItem.productId, product.id))
    .where(eq(cartItem.userId, userId))
    .orderBy(desc(cartItem.createdAt));

  return items.map((item) => ({
    ...item.cartItem,
    product: item.product,
  }));
}

export async function getCartItemCount(userId: string): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`COALESCE(SUM(${cartItem.quantity}), 0)::int` })
    .from(cartItem)
    .where(eq(cartItem.userId, userId));
  return result?.count || 0;
}

export async function addToCart(
  userId: string,
  productId: string,
  quantity = 1
): Promise<CartItem> {
  const [existingItem] = await db
    .select()
    .from(cartItem)
    .where(and(eq(cartItem.userId, userId), eq(cartItem.productId, productId)))
    .limit(1);

  if (existingItem) {
    const [updated] = await db
      .update(cartItem)
      .set({
        quantity: existingItem.quantity + quantity,
        updatedAt: new Date(),
      })
      .where(eq(cartItem.id, existingItem.id))
      .returning();
    return updated;
  }

  const [newItem] = await db
    .insert(cartItem)
    .values({
      userId,
      productId,
      quantity,
    })
    .returning();
  return newItem;
}

export async function updateCartItemQuantity(
  userId: string,
  itemId: string,
  quantity: number
): Promise<CartItem | null> {
  if (quantity <= 0) {
    await db
      .delete(cartItem)
      .where(and(eq(cartItem.id, itemId), eq(cartItem.userId, userId)));
    return null;
  }

  const [updated] = await db
    .update(cartItem)
    .set({ quantity, updatedAt: new Date() })
    .where(and(eq(cartItem.id, itemId), eq(cartItem.userId, userId)))
    .returning();
  return updated;
}

export async function removeFromCart(
  userId: string,
  itemId: string
): Promise<void> {
  await db
    .delete(cartItem)
    .where(and(eq(cartItem.id, itemId), eq(cartItem.userId, userId)));
}

export async function clearCart(userId: string): Promise<void> {
  await db.delete(cartItem).where(eq(cartItem.userId, userId));
}

// Orders
export async function createOrder(
  userId: string,
  items: { productId: string; quantity: number; priceInCents: number; name: string }[],
  totalInCents: number,
  stripeCheckoutSessionId?: string
): Promise<Order> {
  const [newOrder] = await db
    .insert(order)
    .values({
      userId,
      totalInCents,
      stripeCheckoutSessionId,
      status: "pending",
    })
    .returning();

  await db.insert(orderItem).values(
    items.map((item) => ({
      orderId: newOrder.id,
      productId: item.productId,
      productName: item.name,
      productPriceInCents: item.priceInCents,
      quantity: item.quantity,
    }))
  );

  return newOrder;
}

export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  return await db
    .select()
    .from(order)
    .where(eq(order.userId, userId))
    .orderBy(desc(order.createdAt));
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const [result] = await db
    .select()
    .from(order)
    .where(eq(order.id, orderId))
    .limit(1);
  return result || null;
}

export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  return await db
    .select()
    .from(orderItem)
    .where(eq(orderItem.orderId, orderId));
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
  stripePaymentIntentId?: string
): Promise<Order | null> {
  const updateData: Partial<Order> = {
    status,
    updatedAt: new Date(),
  };
  if (stripePaymentIntentId) {
    updateData.stripePaymentIntentId = stripePaymentIntentId;
  }

  const [updated] = await db
    .update(order)
    .set(updateData)
    .where(eq(order.id, orderId))
    .returning();
  return updated || null;
}

export async function getOrderByStripeSessionId(
  sessionId: string
): Promise<Order | null> {
  const [result] = await db
    .select()
    .from(order)
    .where(eq(order.stripeCheckoutSessionId, sessionId))
    .limit(1);
  return result || null;
}
