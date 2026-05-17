// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { callGroqAPI } from '@/lib/pi-ai-config';

export async function POST(req: NextRequest) {
  let language = 'fr'; // Déclarer language au début

  try {
    const body = await req.json();
    const { message, history } = body;
    
    // Récupérer la langue depuis le body ou utiliser 'fr' par défaut
    language = body.language || 'fr';

    console.log("📩 Message reçu:", message);
    console.log("🌍 Langue détectée:", language);

    if (!message) {
      return NextResponse.json(
        { response: "Veuillez poser une question." },
        { status: 400 }
      );
    }

    // Appel à l'API Groq
    const response = await callGroqAPI(message, history);

    return NextResponse.json({ response });

  } catch (error: any) {
    console.error("❌ Erreur:", error.message);
    
    // Définir le message d'erreur selon la langue
    const errorMessages: Record<string, string> = {
      fr: "❌ Désolé, une erreur est survenue. Veuillez réessayer plus tard.",
      en: "❌ Sorry, an error occurred. Please try again later.",
      pt: "❌ Desculpe, ocorreu um erro. Por favor, tente novamente mais tarde."
    };
    
    const errorMessage = errorMessages[language] || errorMessages.fr;
    
    return NextResponse.json(
      { response: errorMessage },
      { status: 500 }
    );
  }
}