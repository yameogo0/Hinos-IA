import { groq } from '@ai-sdk/groq'
import { generateText } from 'ai'
import { NextRequest } from 'next/server'

// 🔑 Votre clé Groq
const GROQ_API_KEY = "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"

// 🔍 Fonction pour détecter automatiquement la langue
function detectLanguage(text: string): string {
  const textLower = text.toLowerCase()
  
  // Mots-clés portugais
  const portugueseKeywords = ['obrigado', 'obrigada', 'por favor', 'oi', 'olá', 'tudo bem', 'como vai', 'obg', 'bom dia', 'boa tarde', 'boa noite', 'legal', 'amigo']
  
  // Mots-clés anglais
  const englishKeywords = ['hello', 'hi', 'thank you', 'please', 'good morning', 'good afternoon', 'good evening', 'how are you', 'thanks', 'hey']
  
  // Mots-clés français
  const frenchKeywords = ['bonjour', 'merci', 's\'il vous plaît', 'stp', 'svp', 'salut', 'coucou', 'bonsoir', 'comment ça va', 'ça va', 'bonsoir']
  
  for (const word of portugueseKeywords) {
    if (textLower.includes(word)) return 'pt'
  }
  
  for (const word of englishKeywords) {
    if (textLower.includes(word)) return 'en'
  }
  
  for (const word of frenchKeywords) {
    if (textLower.includes(word)) return 'fr'
  }
  
  return 'fr' // Par défaut
}

export async function POST(request: NextRequest) {
  let language = 'fr'

  try {
    const body = await request.json()
    let { message } = body
    
    // Détection automatique de la langue
    const detectedLanguage = detectLanguage(message)
    
    // Si l'utilisateur a choisi une langue manuellement, on utilise celle-ci
    // Sinon on utilise la langue détectée
    language = body.language || detectedLanguage
    
    console.log("📩 Message reçu:", message)
    console.log("🔍 Langue détectée automatiquement:", detectedLanguage)
    console.log("🌍 Langue utilisée pour la réponse:", language)

    if (!message) {
      return Response.json({ error: "Message requis" }, { status: 400 })
    }

    const systemPrompt = getSystemPrompt(language)

    process.env.GROQ_API_KEY = GROQ_API_KEY

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      prompt: message,
      system: systemPrompt,
      temperature: 0.7,
    })

    console.log("✅ Réponse générée par Groq")
    return Response.json({ response: text })

  } catch (error: any) {
    console.error("❌ Erreur:", error.message)
    return Response.json({ 
      response: getErrorMessage(language)
    })
  }
}

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
- Si l'utilisateur ne mentionne pas son pays, demande-le lui

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
- Se o usuário não mencionar seu país, pergunte a ele

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
- If the user doesn't mention their country, ask for it

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