// lib/pi-ai-config.ts
// Configuration pour Hinos IA avec Groq (Llama 3.3)

// 🔑 VOTRE CLÉ API GROQ
const GROQ_API_KEY = "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";

// Configuration pour l'API Groq
export const GROQ_CONFIG = {
  apiKey: GROQ_API_KEY,
  model: "llama3-70b-8192",
  apiUrl: "https://api.groq.com/openai/v1/chat/completions",
  generationConfig: {
    temperature: 0.7,
    max_tokens: 800,
    top_p: 0.9,
  }
};

// Contexte système pour Hinos IA
export const SYSTEM_CONTEXT = `Tu es Hinos AI, un assistant intelligent spécialisé dans l'agriculture, l'élevage, la pisciculture et la transformation alimentaire.

**RÈGLES :**
- Adapte TOUJOURS tes réponses au pays de l'utilisateur
- Donne des conseils pratiques et actionnables
- Sois encourageant et professionnel
- Réponds toujours en français
- Si l'utilisateur ne mentionne pas son pays, demande-le lui

Tu représentes Hinos, une application innovante dans l'agriculture.`;

// Fonction pour appeler l'API Groq
export async function callGroqAPI(userMessage: string, history?: any[]) {
  if (!GROQ_API_KEY) {
    console.error("❌ Clé API Groq manquante");
    return "❌ Configuration API manquante. Veuillez contacter l'administrateur.";
  }

  try {
    const response = await fetch(GROQ_CONFIG.apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: GROQ_CONFIG.model,
        messages: [
          { role: "system", content: SYSTEM_CONTEXT },
          { role: "user", content: userMessage }
        ],
        temperature: GROQ_CONFIG.generationConfig.temperature,
        max_tokens: GROQ_CONFIG.generationConfig.max_tokens,
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Erreur API Groq:", error);
      return "❌ Désolé, l'assistant est momentanément indisponible. Veuillez réessayer plus tard.";
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Je n'ai pas pu générer une réponse.";
  } catch (error) {
    console.error("Erreur:", error);
    return "❌ Erreur de connexion. Vérifiez votre connexion internet.";
  }
}

// Export principal
export const callAIAPI = callGroqAPI;
export const callGeminiAPI = callGroqAPI;