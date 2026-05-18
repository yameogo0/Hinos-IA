'use client'

import { useState, useRef, useEffect } from 'react'
import LanguageSelector from './LanguageSelector'
import { Crown, Loader2 } from 'lucide-react'
import { usePiWallet } from '@/hooks/use-pi-wallet'

type Language = 'fr' | 'pt' | 'en'

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  isTyping?: boolean
}

const welcomeMessages: Record<Language, string> = {
  fr: "🌍 Bonjour ! Je suis Hinos AI, votre assistant intelligent spécialisé en agriculture, élevage, pisciculture et transformation alimentaire.\n\nIndiquez-moi votre **pays** (Burkina Faso, Angola) pour des conseils adaptés !",
  pt: "🌍 Olá! Sou Hinos AI, seu assistente inteligente especializado em agricultura, pecuária, piscicultura e transformação de alimentos.\n\nDiga-me seu **país** (Burkina Faso, Angola) para conselhos adaptados!",
  en: "🌍 Hello! I am Hinos AI, your intelligent assistant specialized in agriculture, livestock, fish farming and food processing.\n\nTell me your **country** (Burkina Faso, Angola) for tailored advice!"
}

const placeholders: Record<Language, string> = {
  fr: "Posez votre question sur l'agriculture, l'élevage...",
  pt: "Faça sua pergunta sobre agricultura, pecuária...",
  en: "Ask your question about agriculture, livestock..."
}

const suggestions: Record<Language, string[]> = {
  fr: ["🌾 Agriculture à Bama", "🐄 Élevage au Burkina", "🐟 Pisciculture Angola", "💰 Voir les abonnements"],
  pt: ["🌾 Agricultura em Bama", "🐄 Pecuária em Burkina", "🐟 Piscicultura Angola", "💰 Ver assinaturas"],
  en: ["🌾 Agriculture in Bama", "🐄 Livestock in Burkina", "🐟 Fish farming Angola", "💰 View subscriptions"]
}

export default function Chatbot() {
  const [language, setLanguage] = useState<Language>('fr')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: welcomeMessages.fr,
      sender: 'ai',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSubscription, setShowSubscription] = useState(false)
  const [processingPlan, setProcessingPlan] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<{ type: string; message: string } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Pi Wallet hook avec abonnement
  const { 
    isAuthenticated, 
    user, 
    login, 
    processPayment, 
    isLoading: piLoading,
    subscription,
    hasPremiumAccess,
    getCurrentTier,
    getTimeRemaining
  } = usePiWallet()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang)
    setMessages(prev => {
      const newMessages = [...prev]
      if (newMessages[0] && newMessages[0].sender === 'ai') {
        newMessages[0].text = welcomeMessages[newLang]
      }
      return newMessages
    })
  }

  // Fonction pour obtenir le label du tier avec icône
  const getTierLabel = () => {
    const tier = getCurrentTier()
    if (tier === 'pro') return '⭐ Pro'
    if (tier === 'premium') return '👑 Premium'
    return '🔓 Basic'
  }

  // Fonction de paiement avec sauvegarde
  const handlePiPayment = async (planId: string, name: string, amount: number) => {
    console.log("💰 1. handlePiPayment appelée", { planId, name, amount })
    
    setProcessingPlan(planId)
    setPaymentStatus({ type: 'info', message: '🔄 Connexion à Pi Wallet...' })
    
    if (!isAuthenticated) {
      console.log("💰 2. Non authentifié, tentative de login...")
      setPaymentStatus({ type: 'info', message: '🔑 Connexion à Pi Wallet...' })
      
      const loggedIn = await login()
      console.log("💰 3. Résultat login:", loggedIn)
      
      if (!loggedIn) {
        setPaymentStatus({ type: 'error', message: '❌ Échec de connexion' })
        setProcessingPlan(null)
        return
      }
    }
    
    console.log("💰 4. Authentifié, traitement du paiement...")
    setPaymentStatus({ type: 'info', message: '💳 Traitement du paiement...' })
    
    const result = await processPayment({
      amount: amount,
      memo: `Hinos IA - ${name}`,
      metadata: { tier: planId }
    })
    
    console.log("💰 5. Résultat paiement:", result)
    
    if (result.success) {
      setPaymentStatus({ type: 'success', message: `✅ ${name} activé avec succès !` })
      
      const successMessage: Message = {
        id: Date.now().toString(),
        text: `🎉 Félicitations ! Votre abonnement ${name} a été activé.`,
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, successMessage])
      setTimeout(() => setShowSubscription(false), 2000)
    } else {
      setPaymentStatus({ type: 'error', message: result.error || '❌ Erreur de paiement' })
    }
    
    setProcessingPlan(null)
    setTimeout(() => setPaymentStatus(null), 5000)
  }

  const sendMessage = async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    // Vérifier la limite pour les utilisateurs gratuits
    if (!hasPremiumAccess()) {
      // Logique de limite à ajouter si besoin
    }

    if (trimmed.toLowerCase().includes('abonnement') || 
        trimmed.toLowerCase().includes('subscription') ||
        trimmed.toLowerCase().includes('assinatura') ||
        trimmed.toLowerCase().includes('prix') ||
        trimmed.toLowerCase().includes('premium')) {
      setShowSubscription(true)
      setInput('')
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: trimmed,
      sender: 'user',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    const tempId = (Date.now() + 1).toString()
    setMessages(prev => [...prev, {
      id: tempId,
      text: language === 'fr' ? "🤔 Réflexion..." : language === 'pt' ? "🤔 Pensando..." : "🤔 Thinking...",
      sender: 'ai',
      timestamp: new Date(),
      isTyping: true
    }])

    try {
      // ✅ CORRECTION ICI : On n'envoie PAS la langue, le backend la détecte automatiquement
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed })  // ← language supprimé
      })
      const data = await response.json()
      
      setMessages(prev => {
        const newMessages = [...prev]
        const lastMessage = newMessages[newMessages.length - 1]
        if (lastMessage && lastMessage.isTyping) {
          lastMessage.text = data.response || "Réponse générée."
          lastMessage.isTyping = false
        }
        return newMessages
      })
    } catch (error) {
      setMessages(prev => {
        const newMessages = [...prev]
        const lastMessage = newMessages[newMessages.length - 1]
        if (lastMessage && lastMessage.isTyping) {
          lastMessage.text = "❌ Erreur, réessayez"
          lastMessage.isTyping = false
        }
        return newMessages
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const plans = {
    fr: [
      { id: 'basic', name: 'Basic', price: 0, period: 'gratuit', features: ['9 analyses/mois', 'Chatbot basique'] },
      { id: 'pro', name: 'Pro', price: 5.99, period: 'semaine', features: ['Analyses illimitées', 'Chatbot avancé'] },
      { id: 'premium', name: 'Premium', price: 19.99, period: 'mois', features: ['Tout Pro inclus', 'API accessible'] }
    ],
    pt: [
      { id: 'basic', name: 'Basic', price: 0, period: 'grátis', features: ['9 análises/mês', 'Chatbot básico'] },
      { id: 'pro', name: 'Pro', price: 5.99, period: 'semana', features: ['Análises ilimitadas', 'Chatbot avançado'] },
      { id: 'premium', name: 'Premium', price: 19.99, period: 'mês', features: ['Tudo Pro incluído', 'API acessível'] }
    ],
    en: [
      { id: 'basic', name: 'Basic', price: 0, period: 'free', features: ['9 analyses/month', 'Basic chatbot'] },
      { id: 'pro', name: 'Pro', price: 5.99, period: 'week', features: ['Unlimited analyses', 'Advanced chatbot'] },
      { id: 'premium', name: 'Premium', price: 19.99, period: 'month', features: ['All Pro included', 'API access'] }
    ]
  }

  const currentPlans = plans[language]

  return (
    <div className="flex flex-col h-[550px] bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-emerald-600 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold">🤖 Hinos AI</h3>
            <p className="text-white/80 text-sm">Agriculture • Élevage • Pisciculture</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Affichage de l'abonnement actif */}
            {subscription && subscription.status === 'active' && (
              <div className="bg-green-500/30 rounded-lg px-3 py-1 text-white text-xs font-medium">
                {getTierLabel()} • {getTimeRemaining()}
              </div>
            )}
            <button onClick={() => setShowSubscription(true)} className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg text-white text-sm transition">
              <Crown size={16} /> Premium
            </button>
            <LanguageSelector currentLanguage={language} onLanguageChange={handleLanguageChange} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-xl ${msg.sender === 'user' ? 'bg-purple-600 text-white' : 'bg-white text-gray-800 shadow-sm'}`}>
              {msg.isTyping ? <div className="flex gap-1 py-2"><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" /></div> : <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}
              <span className="text-[10px] opacity-70 mt-1 block">{msg.timestamp.toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4 bg-white">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyPress={handleKeyPress} 
            placeholder={placeholders[language]} 
            className="flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" 
          />
          <button 
            onClick={sendMessage} 
            disabled={isLoading || !input.trim()} 
            className="bg-purple-600 text-white px-5 py-2 rounded-xl hover:bg-purple-700 transition disabled:opacity-50"
          >
            Envoyer
          </button>
        </div>
      </div>

      {showSubscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowSubscription(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-center mb-4">💎 Abonnements</h2>
            
            {/* Badge abonnement actuel */}
            {subscription && subscription.status === 'active' && (
              <div className="text-center mb-4">
                <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                  🎯 Plan actuel : {getTierLabel()}
                </span>
              </div>
            )}
            
            <div className="grid md:grid-cols-3 gap-4">
              {currentPlans.map((plan) => (
                <div key={plan.id} className={`border rounded-xl p-4 text-center ${subscription?.tier === plan.id ? 'border-purple-500 bg-purple-50' : ''}`}>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-2xl font-bold text-purple-600">{plan.price === 0 ? 'Gratuit' : `${plan.price} Pi`}</p>
                  <ul className="text-sm my-3">
                    {plan.features.map((f, i) => <li key={i}>✓ {f}</li>)}
                  </ul>
                  {plan.price > 0 && subscription?.tier !== plan.id && (
                    <button 
                      onClick={() => handlePiPayment(plan.id, plan.name, plan.price)} 
                      disabled={processingPlan === plan.id}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg w-full hover:bg-purple-700 transition disabled:opacity-50"
                    >
                      {processingPlan === plan.id ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Traitement...
                        </span>
                      ) : (
                        `Acheter ${plan.price} Pi`
                      )}
                    </button>
                  )}
                  {subscription?.tier === plan.id && plan.price > 0 && (
                    <button className="bg-gray-200 text-gray-500 px-4 py-2 rounded-lg w-full cursor-default">
                      ✓ Plan actuel
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {paymentStatus && (
              <div className={`mt-4 p-3 rounded-lg text-center ${
                paymentStatus.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' :
                paymentStatus.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' :
                'bg-blue-100 text-blue-700 border border-blue-200'
              }`}>
                {paymentStatus.message}
              </div>
            )}
            
            <button 
              onClick={() => setShowSubscription(false)} 
              className="mt-4 w-full text-gray-500 text-sm hover:text-gray-700"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}