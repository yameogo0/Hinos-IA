'use client'

import { useState, useEffect } from 'react'

declare global {
  interface Window {
    Pi: any
  }
}

interface PiUser {
  uid: string
  username: string
  accessToken: string
}

interface Subscription {
  tier: string
  activatedAt: string
  expiresAt: string
  status: 'active' | 'expired' | 'cancelled'
}

export function usePiWallet() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<PiUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)

  // Vérifier l'abonnement actuel
  const checkSubscription = () => {
    const saved = localStorage.getItem('hinos_subscription')
    if (saved) {
      try {
        const sub = JSON.parse(saved)
        const now = new Date()
        const expires = new Date(sub.expiresAt)
        
        if (expires > now) {
          setSubscription({ ...sub, status: 'active' })
          return sub
        } else {
          localStorage.removeItem('hinos_subscription')
          setSubscription(null)
          return null
        }
      } catch (e) {
        console.error('Erreur chargement abonnement:', e)
      }
    }
    return null
  }

  // Connexion Pi Wallet
  const login = async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (typeof window !== 'undefined' && window.Pi) {
        const scopes = ['username', 'payments', 'wallet_address']
        
        const auth = await window.Pi.authenticate(scopes, (err: any) => {
          console.error('Erreur auth Pi:', err)
          setError(err?.message || 'Erreur d\'authentification')
        })
        
        if (auth && auth.user) {
          setUser({
            uid: auth.user.uid,
            username: auth.user.username,
            accessToken: auth.accessToken
          })
          setIsAuthenticated(true)
          localStorage.setItem('pi_user', JSON.stringify(auth.user))
          checkSubscription()
          return true
        }
      } else {
        // Mode démo
        console.log('Mode démo - Pas de Pi SDK')
        const demoUser = {
          uid: 'demo_' + Date.now(),
          username: 'demo_user',
          accessToken: 'demo_token'
        }
        setUser(demoUser)
        setIsAuthenticated(true)
        checkSubscription()
        return true
      }
    } catch (err: any) {
      console.error('Erreur:', err)
      setError(err.message)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Déconnexion
  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    setSubscription(null)
    localStorage.removeItem('pi_user')
    localStorage.removeItem('hinos_subscription')
  }

  // Traitement du paiement avec sauvegarde
  const processPayment = async (data: { amount: number; memo: string; metadata: { tier: string } }) => {
    setIsLoading(true)
    setError(null)
    
    console.log('💰 Traitement paiement:', data)
    
    // Simuler un délai de paiement (à remplacer par vrai SDK Pi)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Calculer la date d'expiration
    const now = new Date()
    let expiresAt = new Date()
    
    if (data.metadata.tier === 'pro') {
      expiresAt.setDate(now.getDate() + 7) // 7 jours Pro
    } else if (data.metadata.tier === 'premium') {
      expiresAt.setDate(now.getDate() + 30) // 30 jours Premium
    }
    
    // Sauvegarder l'abonnement
    const subscriptionData: Subscription = {
      tier: data.metadata.tier,
      activatedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'active'
    }
    
    localStorage.setItem('hinos_subscription', JSON.stringify(subscriptionData))
    setSubscription(subscriptionData)
    
    console.log('💰 Abonnement sauvegardé:', subscriptionData)
    
    setIsLoading(false)
    return { success: true, demo: true, subscription: subscriptionData }
  }

  // Vérifier si l'utilisateur a accès à une fonctionnalité Premium
  const hasPremiumAccess = () => {
    if (!subscription) return false
    const now = new Date()
    const expires = new Date(subscription.expiresAt)
    return subscription.status === 'active' && expires > now
  }

  // Obtenir le nom du tier actuel
  const getCurrentTier = () => {
    if (!subscription) return 'basic'
    return subscription.tier
  }

  // Temps restant avant expiration
  const getTimeRemaining = () => {
    if (!subscription) return null
    const now = new Date()
    const expires = new Date(subscription.expiresAt)
    const diff = expires.getTime() - now.getTime()
    
    if (diff <= 0) return null
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (86400000)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days} jour${days > 1 ? 's' : ''}`
    return `${hours} heure${hours > 1 ? 's' : ''}`
  }

  // Session persistante
  useEffect(() => {
    const savedUser = localStorage.getItem('pi_user')
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser)
        setUser(parsed)
        setIsAuthenticated(true)
      } catch (e) {
        console.error('Erreur chargement session:', e)
      }
    }
    checkSubscription()
    setIsLoading(false)
  }, [])

  return {
    isAuthenticated,
    user,
    isLoading,
    error,
    subscription,
    login,
    logout,
    processPayment,
    hasPremiumAccess,
    getCurrentTier,
    getTimeRemaining
  }
}
