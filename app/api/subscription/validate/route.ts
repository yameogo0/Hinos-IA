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

const SUBSCRIPTION_LIMITS = {
  free: 10, // per month
  weekly: -1, // unlimited
  monthly: -1, // unlimited
};

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
    
    // Get user ID from Pi token (in production, validate with Pi API)
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
      userSubscriptions.set(userId, userSub);
    }

    // Check if trial has expired
    if (userSub.isTrialActive && userSub.trialEndsAt) {
      const trialEnd = new Date(userSub.trialEndsAt);
      if (trialEnd < now) {
        userSub.isTrialActive = false;
        userSub.tier = 'free';
        userSub.requestsThisMonth = 0;
        userSubscriptions.set(userId, userSub);
      }
    }

    // Check if subscription has expired
    if (userSub.expiresAt) {
      const expiry = new Date(userSub.expiresAt);
      if (expiry < now) {
        userSub.tier = 'free';
        userSub.expiresAt = undefined;
        userSub.requestsThisMonth = 0;
        userSubscriptions.set(userId, userSub);
      }
    }

    const limit = SUBSCRIPTION_LIMITS[userSub.tier];
    const canRequest = limit === -1 || userSub.requestsThisMonth < limit;

    return NextResponse.json({
      tier: userSub.tier,
      requestsThisMonth: userSub.requestsThisMonth,
      requestsLimit: limit,
      canRequest,
      remainingRequests: limit === -1 ? -1 : Math.max(0, limit - userSub.requestsThisMonth),
      expiresAt: userSub.expiresAt,
      isTrialActive: userSub.isTrialActive || false,
      trialEndsAt: userSub.trialEndsAt,
    });
  } catch (error) {
    console.error('Subscription validation error:', error);
    return NextResponse.json(
      { error: 'Erreur de validation' },
      { status: 500 }
    );
  }
}
