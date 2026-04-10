"use client"

import { useEffect, useRef, useState } from "react"
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
  const {
    isCartDockOpen,
    setIsCartDockOpen,
    canDock,
    canResizeDock,
    dockWidth,
    dockMinWidth,
    dockMaxWidth,
    setDockWidth,
    setIsDockResizing,
    itemCount,
  } = useCart()
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const previousItemCountRef = useRef(itemCount)
  const [isCoarsePointerDevice, setIsCoarsePointerDevice] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const allowOutsideDismiss = !canDock || isCoarsePointerDevice
  const shouldBlockOutsideDismiss = canDock && !allowOutsideDismiss

  useEffect(() => {
    if (typeof window === "undefined") return

    const mediaQuery = window.matchMedia("(hover: none) and (pointer: coarse)")
    const update = () => setIsCoarsePointerDevice(mediaQuery.matches)

    update()
    mediaQuery.addEventListener("change", update)
    return () => mediaQuery.removeEventListener("change", update)
  }, [])

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

  useEffect(() => {
    setIsDockResizing(isResizing)
    return () => setIsDockResizing(false)
  }, [isResizing, setIsDockResizing])

  const resizeDockFromPointer = (clientX: number) => {
    const nextWidth = window.innerWidth - clientX
    setDockWidth(nextWidth)
  }

  const handleResizeStart = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!canResizeDock) return

    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    setIsResizing(true)

    const previousCursor = document.body.style.cursor
    const previousUserSelect = document.body.style.userSelect
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"

    const stopResize = () => {
      setIsResizing(false)
      document.body.style.cursor = previousCursor
      document.body.style.userSelect = previousUserSelect
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", onPointerUp)
      window.removeEventListener("pointercancel", onPointerUp)
    }

    const onPointerMove = (moveEvent: PointerEvent) => {
      resizeDockFromPointer(moveEvent.clientX)
    }

    const onPointerUp = () => {
      stopResize()
    }

    window.addEventListener("pointermove", onPointerMove)
    window.addEventListener("pointerup", onPointerUp)
    window.addEventListener("pointercancel", onPointerUp)
  }

  const handleResizeKeyboard = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!canResizeDock) return

    const step = event.shiftKey ? 48 : 24
    if (event.key === "ArrowLeft") {
      event.preventDefault()
      setDockWidth(dockWidth + step)
    }
    if (event.key === "ArrowRight") {
      event.preventDefault()
      setDockWidth(dockWidth - step)
    }
    if (event.key === "Home") {
      event.preventDefault()
      setDockWidth(dockMaxWidth)
    }
    if (event.key === "End") {
      event.preventDefault()
      setDockWidth(dockMinWidth)
    }
  }

  return (
    <Sheet open={isCartDockOpen} onOpenChange={setIsCartDockOpen} modal={allowOutsideDismiss}>
      <SheetContent
        side="right"
        showOverlay={allowOutsideDismiss}
        overlayClassName="bg-background/0 backdrop-blur-none transition-[opacity,backdrop-filter,background-color] duration-300 ease-out data-[state=open]:bg-background/20 data-[state=open]:backdrop-blur-sm"
        className="w-[90vw] sm:max-w-140 p-0 gap-0"
        style={canDock ? { width: `${dockWidth}px`, maxWidth: `${dockWidth}px` } : undefined}
        onPointerDownOutside={shouldBlockOutsideDismiss ? (event) => event.preventDefault() : undefined}
        onInteractOutside={shouldBlockOutsideDismiss ? (event) => event.preventDefault() : undefined}
      >
        {canResizeDock && (
          <div
            role="separator"
            aria-label="Resize cart dock"
            aria-orientation="vertical"
            aria-valuemin={dockMinWidth}
            aria-valuemax={dockMaxWidth}
            aria-valuenow={dockWidth}
            tabIndex={0}
            className="group absolute inset-y-0 -left-2 z-20 w-4 cursor-col-resize touch-none outline-none"
            onPointerDown={handleResizeStart}
            onKeyDown={handleResizeKeyboard}
          >
            <div
              className={`absolute inset-y-0 left-1/2 -translate-x-1/2 border-l-2 transition-colors ${
                isResizing ? "border-primary" : "border-border/85 group-hover:border-primary/85 group-focus-visible:border-primary"
              }`}
            />
            <div
              className={`absolute left-1/2 top-1/2 h-20 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border shadow-sm transition-all ${
                isResizing
                  ? "border-primary/70 bg-primary/30 ring-2 ring-primary/30"
                  : "border-border/80 bg-background/95 group-hover:border-primary/60 group-hover:bg-primary/10 group-focus-visible:border-primary group-focus-visible:bg-primary/15"
              }`}
            />
            <div className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-1">
              <span className="h-1 w-1 rounded-full bg-muted-foreground/70" />
              <span className="h-1 w-1 rounded-full bg-muted-foreground/70" />
              <span className="h-1 w-1 rounded-full bg-muted-foreground/70" />
            </div>
          </div>
        )}
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
