"use client"

import { useCart } from "@/components/cart-context"

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { isCartDockOpen, canDock } = useCart()

  return (
    <div
      style={{ transition: isCartDockOpen && canDock ? "filter 300ms ease-in-out" : undefined }}
    >
      {children}
    </div>
  )
}
