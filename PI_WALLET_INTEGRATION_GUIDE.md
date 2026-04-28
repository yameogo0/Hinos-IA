# Guide d'Intégration Wallet Pi pour Hinos IA

## 📋 Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Configuration du Wallet Pi](#configuration-du-wallet-pi)
3. [Intégration des Paiements](#intégration-des-paiements)
4. [Flux de Paiement](#flux-de-paiement)
5. [Gestion des Transactions](#gestion-des-transactions)
6. [Vérification des Paiements](#vérification-des-paiements)

## Vue d'ensemble

Le wallet Pi vous permet de recevoir des paiements en Pi directement dans votre application Hinos IA. Cette intégration utilise le SDK Pi Network officiel.

### Avantages
- ✅ Paiements sécurisés et immédiats
- ✅ Vérification automatique des transactions
- ✅ Gestion des abonnements par tier
- ✅ Historique des transactions

## Configuration du Wallet Pi

### 1. Créer un compte développeur Pi Network

1. Accédez à https://developers.minepi.com
2. Connectez-vous avec votre compte Pi
3. Créez une nouvelle application
4. Notez votre **App ID** et **API Key**

### 2. Configuration Backend

Créez un fichier `.env.local` avec :

\`\`\`env
# Pi Network Configuration
NEXT_PUBLIC_PI_APP_ID=YOUR_APP_ID
PI_API_KEY=YOUR_API_KEY
PI_API_ENDPOINT=https://api.minepi.com
NEXT_PUBLIC_PI_NETWORK_SANDBOX=true  # false en production
\`\`\`

### 3. Configuration Wallet

Votre wallet Pi Network se crée automatiquement lors de la première authentification. L'adresse du wallet sera stockée avec votre profil utilisateur.

## Intégration des Paiements

### Structure des Abonnements

| Plan | Prix | Durée | Limite Questions |
|------|------|-------|------------------|
| Basic | Gratuit | - | 10/mois |
| Pro Weekly | 5.99π | 7 jours | Illimité |
| Premium | 19.99π | 30 jours | Illimité |

### Hook usePaymentPi

\`\`\`typescript
const { processPayment, verifyPayment, transactionStatus } = usePaymentPi(piAccessToken)

// Initier un paiement
const result = await processPayment({
  amount: 5.99,
  memo: "Hinos IA - Pro Weekly",
  metadata: { tier: "weekly" }
})

// Vérifier le paiement
const verified = await verifyPayment(result.transactionId)
\`\`\`

## Flux de Paiement

### 1. Utilisateur clique "Upgrade"

\`\`\`
Utilisateur clique sur un plan → Modal de paiement s'ouvre
\`\`\`

### 2. Création du paiement

\`\`\`typescript
POST /api/payment/create
{
  "amount": 5.99,
  "currency": "pi",
  "memo": "Hinos IA Pro Weekly",
  "metadata": {
    "tier": "weekly",
    "userId": "pi_uid_xxx"
  }
}

Response:
{
  "transactionId": "tx_xxx",
  "amount": 5.99,
  "status": "pending",
  "paymentUrl": "pi://pay/tx_xxx"
}
\`\`\`

### 3. Approbation par l'utilisateur

L'utilisateur approuve le paiement dans son wallet Pi (ou dans l'app mobile)

### 4. Complétude et vérification

\`\`\`typescript
POST /api/payment/verify
{
  "transactionId": "tx_xxx"
}

Response:
{
  "verified": true,
  "txid": "blockchain_txid",
  "status": "completed",
  "tier": "weekly"
}
\`\`\`

### 5. Mise à jour de l'abonnement

Une fois vérifié, l'abonnement de l'utilisateur passe de "free" à "weekly" ou "monthly"

## Gestion des Transactions

### Stockage des Transactions

\`\`\`typescript
interface Transaction {
  id: string // transactionId unique
  userId: string
  amount: number
  currency: "pi"
  tier: "weekly" | "monthly"
  status: "pending" | "completed" | "failed"
  txid: string | null // blockchain txid
  createdAt: Date
  completedAt?: Date
}
\`\`\`

### Base de données (exemple avec PostgreSQL)

\`\`\`sql
CREATE TABLE transactions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 4),
  currency VARCHAR(10),
  tier VARCHAR(50),
  status VARCHAR(50),
  txid VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(pi_uid)
);
\`\`\`

## Vérification des Paiements

### Vérification Côté Client

\`\`\`typescript
// Dans use-pi-wallet.ts
const verifyPayment = async (transactionId: string) => {
  const maxRetries = 10
  let retries = 0
  
  while (retries < maxRetries) {
    const response = await fetch(`/api/payment/verify`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${piAccessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ transactionId })
    })
    
    const data = await response.json()
    if (data.verified) {
      return data // ✅ Paiement confirmé
    }
    
    // Attendre et réessayer
    await new Promise(r => setTimeout(r, 2000))
    retries++
  }
  
  throw new Error("Paiement non complété")
}
\`\`\`

### Webhook Pi Network (Optionnel)

\`\`\`typescript
// app/api/webhook/pi/route.ts
export async function POST(req: Request) {
  const signature = req.headers.get("x-pi-signature")
  const body = await req.text()
  
  // Vérifier la signature
  if (!verifyPiSignature(body, signature)) {
    return Response.json({ error: "Invalid signature" }, { status: 401 })
  }
  
  const event = JSON.parse(body)
  
  if (event.type === "payment_completed") {
    // Mettre à jour l'abonnement
    await updateSubscription(event.data.metadata.userId, event.data.metadata.tier)
  }
  
  return Response.json({ success: true })
}
\`\`\`

## Exemples d'Intégration

### Component: Boutton d'Upgrade

\`\`\`typescript
import { usePiWallet } from "@/hooks/use-pi-wallet"

function UpgradeButton({ tier }: { tier: "weekly" | "monthly" }) {
  const { processPayment, isLoading } = usePiWallet(piAccessToken)
  const [status, setStatus] = useState<string>("")
  
  const handleUpgrade = async () => {
    try {
      setStatus("Initiation du paiement...")
      const amount = tier === "weekly" ? 5.99 : 19.99
      
      const result = await processPayment({
        amount,
        memo: `Hinos IA - ${tier === "weekly" ? "Pro Weekly" : "Premium"}`,
        metadata: { tier }
      })
      
      setStatus("Paiement en attente de confirmation...")
      // Rediriger ou afficher le statut
    } catch (error) {
      setStatus("Erreur: " + (error as Error).message)
    }
  }
  
  return (
    <button onClick={handleUpgrade} disabled={isLoading}>
      {isLoading ? "Traitement..." : `Passer à ${tier}`}
    </button>
  )
}
\`\`\`

## Sécurité

### Bonnes pratiques

1. **Validation côté serveur** : Vérifiez TOUJOURS les transactions côté backend
2. **Signatures** : Validez les signatures Pi Network pour les webhooks
3. **Variables d'env** : Gardez votre API Key hors du code client
4. **Timeouts** : Implémentiez des timeouts pour les paiements en attente
5. **Logs** : Loguez toutes les transactions pour audit

### Validation de Signature Exemple

\`\`\`typescript
import crypto from "crypto"

function verifyPiSignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac("sha256", process.env.PI_API_KEY || "")
    .update(body)
    .digest("hex")
  
  return hash === signature
}
\`\`\`

## Dépannage

### Le paiement reste en attente

- Vérifiez que l'utilisateur a approuvé dans son wallet Pi
- Vérifiez votre clé API et les variables d'env
- Consultez les logs de Pi Network

### La vérification échoue

- Vérifiez le transactionId
- Vérifiez la connectivité réseau
- Réessayez après quelques secondes

### Erreur "Invalid signature"

- Vérifiez que PI_API_KEY est correct
- Assurez-vous que la signature est valide

## Ressources

- 📖 [Documentation Pi Network](https://developers.minepi.com/docs)
- 🔑 [Dashboard Développeur](https://developers.minepi.com/dashboard)
- 💬 [Support Pi](https://minepi.com/contact)
- 📚 [SDK Pi JavaScript](https://github.com/pi-apps/pi-sdk-javascript)

---

**Version**: 1.0  
**Dernière mise à jour**: 2024  
**Hinos IA** - Votre Partenaire IA pour l'Excellence
