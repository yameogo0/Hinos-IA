import { NextRequest, NextResponse } from "next/server"

// Mode sandbox (test)
const PI_SANDBOX = process.env.NEXT_PUBLIC_PI_NETWORK_SANDBOX === 'true'

// Prix des abonnements
const PRICES: Record<string, number> = {
  pro_weekly: 5.99,
  premium_monthly: 19.99
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("💰 Pi Payment API - Body:", body)

    const { action, planId, amount, paymentId, txid, userId } = body

    // Mode sandbox - Simulation
    if (PI_SANDBOX) {
      // Créer un paiement
      if (action === "create") {
        const price = PRICES[planId] || amount
        console.log(`💰 [SANDBOX] Création paiement: ${planId} - ${price} Pi`)
        
        return NextResponse.json({
          success: true,
          paymentId: "sandbox_" + Date.now(),
          status: "pending",
          amount: price,
          memo: `Abonnement ${planId} - Hinos AI`
        })
      }
      
      // Approuver un paiement
      if (action === "approve") {
        console.log(`💰 [SANDBOX] Approbation paiement: ${paymentId}`)
        return NextResponse.json({ success: true, status: "approved" })
      }
      
      // Compléter un paiement
      if (action === "complete") {
        console.log(`💰 [SANDBOX] Complétion paiement: ${paymentId} - ${txid}`)
        return NextResponse.json({
          success: true,
          status: "completed",
          subscription: { 
            planId, 
            active: true, 
            activatedAt: new Date().toISOString(),
            txid
          }
        })
      }
      
      // Vérifier un paiement
      if (action === "verify") {
        return NextResponse.json({
          verified: true,
          status: "completed",
          txid: "sandbox_txid_123"
        })
      }
    }
    
    // Mode production - Appel réel API Pi
    if (action === "create") {
      const response = await fetch("https://api.minepi.com/v2/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Key ${process.env.PI_API_KEY}`
        },
        body: JSON.stringify({
          amount: PRICES[planId],
          memo: `Abonnement ${planId} - Hinos AI`,
          metadata: { planId, userId }
        })
      })
      
      const data = await response.json()
      return NextResponse.json(data)
    }
    
    return NextResponse.json({ 
      success: false, 
      error: "Action invalide" 
    }, { status: 400 })
    
  } catch (error: any) {
    console.error("❌ Erreur paiement Pi:", error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Erreur serveur" 
    }, { status: 500 })
  }
}
