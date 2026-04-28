# Hinos IA - Configuration et Installation

## Vue d'ensemble

Hinos IA est une plateforme de messagerie intelligente alimentée par l'IA qui transforme vos conversations en expériences productives. L'application est intégrée avec Pi Network pour les paiements et l'authentification.

## Fonctionnalités Principales

### Plans d'Abonnement

#### 🆓 Plan Gratuit
- Assistant IA basique (10 requêtes/jour)
- Correction grammaticale automatique
- Résumé de conversations (max 500 mots)
- Suggestions de réponses basiques
- 1GB de stockage IA

#### 💎 Plan Pro (0.0009π/mois)
- Assistant IA avancé (1000 requêtes/jour)
- Rédaction IA avec style personnalisé
- Traduction en temps réel
- Analyse de sentiment des conversations
- Résumé intelligent avec points d'action
- **Analyse d'images par IA** (GPT-4 Vision)
- Transcription audio→texte (5h/mois)
- Recherche sémantique dans l'historique
- 10GB de stockage IA

#### 🏢 Plan Business (0.0108π/mois/utilisateur)
- Tout Pro +
- Requêtes illimitées
- IA dédiée par équipe
- Modèles personnalisables
- Analyse de données avancée
- Support prioritaire

## Configuration

### 1. Variables d'Environnement

Créez un fichier `.env.local` à la racine du projet :

\`\`\`env
# Pi Network Configuration (déjà configuré dans system-config.ts)
# Ces valeurs sont gérées automatiquement par le SDK Pi

# OpenAI API (Optionnel - Pour l'analyse d'images)
OPENAI_API_KEY=your_openai_api_key_here
\`\`\`

### 2. Analyse d'Images (Optionnel)

Pour activer l'analyse d'images par IA pour les abonnés Pro/Business :

1. Créez un compte sur [OpenAI Platform](https://platform.openai.com/)
2. Générez une clé API
3. Ajoutez la clé dans `.env.local` : `OPENAI_API_KEY=sk-...`

**Note :** Sans clé OpenAI, l'analyse d'images retournera un message de démonstration.

### 3. Configuration Backend (Production)

Pour la production, remplacez le système de stockage en mémoire par une vraie base de données :

#### Fichiers à modifier :
- `/app/api/subscription/validate/route.ts`
- `/app/api/subscription/increment/route.ts`
- `/app/api/subscription/update/route.ts`

#### Recommandations :
- Utilisez PostgreSQL, MongoDB ou Firebase pour stocker :
  - Informations d'abonnement utilisateur
  - Compteur de requêtes quotidiennes
  - Historique des paiements Pi
  - Métadonnées des conversations

## Architecture Technique

### Frontend
- **Framework :** Next.js 15 (App Router)
- **UI :** shadcn/ui + Tailwind CSS
- **Gestion d'état :** React Hooks personnalisés
- **Authentification :** Pi Network SDK

### Backend (API Routes)
- **Validation d'abonnement :** `/api/subscription/validate`
- **Incrémentation de requêtes :** `/api/subscription/increment`
- **Mise à jour d'abonnement :** `/api/subscription/update`
- **Analyse d'images :** `/api/analyze-image`

### Intégration Pi Network
- **Authentification :** Automatique via SDK Pi
- **Paiements :** Flow App-to-App avec callbacks
- **Approval URL :** Configuré dans `system-config.ts`
- **Completion URL :** Configuré dans `system-config.ts`

## Flux de Paiement Pi

1. **Utilisateur sélectionne un plan** (Pro ou Business)
2. **Initialisation du paiement** via `window.Pi.createPayment()`
3. **Approval :** Backend valide le paiement
4. **Completion :** Backend confirme la transaction
5. **Activation :** Abonnement mis à jour dans la base de données

## Sécurité

### Points Importants :
- ✅ Le SDK Pi gère l'authentification automatiquement
- ✅ Les tokens Pi sont validés côté backend
- ✅ Les paiements passent par les callbacks Pi officiels
- ⚠️ **IMPORTANT :** Ne jamais exposer votre clé OpenAI côté client
- ⚠️ En production, validez tous les tokens Pi avec l'API Pi Network

## Déploiement

### Vercel (Recommandé)
\`\`\`bash
# Installation
npm install

# Déploiement
vercel --prod
\`\`\`

### Variables d'environnement Vercel :
1. Allez dans votre projet Vercel
2. Settings → Environment Variables
3. Ajoutez : `OPENAI_API_KEY` (si utilisé)

## Limites de Requêtes

Les limites sont appliquées à deux niveaux :
1. **Frontend :** Vérification locale via localStorage
2. **Backend :** Validation serveur via API routes

### Reset quotidien :
- Les compteurs se réinitialisent automatiquement à minuit
- La date de reset est stockée pour chaque utilisateur

## Support et Documentation

- **Pi Network SDK :** [https://developers.minepi.com](https://developers.minepi.com)
- **OpenAI API :** [https://platform.openai.com/docs](https://platform.openai.com/docs)
- **Next.js :** [https://nextjs.org/docs](https://nextjs.org/docs)

## Notes de Développement

### Fichiers Verrouillés :
- `hooks/use-pi-network-authentication.ts` - Ne pas modifier (gère l'authentification Pi)

### Personnalisation :
- Couleurs : `/lib/app-config.ts` (COLORS)
- Plans : `/lib/subscription-types.ts` (SUBSCRIPTION_PLANS)
- Messages : `/lib/app-config.ts` (APP_CONFIG)

## Test Local

\`\`\`bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Ouvrir http://localhost:3000
\`\`\`

**Note :** Le Pi SDK fonctionne mieux en production. En développement, utilisez le mode sandbox Pi Network.
