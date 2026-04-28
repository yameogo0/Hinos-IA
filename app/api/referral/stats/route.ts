import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Unauthorized - Pi Network token required' },
      { status: 401 }
    );
  }

  try {
    // In a real implementation, this would:
    // 1. Validate the Pi Network access token
    // 2. Query database for user's referral statistics
    // 3. Return total referrals, successful conversions, earned benefits

    console.log('[v0] Fetching referral stats');

    // Example database query:
    // const user = await db.users.findOne({ piToken: authHeader });
    // const referralStats = await db.referrals.findOne({ userId: user.id });

    return NextResponse.json({
      referralCode: 'HINOS-DEMO123',
      totalReferrals: 0,
      successfulReferrals: 0,
      pendingReferrals: 0,
      earnedMonths: 0,
      referralLink: 'https://hinos-ia.app/ref/HINOS-DEMO123',
    });
  } catch (error) {
    console.error('[v0] Referral stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
