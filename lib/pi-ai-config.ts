// lib/pi-ai-config.ts
// Configuration pour Hinos IA avec Groq (Llama 3.3) OU OpenAI (GPT)

// 🔑 INSÉREZ VOS DEUX CLÉS API ICI
const GROQ_API_KEY = "gsk_votre_clé_groq_ici";      // Votre clé Groq
const OPENAI_API_KEY = "sk-votre_clé_openai_ici";   // Votre clé OpenAI

// Choisissez quel modèle utiliser par défaut : "groq" ou "openai"
const DEFAULT_PROVIDER = "groq";  // Changez pour "openai" si vous préférez GPT

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

// Configuration pour l'API OpenAI
export const OPENAI_CONFIG = {
  apiKey: OPENAI_API_KEY,
  model: "gpt-3.5-turbo",  // ou "gpt-4" si vous y avez accès
  apiUrl: "https://api.openai.com/v1/chat/completions",
  generationConfig: {
    temperature: 0.7,
    max_tokens: 800,
    top_p: 0.9,
  }
};

// Contexte système (votre texte existant - gardez-le tel quel)
export const SYSTEM_CONTEXT = `Tu es Hinos AI, un assistant intelligent spécialisé dans l'agriculture, l'élevage, la pisciculture et la transformation alimentaire...`; // Votre texte complet

// Fonction pour appeler l'API selon le fournisseur choisi
export async function callGroqAPI(userMessage: string, history?: any[]) {
  return callAI(userMessage, history, "groq");
}

export async function callOpenAIAPI(userMessage: string, history?: any[]) {
  return callAI(userMessage, history, "openai");
}

// Fonction principale unifiée
export async function callAI(userMessage: string, history?: any[], provider: string = DEFAULT_PROVIDER) {
  // Sélectionner la configuration appropriée
  let config;
  let apiKey;
  
  if (provider === "openai") {
    config = OPENAI_CONFIG;
    apiKey = OPENAI_API_KEY;
    if (!apiKey || apiKey === "sk-votre_clé_openai_ici") {
      return "❌ Clé OpenAI manquante. Veuillez l'insérer dans le fichier pi-ai-config.ts";
    }
  } else {
    config = GROQ_CONFIG;
    apiKey = GROQ_API_KEY;
    if (!apiKey || apiKey === "gsk_votre_clé_groq_ici") {
      return "❌ Clé Groq manquante. Veuillez l'insérer dans le fichier pi-ai-config.ts";
    }
  }

  // Construction des messages
  const messages = [
    { role: "system", content: SYSTEM_CONTEXT },
    { role: "user", content: userMessage }
  ];

  if (history && history.length > 0) {
    messages.unshift(...history);
  }

  try {
    const response = await fetch(config.apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: config.model,
        messages: messages,
        temperature: config.generationConfig.temperature,
        max_tokens: config.generationConfig.max_tokens,
        top_p: config.generationConfig.top_p
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Erreur ${provider} API:`, error);
      return `❌ Désolé, une erreur est survenue. Veuillez réessayer plus tard.`;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Je n'ai pas pu générer une réponse.";
  } catch (error) {
    console.error(`Erreur ${provider}:`, error);
    return "❌ Erreur de connexion. Vérifiez votre connexion internet.";
  }
}

// Exports pour compatibilité
export const callGeminiAPI = callGroqAPI;