'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

export default function CustomInstructionsPage() {
  const [instructions, setInstructions] = useState({
    purpose: 'Assistant intelligent pour la production animale et l\'agroalimentaire',
    tone: 'Professionnel, utile et courtois',
    expertise: 'Production animale, qualité alimentaire, optimisation agricole',
    responseFormat: 'Réponses claires, concises et actionnables',
  })

  const [rules, setRules] = useState<string[]>([
    'Répondre toujours en français',
    'Être précis et basé sur les faits',
    'Fournir des solutions pratiques',
  ])

  const [newRule, setNewRule] = useState('')
  const { toast } = useToast()

  const updateInstruction = (key: keyof typeof instructions, value: string) => {
    setInstructions({ ...instructions, [key]: value })
  }

  const addRule = () => {
    if (!newRule.trim()) return
    setRules([...rules, newRule.trim()])
    setNewRule('')
    toast({
      title: 'Règle ajoutée',
      description: 'Nouvelle règle d\'instruction ajoutée.',
    })
  }

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index))
  }

  const saveInstructions = () => {
    console.log('[v0] Saving instructions:', { instructions, rules })
    toast({
      title: 'Instructions mises à jour',
      description: 'Les instructions personnalisées de Hinos IA ont été enregistrées.',
    })
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Instructions Personnalisées de Hinos IA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Objectif Principal</label>
            <Textarea
              value={instructions.purpose}
              onChange={(e) => updateInstruction('purpose', e.target.value)}
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Ton et Style</label>
            <Textarea
              value={instructions.tone}
              onChange={(e) => updateInstruction('tone', e.target.value)}
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Domaine d'Expertise</label>
            <Textarea
              value={instructions.expertise}
              onChange={(e) => updateInstruction('expertise', e.target.value)}
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Format de Réponse</label>
            <Textarea
              value={instructions.responseFormat}
              onChange={(e) => updateInstruction('responseFormat', e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Règles d'Instruction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addRule()}
              placeholder="Ajouter une nouvelle règle..."
              className="flex-1 px-3 py-2 border rounded-lg"
            />
            <Button onClick={addRule}>Ajouter</Button>
          </div>

          <div className="space-y-2">
            {rules.map((rule, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                <span>{rule}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRule(index)}
                >
                  Supprimer
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button onClick={saveInstructions} size="lg" className="w-full">
        Enregistrer les Instructions
      </Button>
    </div>
  )
}
