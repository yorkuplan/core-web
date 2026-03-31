"use client"

import { useEffect, useState } from "react"
import { useCart } from "@/components/cart-context"

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { isCartDockOpen, canDock, dockWidth } = useCart()
  const [isCoarsePointerDevice, setIsCoarsePointerDevice] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const mediaQuery = window.matchMedia("(hover: none) and (pointer: coarse)")
    const update = () => setIsCoarsePointerDevice(mediaQuery.matches)

    update()
    mediaQuery.addEventListener("change", update)
    return () => mediaQuery.removeEventListener("change", update)
  }, [])

  const shouldShiftForDock = isCartDockOpen && canDock && !isCoarsePointerDevice

  return (
    <div
      style={
        shouldShiftForDock
          ? { paddingRight: `${dockWidth}px`, transition: "padding-right 300ms ease-in-out" }
          : { transition: "padding-right 300ms ease-in-out" }
      }
    >
      {children}
    </div>
  )
}
