import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"  // ← Cette ligne est correcte, l'erreur est un faux positif

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Hinos IA",
  description: "Votre Partenaire Intelligence Artificielle pour une Production Animale et Agroalimentaire d'Excellence",
    generator: 'v0.app'
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7C3AED",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
