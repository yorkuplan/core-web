"use client"

import { useCart } from "@/components/cart-context"

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { isCartDockOpen, canDock, dockWidth } = useCart()

  return (
    <div
      style={
        isCartDockOpen && canDock
          ? { paddingRight: `${dockWidth}px`, transition: "padding-right 300ms ease-in-out" }
          : { transition: "padding-right 300ms ease-in-out" }
      }
    >
      {children}
    </div>
  )
}
