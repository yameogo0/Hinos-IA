// lib/i18n.ts - Configuration multilingue

export type Language = 'fr' | 'en' | 'pt' | 'es'

export const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
]

// Traductions des messages système
export const translations = {
  fr: {
    welcome: "🌍 Bonjour ! Je suis Hinos AI, votre assistant intelligent spécialisé en agriculture, élevage, pisciculture et transformation alimentaire.\n\nIndiquez-moi votre **pays** et votre **besoin** pour des conseils adaptés à votre situation locale !",
    askCountry: "Quel est votre pays ?",
    askNeed: "De quel domaine souhaitez-vous parler ? (Agriculture, Élevage, Pisciculture, Transformation)",
    error: "❌ Désolé, une erreur s'est produite. Veuillez réessayer.",
    loading: "🤔 Réflexion en cours...",
    placeholder: "Posez votre question sur l'agriculture, l'élevage...",
    send: "Envoyer",
    suggestions: ["🌾 Agriculture au Burkina", "🐄 Élevage en Angola", "🐟 Pisciculture", "🏭 Transformation", "💎 Abonnements"]
  },
  en: {
    welcome: "🌍 Hello! I am Hinos AI, your intelligent assistant specialized in agriculture, livestock, fish farming and food processing.\n\nTell me your **country** and your **need** for advice adapted to your local situation!",
    askCountry: "What is your country?",
    askNeed: "Which area would you like to talk about? (Agriculture, Livestock, Fish farming, Processing)",
    error: "❌ Sorry, an error occurred. Please try again.",
    loading: "🤔 Thinking...",
    placeholder: "Ask your question about agriculture, livestock...",
    send: "Send",
    suggestions: ["🌾 Agriculture in Burkina", "🐄 Livestock in Angola", "🐟 Fish farming", "🏭 Processing", "💎 Subscriptions"]
  },
  pt: {
    welcome: "🌍 Olá! Sou Hinos AI, seu assistente inteligente especializado em agricultura, pecuária, piscicultura e transformação alimentar.\n\nDiga-me seu **país** e sua **necessidade** para conselhos adaptados à sua situação local!",
    askCountry: "Qual é o seu país?",
    askNeed: "Sobre qual área você gostaria de falar? (Agricultura, Pecuária, Piscicultura, Transformação)",
    error: "❌ Desculpe, ocorreu um erro. Por favor, tente novamente.",
    loading: "🤔 Pensando...",
    placeholder: "Faça sua pergunta sobre agricultura, pecuária...",
    send: "Enviar",
    suggestions: ["🌾 Agricultura em Burkina", "🐄 Pecuária em Angola", "🐟 Piscicultura", "🏭 Transformação", "💎 Assinaturas"]
  },
  es: {
    welcome: "🌍 ¡Hola! Soy Hinos AI, tu asistente inteligente especializado en agricultura, ganadería, piscicultura y transformación alimentaria.\n\n¡Dime tu **país** y tu **necesidad** para consejos adaptados a tu situación local!",
    askCountry: "¿Cuál es tu país?",
    askNeed: "¿De qué área quieres hablar? (Agricultura, Ganadería, Piscicultura, Transformación)",
    error: "❌ Lo siento, ocurrió un error. Por favor, inténtalo de nuevo.",
    loading: "🤔 Pensando...",
    placeholder: "Haz tu pregunta sobre agricultura, ganadería...",
    send: "Enviar",
    suggestions: ["🌾 Agricultura en Burkina", "🐄 Ganadería en Angola", "🐟 Piscicultura", "🏭 Transformación", "💎 Suscripciones"]
  }
}

// Données par pays traduites
export const countryDataMultilingual = {
  fr: {
    "burkina faso": {
      agriculture: "Sorgho, millet, maïs, niébé, coton (1er producteur Afrique Ouest), sésame, karité, mangue",
      elevage: "Bovins (Zébu), ovins, caprins, volaille",
      pisciculture: "Tilapia, poisson-chat, carpe (barrages de Bama, Bagré, Kompienga)",
      conseils: "Utilisez le Zaï, les cordons pierreux et les demi-lunes pour retenir l'eau"
    },
    angola: {
      agriculture: "Maïs, manioc, banane, café, sisal, soja, coton",
      elevage: "Bovins (Humbe), ovins, caprins, porcins",
      pisciculture: "Tilapia, poisson-chat, bar (fleuves Kwanza, Cunene)",
      conseils: "Visez le marché de Luanda, investissez dans la transformation"
    }
  },
  en: {
    "burkina faso": {
      agriculture: "Sorghum, millet, maize, cowpea, cotton (top West African producer), sesame, shea, mango",
      livestock: "Cattle (Zebu), sheep, goats, poultry",
      fishFarming: "Tilapia, catfish, carp (Bama, Bagré, Kompienga dams)",
      tips: "Use Zai, stone barriers and half-moons to retain water"
    },
    angola: {
      agriculture: "Corn, cassava, banana, coffee, sisal, soy, cotton",
      livestock: "Cattle (Humbe), sheep, goats, pigs",
      fishFarming: "Tilapia, catfish, seabass (Kwanza, Cunene rivers)",
      tips: "Target the Luanda market, invest in processing"
    }
  },
  pt: {
    "burkina faso": {
      agriculture: "Sorgo, milheto, milho, feijão-fradinho, algodão (maior produtor da África Ocidental), gergelim, karité, manga",
      pecuaria: "Bovinos (Zebu), ovinos, caprinos, aves",
      piscicultura: "Tilápia, bagre, carpa (barragens de Bama, Bagré, Kompienga)",
      dicas: "Use Zai, barreiras de pedra e meias-luas para reter água"
    },
    angola: {
      agriculture: "Milho, mandioca, banana, café, sisal, soja, algodão",
      pecuaria: "Bovinos (Humbe), ovinos, caprinos, suínos",
      piscicultura: "Tilápia, bagre, robalo (rios Kwanza, Cunene)",
      dicas: "Mire no mercado de Luanda, invista no processamento"
    }
  },
  es: {
    "burkina faso": {
      agriculture: "Sorgo, mijo, maíz, caupí, algodón (mayor productor de África Occidental), sésamo, karité, mango",
      ganaderia: "Bovinos (Cebú), ovinos, caprinos, aves",
      piscicultura: "Tilapia, bagre, carpa (presas de Bama, Bagré, Kompienga)",
      consejos: "Use Zai, barreras de piedra y medias lunas para retener agua"
    },
    angola: {
      agriculture: "Maíz, yuca, plátano, café, sisal, soja, algodón",
      ganaderia: "Bovinos (Humbe), ovinos, caprinos, porcinos",
      piscicultura: "Tilapia, bagre, lubina (ríos Kwanza, Cunene)",
      consejos: "Apunte al mercado de Luanda, invierta en procesamiento"
    }
  }
}
