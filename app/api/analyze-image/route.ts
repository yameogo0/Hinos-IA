import { NextRequest, NextResponse } from 'next/server';

// Stockage persistant (à remplacer par une base de données en production)
// Pour l'instant, on garde en mémoire mais attention aux pertes
const userSubscriptions = new Map<string, {
  tier: 'free' | 'pro' | 'business';
  requestsToday: number;
  lastResetDate: string;
}>();

// ✅ Fonction pour vérifier le token Pi Network
async function verifyPiToken(accessToken: string): Promise<string | null> {
  try {
    // Vérifier le token avec l'API Pi Network
    const response = await fetch('https://api.minepi.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) return null;
    
    const userData = await response.json();
    return userData.uid; // Retourne l'UID unique de l'utilisateur Pi
  } catch (error) {
    console.error('Erreur vérification token Pi:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // ✅ 1. Vérifier l'authentification
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Non authentifié. Veuillez vous connecter avec Pi Network.' },
        { status: 401 }
      );
    }

    const piAccessToken = authHeader.replace('Bearer ', '');
    
    // ✅ 2. VALIDER le token Pi Network (correction importante)
    const userId = await verifyPiToken(piAccessToken);
    if (!userId) {
      return NextResponse.json(
        { error: 'Token Pi Network invalide ou expiré.' },
        { status: 401 }
      );
    }

    // ✅ 3. Vérifier l'abonnement
    const userSub = userSubscriptions.get(userId);
    if (!userSub || userSub.tier === 'free') {
      return NextResponse.json(
        { error: 'L\'analyse d\'images nécessite un abonnement Pro ou Business. Veuillez vous abonner.' },
        { status: 403 }
      );
    }

    // ✅ 4. Vérifier les limites quotidiennes (optionnel)
    const today = new Date().toDateString();
    if (userSub.lastResetDate !== today) {
      userSub.requestsToday = 0;
      userSub.lastResetDate = today;
    }
    
    if (userSub.tier === 'pro' && userSub.requestsToday >= 50) {
      return NextResponse.json(
        { error: 'Limite quotidienne d\'analyses (50) atteinte pour le forfait Pro.' },
        { status: 429 }
      );
    }
    
    if (userSub.tier === 'business' && userSub.requestsToday >= 500) {
      return NextResponse.json(
        { error: 'Limite quotidienne d\'analyses (500) atteinte.' },
        { status: 429 }
      );
    }

    // ✅ 5. Récupérer l'image
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const prompt = formData.get('prompt') as string || 'Analysez cette image en détail.';

    if (!image) {
      return NextResponse.json(
        { error: 'Aucune image fournie.' },
        { status: 400 }
      );
    }

    // ✅ 6. Vérifier la taille de l'image (max 5MB)
    if (image.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'L\'image ne doit pas dépasser 5 Mo.' },
        { status: 400 }
      );
    }

    // ✅ 7. Convertir l'image en base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // ✅ 8. Appeler l'API OpenAI Vision
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      console.error('❌ OPENAI_API_KEY non configurée');
      return NextResponse.json({
        analysis: '⚠️ Service d\'analyse d\'image temporairement indisponible. Veuillez réessayer plus tard.',
        error: 'Configuration API manquante'
      }, { status: 500 });
    }

    // ✅ 9. Appel à GPT-4 Vision
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
      console.error('❌ OpenAI API error:', errorData);
      
      // Message d'erreur plus clair
      let errorMessage = 'Erreur lors de l\'analyse de l\'image.';
      if (errorData.error?.code === 'insufficient_quota') {
        errorMessage = 'Quota API dépassé. Veuillez réessayer plus tard.';
      } else if (errorData.error?.code === 'invalid_api_key') {
        errorMessage = 'Configuration API invalide.';
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    const openaiData = await openaiResponse.json();
    const analysis = openaiData.choices?.[0]?.message?.content || 
                    'Impossible d\'analyser l\'image. Veuillez réessayer.';

    // ✅ 10. Incrémenter le compteur
    userSub.requestsToday++;

    return NextResponse.json({ 
      analysis,
      remaining: (userSub.tier === 'pro' ? 50 : 500) - userSub.requestsToday
    });
    
  } catch (error) {
    console.error('❌ Image analysis error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}

// ✅ GET pour vérifier le statut d'abonnement
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const piAccessToken = authHeader.replace('Bearer ', '');
  const userId = await verifyPiToken(piAccessToken);
  
  if (!userId) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  }

  const userSub = userSubscriptions.get(userId);
  return NextResponse.json({
    tier: userSub?.tier || 'free',
    requestsToday: userSub?.requestsToday || 0,
    limit: userSub?.tier === 'pro' ? 50 : userSub?.tier === 'business' ? 500 : 0
  });
}