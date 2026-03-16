import type { Product } from "@/lib/db/store-schema";
import { ProductCard } from "./product-card";

interface ProductGridProps {
  products: Product[];
  title?: string;
  emptyMessage?: string;
}

export function ProductGrid({
  products,
  title,
  emptyMessage = "No products found.",
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <section>
      {title && (
        <h2 className="mb-6 text-2xl font-bold tracking-tight">{title}</h2>
      )}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
