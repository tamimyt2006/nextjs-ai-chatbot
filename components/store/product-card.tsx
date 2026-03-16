"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/db/store-schema";
import { useCart } from "./cart-provider";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, isPending } = useCart();

  const hasDiscount =
    product.compareAtPriceInCents &&
    product.compareAtPriceInCents > product.priceInCents;

  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.compareAtPriceInCents! - product.priceInCents) /
          product.compareAtPriceInCents!) *
          100
      )
    : 0;

  return (
    <Card className="group overflow-hidden border-0 shadow-none">
      <Link href={`/store/product/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
          {hasDiscount && (
            <Badge
              variant="destructive"
              className="absolute left-2 top-2"
            >
              -{discountPercentage}%
            </Badge>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <Badge variant="secondary">Out of Stock</Badge>
            </div>
          )}
        </div>
      </Link>
      <CardContent className="px-0 pt-4">
        <Link href={`/store/product/${product.slug}`}>
          <h3 className="font-medium leading-tight text-foreground hover:underline">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <span className="font-semibold">
            {formatPrice(product.priceInCents)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.compareAtPriceInCents!)}
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-3 w-full"
          disabled={!product.inStock || isPending}
          onClick={() => addItem(product.id)}
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
}
