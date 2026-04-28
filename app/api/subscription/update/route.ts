import { NextRequest, NextResponse } from 'next/server';

// In-memory store for demo (use a real database in production)
const userSubscriptions = new Map<string, {
  tier: 'free' | 'weekly' | 'monthly';
  requestsThisMonth: number;
  lastResetMonth: string;
  expiresAt?: string;
  isTrialActive?: boolean;
  trialEndsAt?: string;
}>();

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const piAccessToken = authHeader.replace('Bearer ', '');
    const userId = piAccessToken; // Simplified for demo

    const body = await request.json();
    const { tier, paymentId, isTrialActive, trialEndsAt } = body;

    if (!['free', 'weekly', 'monthly'].includes(tier)) {
      return NextResponse.json(
        { error: 'Type d\'abonnement invalide' },
        { status: 400 }
      );
    }

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${now.getMonth()}`;
    let userSub = userSubscriptions.get(userId);

    // Calculate expiration based on billing period
    let expiresAt: string | undefined;
    if (tier === 'weekly') {
      expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    } else if (tier === 'monthly') {
      expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    }

    const updatedSub = {
      tier: tier as 'free' | 'weekly' | 'monthly',
      requestsThisMonth: 0, // Reset on subscription change
      lastResetMonth: currentMonth,
      expiresAt,
      isTrialActive: isTrialActive || false,
      trialEndsAt: trialEndsAt || undefined,
    };

    userSubscriptions.set(userId, updatedSub);

    console.log(`[v0] Updated subscription for user ${userId}:`, {
      tier,
      paymentId: paymentId || 'none',
      isTrialActive: updatedSub.isTrialActive,
    });

    return NextResponse.json({
      success: true,
      subscription: updatedSub,
      message: `Abonnement mis à jour vers ${tier}${isTrialActive ? ' (Essai gratuit)' : ''}`,
    });
  } catch (error) {
    console.error('Subscription update error:', error);
    return NextResponse.json(
      { error: 'Erreur de mise à jour' },
      { status: 500 }
    );
  }
}
