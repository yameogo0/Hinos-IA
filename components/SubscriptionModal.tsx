'use client'

import { useState } from "react"

interface Plan {
  id: string
  name: string
  price: number
  period: string
  features: string[]
  color: string
}

const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 0,
    period: "gratuit",
    features: ["9 analyses/mois", "Chatbot basique", "Support email"],
    color: "from-gray-500 to-gray-600"
  },
  {
    id: "pro",
    name: "Pro",
    price: 2.99,
    period: "semaine",
    features: ["Analyses illimitées", "Chatbot avancé", "Support prioritaire", "API basique"],
    color: "from-blue-500 to-blue-600"
  },
  {
    id: "premium",
    name: "Premium",
    price: 9.99,
    period: "mois",
    features: ["Tout Pro", "API complète", "Rapports personnalisés", "Formation incluse"],
    color: "from-purple-500 to-emerald-500"
  }
]

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  currentTier: string
  onUpgrade: (tier: string) => void
}

export default function SubscriptionModal({ isOpen, onClose, currentTier, onUpgrade }: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  const handleSubscribe = async (plan: Plan) => {
    if (plan.id === currentTier) {
      onClose()
      return
    }

    setSelectedPlan(plan.id)
    setIsProcessing(true)

    try {
      // Simulation de paiement (à remplacer par vrai paiement Pi)
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      alert(`✅ Abonnement ${plan.name} activé ! (${plan.price === 0 ? 'Gratuit' : plan.price + ' Pi'})`)
      onUpgrade(plan.id)
      onClose()
    } catch (error) {
      alert("Erreur lors du paiement")
    } finally {
      setIsProcessing(false)
      setSelectedPlan(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay sombre */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-emerald-600 bg-clip-text text-transparent">
            Choisissez votre formule
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 text-2xl hover:bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center"
          >
            ✕
          </button>
        </div>
        
        {/* Contenu */}
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan) => {
              const isCurrent = currentTier === plan.id
              
              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                    isCurrent ? 'border-purple-500 shadow-xl' : 'border-gray-200 hover:shadow-lg'
                  } ${plan.id === 'pro' ? 'relative' : ''}`}
                >
                  {/* Badge "Populaire" */}
                  {plan.id === 'pro' && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-emerald-500 text-white px-3 py-1 text-xs font-semibold rounded-bl-xl">
                      🔥 Populaire
                    </div>
                  )}
                  
                  {/* En-tête */}
                  <div className={`bg-gradient-to-r ${plan.color} p-4 text-white`}>
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">{plan.price === 0 ? 'Gratuit' : `${plan.price} Pi`}</span>
                      {plan.price > 0 && <span className="text-sm opacity-80">/{plan.period}</span>}
                    </div>
                  </div>
                  
                  {/* Caractéristiques */}
                  <div className="p-4">
                    <ul className="space-y-2 mb-4">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <span className="text-green-500 text-lg">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    {/* Bouton */}
                    <button
                      onClick={() => handleSubscribe(plan)}
                      disabled={isProcessing || isCurrent}
                      className={`w-full py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                        isCurrent
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                          : `bg-gradient-to-r ${plan.color} text-white hover:opacity-90 hover:scale-105 active:scale-95`
                      }`}
                    >
                      {isProcessing && selectedPlan === plan.id ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Traitement...
                        </span>
                      ) : isCurrent ? (
                        "✓ Plan actuel"
                      ) : plan.price === 0 ? (
                        "Commencer gratuitement"
                      ) : (
                        `Payer ${plan.price} Pi`
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Footer sécurisé */}
          <div className="mt-8 pt-4 border-t text-center">
            <div className="flex justify-center gap-4 text-sm text-gray-500">
              <span>🔒 Paiement sécurisé</span>
              <span>⚡ Via Pi Network</span>
              <span>🔄 Annulation à tout moment</span>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Les paiements sont traités de manière sécurisée. Aucune information bancaire n'est stockée.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
