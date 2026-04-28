import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Unauthorized - Pi Network token required' },
      { status: 401 }
    );
  }

  try {
    const { referralCode } = await request.json();

    if (!referralCode || typeof referralCode !== 'string') {
      return NextResponse.json(
        { error: 'Invalid referral code' },
        { status: 400 }
      );
    }

    // In a real implementation, this would:
    // 1. Validate the Pi Network access token
    // 2. Check if referral code exists in database
    // 3. Verify user hasn't already used a referral code
    // 4. Apply the referral benefit (1 month free)
    // 5. Update referrer's referral count
    // 6. Send notifications to both users

    console.log(`[v0] Applying referral code: ${referralCode}`);

    // Mock validation
    if (!referralCode.startsWith('HINOS-')) {
      return NextResponse.json(
        { error: 'Code de parrainage invalide' },
        { status: 400 }
      );
    }

    // Example database operations:
    // const referrer = await db.users.findOne({ referralCode });
    // if (!referrer) {
    //   return NextResponse.json({ error: 'Code invalide' }, { status: 404 });
    // }
    // 
    // const user = await db.users.findOne({ piToken: authHeader });
    // if (user.hasUsedReferral) {
    //   return NextResponse.json({ error: 'Vous avez déjà utilisé un code de parrainage' }, { status: 400 });
    // }
    //
    // await db.subscriptions.update({
    //   userId: user.id,
    //   tier: 'monthly',
    //   expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    //   referralBonus: true
    // });
    //
    // await db.users.update({
    //   id: user.id,
    //   hasUsedReferral: true
    // });
    //
    // await db.referrals.increment({
    //   userId: referrer.id,
    //   count: 1
    // });

    return NextResponse.json({
      success: true,
      message: 'Code de parrainage appliqué avec succès!',
      benefit: 'monthly_free_1_month',
    });
  } catch (error) {
    console.error('[v0] Referral application error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
