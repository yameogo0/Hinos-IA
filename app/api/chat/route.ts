// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { callGroqAPI } from '@/lib/pi-ai-config';

export async function POST(req: NextRequest) {
  try {
    const { message, history, language = 'fr' } = await req.json();

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
    
    // ✅ Correction : language est défini avec une valeur par défaut
    const lang = 'fr';
    const errorMessage = getErrorMessage(lang);
    
    return NextResponse.json(
      { response: errorMessage },
      { status: 500 }
    );
  }
}

function getErrorMessage(language: string): string {
  const messages: Record<string, string> = {
    fr: "❌ Désolé, une erreur est survenue. Veuillez réessayer plus tard.",
    en: "❌ Sorry, an error occurred. Please try again later.",
    pt: "❌ Desculpe, ocorreu um erro. Por favor, tente novamente mais tarde."
  };
  return messages[language] || messages.fr;
}
