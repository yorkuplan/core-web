"use client"

import { Backpack } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart-context"

export function CartButton() {
  const { itemCount, isCartDockOpen, setIsCartDockOpen } = useCart()

  const handleClick = () => {
    setIsCartDockOpen(!isCartDockOpen)
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-9 w-9 relative"
      onClick={handleClick}
    >
      <Backpack className="h-4 w-4" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
      <span className="sr-only">View cart ({itemCount} items)</span>
    </Button>
  )
}
