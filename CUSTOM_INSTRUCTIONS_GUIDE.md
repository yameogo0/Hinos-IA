## Guide: Répondre aux Questions avec Custom Instructions et Knowledge Base

### Vue d'ensemble
Hinos IA répond maintenant aux questions en utilisant:
1. **Base de Connaissances**: Une collection de questions/réponses configurées
2. **Instructions Personnalisées**: Le ton, style et expertise de l'IA
3. **Système de Matching**: Recherche intelligente des meilleures réponses

### Comment ça fonctionne

#### 1. Base de Connaissances (`/app/api/chat/route.ts`)
\`\`\`typescript
knowledgeBase = [
  {
    question: "Qu'est-ce que Hinos IA?",
    answer: "Hinos IA est votre partenaire IA...",
    category: "general"
  }
]
\`\`\`

- **Question**: Le sujet ou question
- **Answer**: La réponse complète
- **Category**: Catégorie pour l'organisation

#### 2. Ajouter des Éléments de Connaissance
1. Allez à `/components/knowledge-manager.tsx`
2. Entrez une question et sa réponse
3. Sélectionnez une catégorie
4. Cliquez "Ajouter à la base de connaissances"

#### 3. Configurer les Instructions Personnalisées
1. Accédez à `/app/settings`
2. Définissez:
   - **Objectif Principal**: Ce que Hinos IA fait
   - **Ton et Style**: Comment communiquer
   - **Domaine d'Expertise**: Spécialités
   - **Format de Réponse**: Structure des réponses
   - **Règles**: Directives supplémentaires

#### 4. Comment Hinos IA Répond

**Étape 1**: L'utilisateur pose une question
\`\`\`
"Qu'est-ce que Hinos IA?"
\`\`\`

**Étape 2**: Le système cherche dans la base
- Recherche exacte: Correspond-elle parfaitement?
- Recherche par mots-clés: Y a-t-il des correspondances partielles?

**Étape 3**: Retourner la réponse
- Si trouvée: Répondre avec l'élément de connaissance
- Si non trouvée: Générer une réponse en utilisant les instructions (en attendant une vraie IA)

### Exemples de Configuration

#### Base de Connaissance - Production Animale
\`\`\`
Q: "Comment optimiser la production laitière?"
A: "Pour optimiser la production laitière: 1) Améliorer la nutrition avec des aliments riches en protéines 2) Maintenir un programme de traite régulier 3) Surveiller la santé du troupeau..."
\`\`\`

#### Instructions Personnalisées - Agroalimentaire
\`\`\`
Objectif: Expert en optimisation agroalimentaire
Ton: Professionnel mais accessible
Expertise: Qualité alimentaire, sécurité sanitaire, optimisation de production
Rules: 
- Toujours citer les sources si possible
- Proposer des solutions basées sur les meilleures pratiques
- Être transparent sur les limitations
\`\`\`

### Intégration avec l'API

L'API `/api/chat` effectue automatiquement:
1. Normalise la question (minuscules, trim)
2. Cherche dans la base de connaissances
3. Retourne la meilleure correspondance
4. Sinon, génère une réponse par défaut

### Prochaines Étapes

1. **Ajouter votre Base de Connaissances**:
   - Listez les questions fréquentes
   - Écrivez des réponses détaillées et utiles
   - Organisez-les par catégorie

2. **Configurer vos Instructions**:
   - Définissez le ton de votre IA
   - Spécifiez votre expertise
   - Énoncez vos valeurs

3. **Tester et Itérer**:
   - Posez des questions à Hinos IA
   - Vérifiez les réponses
   - Ajoutez ou mettez à jour les éléments de connaissance

### Structure de la Base de Données

\`\`\`typescript
interface KnowledgeItem {
  id: string
  question: string
  answer: string
  category: string
}

interface SystemInstructions {
  name: string
  purpose: string
  tone: string
  expertise: string
  responseFormat: string
  rules: string[]
}
\`\`\`

Chaque élément de connaissance contient une question, sa réponse complète et une catégorie pour l'organisation. Les instructions système définissent comment Hinos IA devrait se comporter et communiquer.
