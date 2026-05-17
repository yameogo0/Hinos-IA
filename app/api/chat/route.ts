import { groq } from '@ai-sdk/groq'
import { generateText } from 'ai'
import { NextRequest } from 'next/server'

// 🔑 VOS DEUX CLÉS API (utiliser variables d'environnement en production)
const GROQ_API_KEY = process.env.GROQ_API_KEY || "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";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "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";

// 🎯 Choisir le fournisseur par défaut : "groq" ou "openai"
const DEFAULT_PROVIDER = "groq";  // Changez pour "openai" si besoin

export async function POST(request: NextRequest) {
  try {
    const { message, language = 'fr', provider = DEFAULT_PROVIDER } = await request.json()
    
    console.log(`📩 Message reçu: "${message}"`)
    console.log(`🌍 Langue: ${language}`)
    console.log(`🤖 Fournisseur choisi: ${provider}`)

    if (!message) {
      return Response.json({ error: "Message requis" }, { status: 400 })
    }

    const systemPrompt = getSystemPrompt(language)
    let responseText = ""

    // ✅ Utilisation de GROQ
    if (provider === "groq") {
      if (!GROQ_API_KEY || GROQ_API_KEY === "gsk_votre_clé_groq_ici") {
        console.error("❌ GROQ_API_KEY manquante")
        return Response.json({ 
          response: "🔑 Clé API Groq manquante. Veuillez configurer la variable d'environnement GROQ_API_KEY." 
        })
      }

      try {
        const { text } = await generateText({
          model: groq('llama-3.3-70b-versatile', {
            apiKey: GROQ_API_KEY
          }),
          prompt: message,
          system: systemPrompt,
          temperature: 0.7,
          maxTokens: 800,
        })
        responseText = text
        console.log("✅ Réponse générée par GROQ (Llama 3.3)")
      } catch (error: any) {
        console.error("❌ Erreur GROQ:", error.message)
        
        // ✅ Fallback vers OpenAI si GROQ échoue
        console.log("🔄 Fallback vers OpenAI...")
        try {
          responseText = await callOpenAI(message, systemPrompt, OPENAI_API_KEY)
          console.log("✅ Réponse générée par OPENAI (fallback)")
        } catch (openaiError: any) {
          throw new Error(`Les deux fournisseurs ont échoué: ${openaiError.message}`)
        }
      }
    }
    
    // ✅ Utilisation de OPENAI
    else if (provider === "openai") {
      if (!OPENAI_API_KEY || OPENAI_API_KEY === "sk-votre_clé_openai_ici") {
        console.error("❌ OPENAI_API_KEY manquante")
        return Response.json({ 
          response: "🔑 Clé API OpenAI manquante. Veuillez configurer la variable d'environnement OPENAI_API_KEY." 
        })
      }

      try {
        responseText = await callOpenAI(message, systemPrompt, OPENAI_API_KEY)
        console.log("✅ Réponse générée par OPENAI")
      } catch (error: any) {
        console.error("❌ Erreur OPENAI:", error.message)
        
        // ✅ Fallback vers Groq si OpenAI échoue
        console.log("🔄 Fallback vers Groq...")
        const { text } = await generateText({
          model: groq('llama-3.3-70b-versatile', {
            apiKey: GROQ_API_KEY
          }),
          prompt: message,
          system: systemPrompt,
          temperature: 0.7,
          maxTokens: 800,
        })
        responseText = text
        console.log("✅ Réponse générée par GROQ (fallback)")
      }
    }

    return Response.json({ 
      response: responseText,
      provider: provider  // Indique quel fournisseur a été utilisé
    })

  } catch (error: any) {
    console.error("❌ Erreur générale:", error.message)
    
    let errorMessage = getErrorMessage("fr")
    if (error.message?.includes("API key")) {
      errorMessage = "🔑 Clé API invalide ou manquante."
    } else if (error.message?.includes("rate limit")) {
      errorMessage = "⏰ Trop de requêtes. Veuillez patienter."
    } else if (error.message?.includes("Les deux fournisseurs")) {
      errorMessage = "❌ Les deux services IA sont indisponibles. Veuillez réessayer plus tard."
    }
    
    return Response.json({ response: errorMessage })
  }
}

// ✅ Fonction pour appeler OpenAI
async function callOpenAI(message: string, systemPrompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',  // ou 'gpt-4' si vous y avez accès
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 800,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`OpenAI API error: ${error.error?.message || response.status}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || "Je n'ai pas pu générer une réponse."
}

// ✅ Système prompt multilingue (conserver votre version existante)
function getSystemPrompt(lang: string): string {
  const prompts: Record<string, string> = {
    fr: `Tu es Hinos AI, un assistant expert en agriculture, élevage, pisciculture et transformation alimentaire en Afrique.

**DONNÉES SPÉCIFIQUES :**

🇧🇫 **BURKINA FASO (BAMA) :**
- Barrage de Bama : riz irrigué, maraîchage (oignon, tomate), pisciculture (tilapia, poisson-chat)
- Cultures : sorgho, millet, maïs, coton (1er producteur Afrique Ouest), karité, mangue
- Élevage : bovins Zébu, ovins, caprins
- Techniques anti-sécheresse : Zaï, cordons pierreux, demi-lunes

🇦🇴 **ANGOLA :**
- Hauts Plateaux (Huambo, Bié) : soja, maïs, pomme de terre
- Nord : café (reprise), manioc, banane
- Élevage : bovins Humbe (Cunene)
- Pisciculture : tilapia, poisson-chat (fleuves Kwanza, Cunene)

**RÈGLES :**
- Réponds TOUJOURS en français
- Utilise des emojis (🇧🇫, 🇦🇴, 🌾, 🐄, 🐟, 🏭)
- Donne des conseils pratiques avec des chiffres précis
- Cite les localités comme Bama, Bagré, Kompienga, Huambo, Cunene

Commence chaque réponse par un emoji pertinent.`,

    pt: `Você é Hinos AI, um assistente especialista em agricultura, pecuária, piscicultura e transformação de alimentos na África.

**DADOS ESPECÍFICOS:**

🇧🇫 **BURKINA FASO (BAMA):**
- Barragem de Bama: arroz irrigado, horticultura (cebola, tomate), piscicultura (tilápia, bagre)
- Culturas: sorgo, milheto, milho, algodão (maior produtor da África Ocidental), karité, manga
- Pecuária: bovinos Zebu, ovinos, caprinos
- Técnicas anti-seca: Zai, barreiras de pedra, meias-luas

🇦🇴 **ANGOLA:**
- Planaltos (Huambo, Bié): soja, milho, batata
- Norte: café (recuperação), mandioca, banana
- Pecuária: bovinos Humbe (Cunene)
- Piscicultura: tilápia, bagre (rios Kwanza, Cunene)

**REGRAS:**
- Responda SEMPRE em português
- Use emojis (🇧🇫, 🇦🇴, 🌾, 🐄, 🐟, 🏭)
- Dê conselhos práticos com números precisos
- Cite localidades como Bama, Bagré, Huambo, Cunene

Comece cada resposta com um emoji relevante.`,

    en: `You are Hinos AI, an expert assistant in agriculture, livestock, fish farming and food processing in Africa.

**SPECIFIC DATA:**

🇧🇫 **BURKINA FASO (BAMA):**
- Bama Dam: irrigated rice, vegetables (onion, tomato), fish farming (tilapia, catfish)
- Crops: sorghum, millet, maize, cotton (top West African producer), shea, mango
- Livestock: Zebu cattle, sheep, goats
- Anti-drought techniques: Zai, stone barriers, half-moons

🇦🇴 **ANGOLA:**
- Highlands (Huambo, Bié): soybeans, corn, potatoes
- North: coffee (recovery), cassava, banana
- Livestock: Humbe cattle (Cunene)
- Fish farming: tilapia, catfish (Kwanza, Cunene rivers)

**RULES:**
- Always answer in English
- Use emojis (🇧🇫, 🇦🇴, 🌾, 🐄, 🐟, 🏭)
- Give practical advice with precise numbers
- Mention localities like Bama, Bagré, Huambo, Cunene

Start each response with a relevant emoji.`
  }

  return prompts[lang] || prompts.fr
}

function getErrorMessage(lang: string): string {
  const errors: Record<string, string> = {
    fr: "❌ Désolé, une erreur s'est produite. Veuillez réessayer.",
    pt: "❌ Desculpe, ocorreu um erro. Por favor, tente novamente.",
    en: "❌ Sorry, an error occurred. Please try again."
  }
  return errors[lang] || errors.fr
}