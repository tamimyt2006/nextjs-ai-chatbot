"use client";

import { ShoppingBag, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "./cart-provider";

interface AddToCartButtonProps {
  productId: string;
  inStock: boolean;
}

export function AddToCartButton({ productId, inStock }: AddToCartButtonProps) {
  const { addItem, isPending } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = async () => {
    await addItem(productId);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Button
      size="lg"
      className="w-full"
      disabled={!inStock || isPending}
      onClick={handleAddToCart}
    >
      {added ? (
        <>
          <Check className="mr-2 h-5 w-5" />
          Added to Cart
        </>
      ) : (
        <>
          <ShoppingBag className="mr-2 h-5 w-5" />
          {inStock ? "Add to Cart" : "Out of Stock"}
        </>
      )}
    </Button>
  );
}
