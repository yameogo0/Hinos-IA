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

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${now.getMonth()}`;
    let userSub = userSubscriptions.get(userId);

    // Initialize or reset if new month (for free tier only)
    if (!userSub || (userSub.tier === 'free' && userSub.lastResetMonth !== currentMonth)) {
      userSub = {
        tier: userSub?.tier || 'free',
        requestsThisMonth: 0,
        lastResetMonth: currentMonth,
        expiresAt: userSub?.expiresAt,
        isTrialActive: userSub?.isTrialActive,
        trialEndsAt: userSub?.trialEndsAt,
      };
    }

    // Only increment for free tier (paid tiers are unlimited)
    if (userSub.tier === 'free') {
      userSub.requestsThisMonth += 1;
    }
    
    userSubscriptions.set(userId, userSub);

    return NextResponse.json({
      success: true,
      requestsThisMonth: userSub.requestsThisMonth,
      tier: userSub.tier,
    });
  } catch (error) {
    console.error('Request increment error:', error);
    return NextResponse.json(
      { error: 'Erreur d\'incrémentation' },
      { status: 500 }
    );
  }
}
