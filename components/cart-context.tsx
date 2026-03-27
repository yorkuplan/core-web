"use client"

import React, { createContext, useContext, useReducer, useEffect, useRef, useState } from "react"

const CART_STORAGE_KEY = "yorkuplan-cart"

export interface CartItem {
  id: string
  courseCode: string
  courseName: string
  section: string
  instructor: string
  type: string
  typeLabel: string
  day: string
  time: string
  location: string
  term: string
}

interface CartState {
  items: CartItem[]
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      if (state.items.some((item) => item.id === action.payload.id)) {
        return state
      }
      return { items: [...state.items, action.payload] }
    }
    case "REMOVE_ITEM":
      return { items: state.items.filter((item) => item.id !== action.payload) }
    case "CLEAR_CART":
      return { items: [] }
    case "LOAD_CART":
      return { items: action.payload }
    default:
      return state
  }
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  clearCart: () => void
  isInCart: (id: string) => boolean
  itemCount: number
  isCartDockOpen: boolean
  setIsCartDockOpen: (open: boolean) => void
  canDock: boolean
  dockWidth: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })
  const [hasHydrated, setHasHydrated] = useState(false)
  const [isCartDockOpen, setIsCartDockOpen] = useState(false)
  const [canDock, setCanDock] = useState(false)
  const [dockWidth, setDockWidth] = useState(480)
  const itemsRef = useRef<CartItem[]>([])
  const syncChannelRef = useRef<BroadcastChannel | null>(null)
  const contextInstanceIdRef = useRef(`cart-${Date.now()}-${Math.random().toString(36).slice(2)}`)

  useEffect(() => {
    itemsRef.current = state.items
  }, [state.items])

  const areSameItems = (a: CartItem[], b: CartItem[]) => {
    if (a.length !== b.length) return false
    for (let index = 0; index < a.length; index++) {
      if (a[index].id !== b[index].id) return false
    }
    return true
  }

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          dispatch({ type: "LOAD_CART", payload: parsed })
        }
      }
    } catch {
      // ignore parse errors
    } finally {
      setHasHydrated(true)
    }
  }, [])

  // Sync cart in real-time across same-tab contexts (e.g., dock iframe and parent page).
  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return

    const channel = new BroadcastChannel("yorkuplan-cart-sync")
    syncChannelRef.current = channel

    const handleMessage = (event: MessageEvent) => {
      const payload = event.data as {
        type?: string
        sourceId?: string
        items?: CartItem[]
      } | null

      if (!payload || payload.type !== "CART_SYNC") return
      if (payload.sourceId === contextInstanceIdRef.current) return
      if (!Array.isArray(payload.items)) return

      if (!areSameItems(itemsRef.current, payload.items)) {
        dispatch({ type: "LOAD_CART", payload: payload.items })
      }
    }

    channel.addEventListener("message", handleMessage)
    return () => {
      channel.removeEventListener("message", handleMessage)
      channel.close()
      syncChannelRef.current = null
    }
  }, [])

  // Sync cart when changed from other tabs/windows/iframes
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) return
      if (event.key !== CART_STORAGE_KEY) return

      try {
        if (!event.newValue) {
          if (itemsRef.current.length > 0) {
            dispatch({ type: "LOAD_CART", payload: [] })
          }
          return
        }

        const parsed = JSON.parse(event.newValue)
        if (Array.isArray(parsed)) {
          if (!areSameItems(itemsRef.current, parsed)) {
            dispatch({ type: "LOAD_CART", payload: parsed })
          }
        }
      } catch {
        // ignore parse errors from external writers
      }
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  // Persist cart to localStorage on change
  useEffect(() => {
    if (!hasHydrated) return
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items))

    if (syncChannelRef.current) {
      syncChannelRef.current.postMessage({
        type: "CART_SYNC",
        sourceId: contextInstanceIdRef.current,
        items: state.items,
      })
    }
  }, [state.items, hasHydrated])

  // Update dock metrics on mount and resize
  useEffect(() => {
    if (typeof window === "undefined") return

    const updateDockMetrics = () => {
      const shouldDock = window.matchMedia("(min-width: 1024px), ((min-width: 768px) and (orientation: landscape))").matches
      const width = Math.min(560, Math.max(420, Math.round(window.innerWidth * 0.38)))
      setCanDock(shouldDock)
      setDockWidth(width)
      if (!shouldDock) {
        setIsCartDockOpen(false)
      }
    }

    updateDockMetrics()
    window.addEventListener("resize", updateDockMetrics)
    window.addEventListener("orientationchange", updateDockMetrics)
    return () => {
      window.removeEventListener("resize", updateDockMetrics)
      window.removeEventListener("orientationchange", updateDockMetrics)
    }
  }, [])

  const addItem = (item: CartItem) => dispatch({ type: "ADD_ITEM", payload: item })
  const removeItem = (id: string) => dispatch({ type: "REMOVE_ITEM", payload: id })
  const clearCart = () => dispatch({ type: "CLEAR_CART" })
  const isInCart = (id: string) => state.items.some((item) => item.id === id)

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addItem,
        removeItem,
        clearCart,
        isInCart,
        itemCount: state.items.length,
        isCartDockOpen,
        setIsCartDockOpen,
        canDock,
        dockWidth,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
