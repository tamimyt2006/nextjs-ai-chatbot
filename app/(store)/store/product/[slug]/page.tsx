import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Truck } from "lucide-react";
import { getProductBySlug, getProducts, getCategoryBySlug } from "@/lib/db/store-queries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductGrid } from "@/components/store/product-grid";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { formatPrice } from "@/lib/utils";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: `${product.name} - Store`,
    description: product.description || `Buy ${product.name}`,
    openGraph: {
      images: product.imageUrl ? [product.imageUrl] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [category, relatedProducts] = await Promise.all([
    product.categoryId ? getCategoryBySlug(product.categoryId) : null,
    getProducts({ categoryId: product.categoryId || undefined, limit: 4 }),
  ]);

  const filteredRelated = relatedProducts.filter((p) => p.id !== product.id);

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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/store">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Store
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No image available
            </div>
          )}
          {hasDiscount && (
            <Badge variant="destructive" className="absolute left-4 top-4">
              -{discountPercentage}% OFF
            </Badge>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          {category && (
            <Link
              href={`/store/category/${category.slug}`}
              className="text-sm font-medium text-muted-foreground hover:text-primary"
            >
              {category.name}
            </Link>
          )}

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            {product.name}
          </h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold">
              {formatPrice(product.priceInCents)}
            </span>
            {hasDiscount && (
              <span className="text-xl text-muted-foreground line-through">
                {formatPrice(product.compareAtPriceInCents!)}
              </span>
            )}
          </div>

          <Separator className="my-6" />

          {product.description && (
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <p>{product.description}</p>
            </div>
          )}

          <div className="mt-6 space-y-4">
            {/* Stock status */}
            <div className="flex items-center gap-2">
              {product.inStock ? (
                <>
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-green-600">In Stock</span>
                  {product.stockQuantity && product.stockQuantity < 10 && (
                    <span className="text-sm text-muted-foreground">
                      (Only {product.stockQuantity} left)
                    </span>
                  )}
                </>
              ) : (
                <Badge variant="secondary">Out of Stock</Badge>
              )}
            </div>

            {/* Shipping info */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Truck className="h-4 w-4" />
              <span>Free shipping on orders over $50</span>
            </div>
          </div>

          <div className="mt-8">
            <AddToCartButton
              productId={product.id}
              inStock={product.inStock ?? true}
            />
          </div>

          <Separator className="my-8" />

          {/* Product details */}
          <div className="space-y-4">
            <h3 className="font-semibold">Product Details</h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">SKU</dt>
                <dd className="font-medium">{product.slug.toUpperCase()}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Category</dt>
                <dd className="font-medium">{category?.name || "Uncategorized"}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {filteredRelated.length > 0 && (
        <div className="mt-16">
          <ProductGrid products={filteredRelated} title="You May Also Like" />
        </div>
      )}
    </div>
  );
}
