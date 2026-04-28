"use client"

import { useState, useEffect } from "react"

export type SubscriptionTier = "free" | "weekly" | "monthly"

interface SubscriptionData {
  tier: SubscriptionTier
  requestsUsed: number
  requestsLimit: number
  expiresAt: number | null // timestamp ms
}

const LIMITS: Record<SubscriptionTier, number> = {
  free: 10,
  weekly: -1,
  monthly: -1,
}

const STORAGE_KEY = "hinos_sub_v2"

const defaultSub: SubscriptionData = {
  tier: "free",
  requestsUsed: 0,
  requestsLimit: 10,
  expiresAt: null,
}

export function useSubscriptionSimple() {
  const [subscription, setSubscription] = useState<SubscriptionData>(defaultSub)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed: SubscriptionData = JSON.parse(raw)

      // If paid plan expired, revert to free
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        const reset: SubscriptionData = { ...defaultSub }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reset))
        setSubscription(reset)
        return
      }

      setSubscription(parsed)
    } catch {
      // Corrupt data — reset silently
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const persist = (data: SubscriptionData) => {
    setSubscription(data)
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    }
  }

  const canMakeRequest = (): boolean => {
    if (!mounted) return true
    if (subscription.requestsLimit === -1) return true
    return subscription.requestsUsed < subscription.requestsLimit
  }

  const incrementRequests = () => {
    if (subscription.requestsLimit === -1) return
    persist({ ...subscription, requestsUsed: subscription.requestsUsed + 1 })
  }

  const updateTier = (tier: SubscriptionTier, paymentId?: string) => {
    const durationMs =
      tier === "weekly"
        ? 7 * 24 * 60 * 60 * 1000
        : tier === "monthly"
        ? 30 * 24 * 60 * 60 * 1000
        : null

    persist({
      tier,
      requestsUsed: 0,
      requestsLimit: LIMITS[tier],
      expiresAt: durationMs ? Date.now() + durationMs : null,
    })
  }

  const remainingRequests =
    subscription.requestsLimit === -1
      ? -1
      : Math.max(0, subscription.requestsLimit - subscription.requestsUsed)

  return {
    subscription,
    canMakeRequest,
    incrementRequests,
    updateTier,
    remainingRequests,
  }
}
