import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/db/store-schema";

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/store/category/${category.slug}`}
      className="group relative overflow-hidden rounded-lg"
    >
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        {category.imageUrl ? (
          <Image
            src={category.imageUrl}
            alt={category.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            {category.name}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-lg font-semibold text-white">{category.name}</h3>
          {category.description && (
            <p className="mt-1 text-sm text-white/80 line-clamp-2">
              {category.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section>
      <h2 className="mb-6 text-2xl font-bold tracking-tight">
        Shop by Category
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
}
