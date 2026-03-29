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
  const isMobileSheet = !canDock

  useEffect(() => {
    const previousCount = previousItemCountRef.current
    if (previousCount === 0 && itemCount > 0) {
      scrollContainerRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" })
    }
    previousItemCountRef.current = itemCount
  }, [itemCount])

  useEffect(() => {
    if (!isCartDockOpen) return

    scrollContainerRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" })
    let rafB: number | null = null
    const rafA = requestAnimationFrame(() => {
      scrollContainerRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" })
      rafB = requestAnimationFrame(() => {
        scrollContainerRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" })
      })
    })

    const timer = window.setTimeout(() => {
      scrollContainerRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" })
    }, 140)

    return () => {
      cancelAnimationFrame(rafA)
      if (rafB !== null) {
        cancelAnimationFrame(rafB)
      }
      window.clearTimeout(timer)
    }
  }, [isCartDockOpen])

  return (
    <Sheet open={isCartDockOpen} onOpenChange={setIsCartDockOpen} modal={isMobileSheet}>
      <SheetContent
        side="right"
        showOverlay={isMobileSheet}
        overlayClassName="bg-background/0 backdrop-blur-none transition-[opacity,backdrop-filter,background-color] duration-300 ease-out data-[state=open]:bg-background/20 data-[state=open]:backdrop-blur-sm"
        className="w-[90vw] sm:max-w-140 p-0 gap-0"
        style={canDock ? { width: `${dockWidth}px`, maxWidth: `${dockWidth}px` } : undefined}
        onPointerDownOutside={canDock ? (event) => event.preventDefault() : undefined}
        onInteractOutside={canDock ? (event) => event.preventDefault() : undefined}
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
