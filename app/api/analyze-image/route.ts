import { NextRequest, NextResponse } from 'next/server';

// ⚠️ À remplacer par une base de données en production (PostgreSQL, MongoDB, etc.)
// Pour le développement, on garde en mémoire mais les données sont perdues au redéploiement
const userSubscriptions = new Map<string, {
  tier: 'free' | 'pro' | 'business';
  requestsToday: number;
  lastResetDate: string;
}>();

// ✅ Fonction pour vérifier le token Pi Network
async function verifyPiToken(accessToken: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.minepi.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) return null;
    
    const userData = await response.json();
    return userData.uid;
  } catch (error) {
    console.error('❌ Erreur vérification token Pi:', error);
    return null;
  }
}

// ✅ Fonction pour initialiser un utilisateur (ajouté)
function initializeUser(userId: string, tier: 'free' | 'pro' | 'business' = 'free') {
  if (!userSubscriptions.has(userId)) {
    userSubscriptions.set(userId, {
      tier: tier,
      requestsToday: 0,
      lastResetDate: new Date().toDateString()
    });
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
    
    // ✅ 2. VALIDER le token Pi Network
    const userId = await verifyPiToken(piAccessToken);
    if (!userId) {
      return NextResponse.json(
        { error: 'Token Pi Network invalide ou expiré.' },
        { status: 401 }
      );
    }

    // ✅ 3. Initialiser l'utilisateur s'il n'existe pas
    initializeUser(userId);

    // ✅ 4. Vérifier l'abonnement
    const userSub = userSubscriptions.get(userId);
    if (!userSub || userSub.tier === 'free') {
      return NextResponse.json(
        { error: 'L\'analyse d\'images nécessite un abonnement Pro ou Business. Veuillez vous abonner.' },
        { status: 403 }
      );
    }

    // ✅ 5. Vérifier les limites quotidiennes
    const today = new Date().toDateString();
    if (userSub.lastResetDate !== today) {
      userSub.requestsToday = 0;
      userSub.lastResetDate = today;
    }
    
    const dailyLimit = userSub.tier === 'pro' ? 50 : 500;
    
    if (userSub.requestsToday >= dailyLimit) {
      return NextResponse.json(
        { error: `Limite quotidienne d'analyses (${dailyLimit}) atteinte pour le forfait ${userSub.tier === 'pro' ? 'Pro' : 'Business'}.` },
        { status: 429 }
      );
    }

    // ✅ 6. Récupérer l'image
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const prompt = formData.get('prompt') as string || 'Analysez cette image en détail.';

    if (!image) {
      return NextResponse.json(
        { error: 'Aucune image fournie.' },
        { status: 400 }
      );
    }

    // ✅ 7. Vérifier le type MIME
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json(
        { error: 'Format d\'image non supporté. Utilisez JPEG, PNG ou WEBP.' },
        { status: 400 }
      );
    }

    // ✅ 8. Vérifier la taille de l'image (max 5MB)
    if (image.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'L\'image ne doit pas dépasser 5 Mo.' },
        { status: 400 }
      );
    }

    // ✅ 9. Convertir l'image en base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // ✅ 10. Appeler l'API OpenAI Vision
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      console.error('❌ OPENAI_API_KEY non configurée');
      return NextResponse.json({
        analysis: '⚠️ Service d\'analyse d\'image temporairement indisponible.',
        error: 'Configuration API manquante'
      }, { status: 500 });
    }

    // ✅ 11. Appel à GPT-4 Vision
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
      
      let errorMessage = 'Erreur lors de l\'analyse de l\'image.';
      if (errorData.error?.code === 'insufficient_quota') {
        errorMessage = 'Quota API dépassé. Veuillez réessayer plus tard.';
      } else if (errorData.error?.code === 'invalid_api_key') {
        errorMessage = 'Configuration API invalide.';
      } else if (errorData.error?.code === 'rate_limit_exceeded') {
        errorMessage = 'Trop de requêtes. Veuillez patienter.';
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    const openaiData = await openaiResponse.json();
    const analysis = openaiData.choices?.[0]?.message?.content || 
                    'Impossible d\'analyser l\'image. Veuillez réessayer.';

    // ✅ 12. Incrémenter le compteur
    userSub.requestsToday++;

    return NextResponse.json({ 
      analysis,
      remaining: dailyLimit - userSub.requestsToday,
      tier: userSub.tier
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
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const piAccessToken = authHeader.replace('Bearer ', '');
    const userId = await verifyPiToken(piAccessToken);
    
    if (!userId) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    initializeUser(userId);
    const userSub = userSubscriptions.get(userId);
    
    const today = new Date().toDateString();
    if (userSub && userSub.lastResetDate !== today) {
      userSub.requestsToday = 0;
      userSub.lastResetDate = today;
    }
    
    const dailyLimit = userSub?.tier === 'pro' ? 50 : userSub?.tier === 'business' ? 500 : 0;
    
    return NextResponse.json({
      tier: userSub?.tier || 'free',
      requestsToday: userSub?.requestsToday || 0,
      remaining: dailyLimit - (userSub?.requestsToday || 0),
      limit: dailyLimit
    });
  } catch (error) {
    console.error('❌ Error in GET:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}