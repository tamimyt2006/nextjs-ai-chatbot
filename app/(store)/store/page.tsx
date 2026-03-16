import type { Metadata } from "next";
import { getProducts, getCategories, getFeaturedProducts } from "@/lib/db/store-queries";
import { HeroSection } from "@/components/store/hero-section";
import { ProductGrid } from "@/components/store/product-grid";
import { CategoryGrid } from "@/components/store/category-card";

export const metadata: Metadata = {
  title: "Store - Shop the Latest Products",
  description:
    "Discover our curated collection of electronics, clothing, accessories, and home goods.",
};

export default async function StorePage() {
  const [featuredProducts, categories, allProducts] = await Promise.all([
    getFeaturedProducts(4),
    getCategories(),
    getProducts({ limit: 8 }),
  ]);

  return (
    <div>
      <HeroSection />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-16">
          {/* Featured Products */}
          {featuredProducts.length > 0 && (
            <ProductGrid products={featuredProducts} title="Featured Products" />
          )}

          {/* Categories */}
          {categories.length > 0 && <CategoryGrid categories={categories} />}

          {/* All Products */}
          <ProductGrid products={allProducts} title="New Arrivals" />
        </div>
      </div>
    </div>
  );
}
