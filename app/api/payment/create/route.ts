import { NextRequest, NextResponse } from 'next/server'

interface PaymentRequest {
  amount: number
  memo: string
  metadata: {
    tier: 'weekly' | 'monthly'
    [key: string]: any
  }
}

// In-memory store for demo (use database in production)
const payments = new Map<string, any>()

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
    const body: PaymentRequest = await request.json()

    // Validate request
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { error: 'Montant invalide' },
        { status: 400 }
      )
    }

    if (!body.metadata?.tier || !['weekly', 'monthly'].includes(body.metadata.tier)) {
      return NextResponse.json(
        { error: 'Tier invalide' },
        { status: 400 }
      )
    }

    // Generate unique transaction ID
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create payment object
    const payment = {
      transactionId,
      amount: body.amount,
      memo: body.memo,
      metadata: body.metadata,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      piAccessToken, // Store for verification later
    }

    // Store payment
    payments.set(transactionId, payment)

    console.log('[v0] Paiement créé:', payment)

    return NextResponse.json({
      transactionId,
      amount: body.amount,
      status: 'pending',
      createdAt: payment.createdAt,
      memo: body.memo,
      message: 'Veuillez approuver le paiement dans votre wallet Pi',
    })
  } catch (error) {
    console.error('[v0] Erreur lors de la création du paiement:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
