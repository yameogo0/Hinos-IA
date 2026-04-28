# Configuration OpenAI pour Hinos IA

## Problème actuel
Hinos IA fonctionne actuellement en mode dégradé. Sans la clé API OpenAI, l'application utilise une base de connaissances locale mais ne peut pas générer de réponses IA avancées.

## Solution: Ajouter votre clé OpenAI API

### Étape 1: Créer un compte OpenAI
1. Allez sur https://platform.openai.com/
2. Inscrivez-vous ou connectez-vous
3. Acceptez les conditions

### Étape 2: Générer une clé API
1. Cliquez sur votre profil (coin supérieur droit)
2. Sélectionnez "API keys"
3. Cliquez sur "Create new secret key"
4. Nommez-la (ex: "Hinos IA")
5. Copiez la clé - elle ne s'affichera qu'une fois!

### Étape 3: Ajouter à votre projet
1. Cliquez sur les "Settings" (⚙️) en haut à droite de v0
2. Allez dans "Vars"
3. Ajoutez une nouvelle variable:
   - **Clé**: `OPENAI_API_KEY`
   - **Valeur**: Collez votre clé API
4. Sauvegardez

### Étape 4: Redémarrer l'app
L'application redémarrera automatiquement avec la clé configurée. Hinos IA répondra maintenant avec l'IA complète!

## Coûts et tarification
- **Modèle utilisé**: gpt-4o-mini (très économique)
- **Prix**: ~0.15¢ par 1000 tokens (entrée/sortie)
- **Estimation**: 1000 questions = environ 15¢

## Dépannage

### Les réponses sont toujours génériques?
- Vérifiez que la clé est bien dans les variables d'environnement
- Relancez l'application (refresh du navigateur)
- Vérifiez que la clé commence par `sk-`

### Erreur "Invalid API key"?
- Assurez-vous d'avoir copié la clé complète
- Les clés OpenAI commencent par `sk-proj-`
- Vérifiez que vous n'avez pas d'espaces avant/après

### Le modèle gpt-4o-mini n'existe pas?
- Votre compte OpenAI doit avoir accès à ce modèle (modèle récent)
- Sinon, utilisez `gpt-3.5-turbo` (compatible et gratuit)

## Avec et sans clé API

**Mode sans clé (actuellement active)**:
- Réponses basées sur la base de connaissances
- Détection simple de mots-clés
- Pas de frais

**Mode avec clé (recommandé)**:
- Réponses intelligentes et contextualisées
- Compréhension naturelle du langage
- Frais minimes (~0.15¢ par question)

---
**Prêt?** Suivez les étapes ci-dessus pour passer au mode IA complet!
