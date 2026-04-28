import { NextRequest, NextResponse } from 'next/server';

// In-memory store for subscription checking
const userSubscriptions = new Map<string, {
  tier: 'free' | 'pro' | 'business';
  requestsToday: number;
  lastResetDate: string;
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
    const userId = piAccessToken;

    // Check subscription tier
    const userSub = userSubscriptions.get(userId);
    if (!userSub || userSub.tier === 'free') {
      return NextResponse.json(
        { error: 'L\'analyse d\'images nécessite un abonnement Pro ou Business' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const image = formData.get('image') as File;
    const prompt = formData.get('prompt') as string || 'Analysez cette image en détail.';

    if (!image) {
      return NextResponse.json(
        { error: 'Aucune image fournie' },
        { status: 400 }
      );
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Call OpenAI Vision API (requires OPENAI_API_KEY environment variable)
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      // Fallback response if API key not configured
      return NextResponse.json({
        analysis: 'Analyse d\'image disponible uniquement avec configuration OpenAI. ' +
                 'Pour les abonnés Pro/Business: Cette image serait analysée par GPT-4 Vision pour fournir ' +
                 'des insights détaillés sur le contenu, les objets, le contexte et les recommandations pertinentes.',
      });
    }

    // Call OpenAI GPT-4 Vision API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${image.type};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error('OpenAI API error:', errorData);
      return NextResponse.json(
        { error: 'Erreur lors de l\'analyse de l\'image' },
        { status: 500 }
      );
    }

    const openaiData = await openaiResponse.json();
    const analysis = openaiData.choices?.[0]?.message?.content || 
                    'Impossible d\'analyser l\'image';

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Image analysis error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'analyse' },
      { status: 500 }
    );
  }
}
