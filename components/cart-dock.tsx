"use client"

import { useEffect, useRef } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useCart } from "@/components/cart-context"
import { CartPageContent } from "@/app/cart/page"

export function CartDock() {
  const { isCartDockOpen, setIsCartDockOpen, canDock, dockWidth, itemCount } = useCart()
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const previousItemCountRef = useRef(itemCount)

  useEffect(() => {
    const previousCount = previousItemCountRef.current
    if (previousCount === 0 && itemCount > 0) {
      scrollContainerRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" })
    }
    previousItemCountRef.current = itemCount
  }, [itemCount])

  return (
    <Sheet open={isCartDockOpen} onOpenChange={setIsCartDockOpen} modal={false}>
      <SheetContent
        side="right"
        showOverlay={false}
        className="w-[92vw] sm:max-w-140 p-0 gap-0"
        style={canDock ? { width: `${dockWidth}px`, maxWidth: `${dockWidth}px` } : undefined}
        onPointerDownOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <SheetHeader className="border-b border-border px-4 py-3">
          <div className="flex items-center justify-between gap-3 pr-8">
            <div>
              <SheetTitle>Your Cart</SheetTitle>
              <SheetDescription>
                Manage your selected courses.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>
        <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto">
          <CartPageContent forcedEmbeddedMode />
        </div>
      </SheetContent>
    </Sheet>
  )
}
