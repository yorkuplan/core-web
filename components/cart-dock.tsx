"use client"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useCart } from "@/components/cart-context"

export function CartDock() {
  const { isCartDockOpen, setIsCartDockOpen, canDock, dockWidth } = useCart()

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
        <div className="flex-1 min-h-0">
          <iframe
            src="/cart?embed=1"
            title="Cart"
            className="w-full h-full border-0"
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
