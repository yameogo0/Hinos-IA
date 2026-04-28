import { NextRequest, NextResponse } from 'next/server'

interface VerifyRequest {
  transactionId: string
}

// In-memory store for demo (would connect to database in production)
const payments = new Map<string, any>()
const completedPayments = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    // Validate authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      )
    }

    const piAccessToken = authHeader.slice(7)
    const body: VerifyRequest = await request.json()

    if (!body.transactionId) {
      return NextResponse.json(
        { error: 'TransactionId requis' },
        { status: 400 }
      )
    }

    const { transactionId } = body

    // In production, you would:
    // 1. Call Pi Network API to verify payment
    // 2. Check blockchain transaction
    // 3. Update database

    // For demo purposes, simulate verification
    // In real implementation, verify against Pi Network API
    const mockBlockchainTxid = `0x${Math.random().toString(16).substr(2)}`

    // Check if payment was already completed
    if (completedPayments.has(transactionId)) {
      const payment = completedPayments.get(transactionId)
      return NextResponse.json({
        verified: true,
        txid: payment.txid,
        status: 'completed',
        tier: payment.metadata.tier,
        completedAt: payment.completedAt,
      })
    }

    // Simulate payment confirmation (70% chance to be confirmed)
    const isConfirmed = Math.random() > 0.3

    if (isConfirmed) {
      // Mark as completed
      const payment = {
        transactionId,
        txid: mockBlockchainTxid,
        status: 'completed',
        completedAt: new Date().toISOString(),
        metadata: { tier: 'weekly' }, // Would be from actual payment data
      }

      completedPayments.set(transactionId, payment)

      console.log('[v0] Paiement vérifié sur blockchain:', mockBlockchainTxid)

      return NextResponse.json({
        verified: true,
        txid: mockBlockchainTxid,
        status: 'completed',
        tier: payment.metadata.tier,
        message: 'Paiement confirmé! Votre abonnement a été mis à jour.',
      })
    }

    // Payment still pending
    return NextResponse.json({
      verified: false,
      status: 'pending',
      message: 'Le paiement est en cours de traitement. Veuillez attendre...',
    })
  } catch (error) {
    console.error('[v0] Erreur lors de la vérification:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
