'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Plus, 
  X, 
  Search, 
  Edit2, 
  Save, 
  Download, 
  Upload, 
  Trash2,
  Filter,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  FolderOpen,
  FileText,
  Tag,
  Clock
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface KnowledgeItem {
  id: string
  question: string
  answer: string
  category: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  isActive: boolean
  usageCount: number
}

const CATEGORIES = [
  { value: 'general', label: '📚 Général', color: 'bg-blue-100 text-blue-800' },
  { value: 'pricing', label: '💰 Tarification', color: 'bg-green-100 text-green-800' },
  { value: 'subscription', label: '⭐ Abonnement', color: 'bg-purple-100 text-purple-800' },
  { value: 'payment', label: '💳 Paiement', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'technical', label: '🔧 Technique', color: 'bg-gray-100 text-gray-800' },
  { value: 'support', label: '🎧 Support', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'production', label: '🐄 Production', color: 'bg-orange-100 text-orange-800' },
  { value: 'market', label: '📈 Marché', color: 'bg-indigo-100 text-indigo-800' },
]

const SUGGESTED_QUESTIONS = [
  "Comment optimiser l'alimentation des vaches ?",
  "Quels sont les signes d'une maladie aviaire ?",
  "Comment réduire les coûts de production ?",
  "Quelle est la tendance du prix du lait ?",
  "Comment améliorer la fertilité du troupeau ?",
]

export default function KnowledgeManager() {
  const [items, setItems] = useState<KnowledgeItem[]>([])
  const [filteredItems, setFilteredItems] = useState<KnowledgeItem[]>([])
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [category, setCategory] = useState('general')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Charger les données depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem('hinos_knowledge_base')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setItems(parsed.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt)
        })))
      } catch (e) {
        console.error('Erreur chargement:', e)
      }
    }
  }, [])

  // Sauvegarder dans localStorage
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem('hinos_knowledge_base', JSON.stringify(items))
    }
  }, [items])

  // Filtrer les items
  useEffect(() => {
    let filtered = items.filter(item => item.isActive !== false)
    
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }
    
    setFilteredItems(filtered)
  }, [items, searchTerm, selectedCategory])

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const addItem = () => {
    if (!question.trim() || !answer.trim()) {
      toast({
        title: '❌ Erreur',
        description: 'Veuillez remplir la question et la réponse',
        variant: 'destructive',
      })
      return
    }

    const newItem: KnowledgeItem = {
      id: Date.now().toString(),
      question: question.trim(),
      answer: answer.trim(),
      category,
      tags,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      usageCount: 0,
    }

    setItems([...items, newItem])
    resetForm()
    
    toast({
      title: '✅ Succès',
      description: 'Élément ajouté à la base de connaissances',
    })
  }

  const updateItem = () => {
    if (!editingId) return
    
    setItems(items.map(item =>
      item.id === editingId
        ? {
            ...item,
            question: question.trim(),
            answer: answer.trim(),
            category,
            tags,
            updatedAt: new Date(),
          }
        : item
    ))
    
    resetForm()
    setEditingId(null)
    
    toast({
      title: '✅ Mis à jour',
      description: 'Élément modifié avec succès',
    })
  }

  const deleteItem = (id: string) => {
    if (confirm('Supprimer définitivement cet élément ?')) {
      setItems(items.filter(item => item.id !== id))
      toast({
        title: '🗑️ Supprimé',
        description: 'Élément retiré de la base',
      })
    }
  }

  const resetForm = () => {
    setQuestion('')
    setAnswer('')
    setCategory('general')
    setTags([])
    setTagInput('')
  }

  const startEdit = (item: KnowledgeItem) => {
    setEditingId(item.id)
    setQuestion(item.question)
    setAnswer(item.answer)
    setCategory(item.category)
    setTags(item.tags)
  }

  const cancelEdit = () => {
    resetForm()
    setEditingId(null)
  }

  const exportData = () => {
    const dataStr = JSON.stringify(items, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `hinos_knowledge_${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
    
    toast({
      title: '📥 Export réussi',
      description: `${items.length} éléments exportés`,
    })
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string)
        setItems(imported)
        toast({
          title: '📤 Import réussi',
          description: `${imported.length} éléments importés`,
        })
      } catch (error) {
        toast({
          title: '❌ Erreur',
          description: 'Fichier JSON invalide',
          variant: 'destructive',
        })
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  const clearAll = () => {
    if (confirm('⚠️ Supprimer TOUTE la base de connaissances ? Cette action est irréversible.')) {
      setItems([])
      localStorage.removeItem('hinos_knowledge_base')
      toast({
        title: '🗑️ Base vidée',
        description: 'Tous les éléments ont été supprimés',
      })
    }
  }

  const incrementUsage = (id: string) => {
    setItems(items.map(item =>
      item.id === id
        ? { ...item, usageCount: (item.usageCount || 0) + 1 }
        : item
    ))
  }

  const stats = useMemo(() => ({
    total: items.length,
    active: items.filter(i => i.isActive !== false).length,
    categories: new Set(items.map(i => i.category)).size,
    mostUsed: [...items].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0)).slice(0, 3),
  }), [items])

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Header avec stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Éléments totaux</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-50 to-green-100">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-600">Actifs</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{stats.categories}</div>
            <div className="text-sm text-gray-600">Catégories</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-orange-600">
              {stats.mostUsed[0]?.usageCount || 0}
            </div>
            <div className="text-sm text-gray-600">Questions posées</div>
          </CardContent>
        </Card>
      </div>

      {/* Formulaire d'ajout/édition */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            {editingId ? '✏️ Modifier la connaissance' : '📚 Ajouter à la base de connaissances'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Question / Sujet</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ex: Comment améliorer la production laitière ?"
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Réponse détaillée</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Entrez la réponse détaillée avec instructions..."
              rows={4}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Catégorie</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tags (mots-clés)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  placeholder="Ajouter un tag..."
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                <Button type="button" onClick={addTag} size="sm">Ajouter</Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 rounded-full">
                    <Tag className="h-3 w-3" />
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-red-500">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {editingId ? (
              <>
                <Button onClick={updateItem} className="flex-1 bg-green-600 hover:bg-green-700">
                  <Save className="mr-2 h-4 w-4" />
                  Mettre à jour
                </Button>
                <Button onClick={cancelEdit} variant="outline" className="flex-1">
                  Annuler
                </Button>
              </>
            ) : (
              <Button onClick={addItem} className="w-full bg-purple-600 hover:bg-purple-700">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter à la base
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Barre d'outils */}
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportData} size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          <label className="cursor-pointer">
            <input type="file" accept=".json" onChange={importData} className="hidden" />
            <Button variant="outline" size="sm" type="button">
              <Upload className="mr-2 h-4 w-4" />
              Importer
            </Button>
          </label>
          <Button variant="outline" onClick={clearAll} size="sm" className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Tout effacer
          </Button>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filtres
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-3 py-2 border rounded-lg w-64"
          />
        </div>
      </div>

      {/* Filtres */}
      {showFilters && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('all')}
                size="sm"
              >
                Toutes
              </Button>
              {CATEGORIES.map(cat => (
                <Button
                  key={cat.value}
                  variant={selectedCategory === cat.value ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(cat.value)}
                  size="sm"
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggestions rapides */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-gray-500">Suggestions :</span>
        {SUGGESTED_QUESTIONS.map((q, i) => (
          <Button
            key={i}
            variant="ghost"
            size="sm"
            onClick={() => setQuestion(q)}
            className="text-xs"
          >
            {q}
          </Button>
        ))}
      </div>

      {/* Liste des connaissances */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          📖 Base de connaissances ({filteredItems.length})
        </h2>
        
        {filteredItems.length === 0 ? (
          <Card className="bg-gray-50">
            <CardContent className="pt-8 text-center text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>Aucun élément trouvé</p>
              <p className="text-sm">Ajoutez votre première connaissance ci-dessus</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg">{item.question}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          CATEGORIES.find(c => c.value === item.category)?.color || 'bg-gray-100'
                        }`}>
                          {CATEGORIES.find(c => c.value === item.category)?.label}
                        </span>
                        {item.tags.map(tag => (
                          <span key={tag} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      
                      {expandedId === item.id ? (
                        <p className="text-gray-700 mt-2 whitespace-pre-wrap">{item.answer}</p>
                      ) : (
                        <p className="text-gray-600 mt-2 line-clamp-2">{item.answer}</p>
                      )}
                      
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(item.updatedAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {item.usageCount || 0} utilisations
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                      >
                        {expandedId === item.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(item)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
