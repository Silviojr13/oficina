'use client'

import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ProductCard } from '@/components/product-card'
import { produtos, categorias, marcas } from '@/lib/mock-data'

// Definição do componente FilterContent como um componente filho
function FilterContent({ 
  selectedCategoria, 
  setSelectedCategoria, 
  selectedMarcas, 
  toggleMarca, 
  precoMin, 
  setPrecoMin, 
  precoMax, 
  setPrecoMax, 
  apenasPromocao, 
  setApenasPromocao, 
  apenasEstoque, 
  setApenasEstoque, 
  limparFiltros, 
  temFiltrosAtivos 
}: {
  selectedCategoria: string;
  setSelectedCategoria: (value: string) => void;
  selectedMarcas: string[];
  toggleMarca: (marca: string) => void;
  precoMin: string;
  setPrecoMin: (value: string) => void;
  precoMax: string;
  setPrecoMax: (value: string) => void;
  apenasPromocao: boolean;
  setApenasPromocao: (value: boolean) => void;
  apenasEstoque: boolean;
  setApenasEstoque: (value: boolean) => void;
  limparFiltros: () => void;
  temFiltrosAtivos: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* Categorias */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <h3 className="font-medium">Categorias</h3>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-2">
          <button
            onClick={() => setSelectedCategoria('')}
            className={`block text-sm w-full text-left px-2 py-1 rounded ${!selectedCategoria ? 'bg-primary/20 text-primary' : 'hover:bg-secondary'}`}
          >
            Todas as categorias
          </button>
          {categorias.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoria(cat.id)}
              className={`block text-sm w-full text-left px-2 py-1 rounded ${selectedCategoria === cat.id ? 'bg-primary/20 text-primary' : 'hover:bg-secondary'}`}
            >
              {cat.nome}
            </button>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Marcas */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <h3 className="font-medium">Marcas</h3>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-2">
          {marcas.slice(0, 10).map(marca => (
            <div key={marca} className="flex items-center gap-2">
              <Checkbox
                id={`marca-${marca}`}
                checked={selectedMarcas.includes(marca)}
                onCheckedChange={() => toggleMarca(marca)}
              />
              <Label htmlFor={`marca-${marca}`} className="text-sm cursor-pointer">
                {marca}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Faixa de Preço */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <h3 className="font-medium">Faixa de Preço</h3>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3">
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              placeholder="Min"
              value={precoMin}
              onChange={(e) => setPrecoMin(e.target.value)}
              className="w-24"
            />
            <span className="text-muted-foreground">até</span>
            <Input
              type="number"
              placeholder="Max"
              value={precoMax}
              onChange={(e) => setPrecoMax(e.target.value)}
              className="w-24"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Outros filtros */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="promocao"
            checked={apenasPromocao}
            onCheckedChange={(checked) => setApenasPromocao(checked as boolean)}
          />
          <Label htmlFor="promocao" className="text-sm cursor-pointer">
            Apenas promoções
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="estoque"
            checked={apenasEstoque}
            onCheckedChange={(checked) => setApenasEstoque(checked as boolean)}
          />
          <Label htmlFor="estoque" className="text-sm cursor-pointer">
            Apenas em estoque
          </Label>
        </div>
      </div>

      {temFiltrosAtivos && (
        <Button variant="outline" className="w-full" onClick={limparFiltros}>
          <X className="h-4 w-4 mr-2" />
          Limpar Filtros
        </Button>
      )}
    </div>
  );
}


export default function ProdutosPage() {
  const [search, setSearch] = useState('')
  const [selectedCategoria, setSelectedCategoria] = useState<string>('')
  const [selectedMarcas, setSelectedMarcas] = useState<string[]>([])
  const [precoMin, setPrecoMin] = useState('')
  const [precoMax, setPrecoMax] = useState('')
  const [ordenacao, setOrdenacao] = useState('relevancia')
  const [apenasPromocao, setApenasPromocao] = useState(false)
  const [apenasEstoque, setApenasEstoque] = useState(true)

  const produtosFiltrados = useMemo(() => {
    let result = produtos.filter(p => p.exibirNoSite)

    // Filtro de busca
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(p => 
        p.nome.toLowerCase().includes(searchLower) ||
        p.sku.toLowerCase().includes(searchLower) ||
        p.codigoOEM.toLowerCase().includes(searchLower) ||
        p.marca.toLowerCase().includes(searchLower)
      )
    }

    // Filtro de categoria
    if (selectedCategoria) {
      result = result.filter(p => p.categoria.toLowerCase() === selectedCategoria.toLowerCase())
    }

    // Filtro de marcas
    if (selectedMarcas.length > 0) {
      result = result.filter(p => selectedMarcas.includes(p.marca))
    }

    // Filtro de preço
    if (precoMin) {
      result = result.filter(p => (p.precoPromocional || p.precoSite) >= parseFloat(precoMin))
    }
    if (precoMax) {
      result = result.filter(p => (p.precoPromocional || p.precoSite) <= parseFloat(precoMax))
    }

    // Filtro de promoção
    if (apenasPromocao) {
      result = result.filter(p => p.precoPromocional && p.precoPromocional < p.precoSite)
    }

    // Filtro de estoque
    if (apenasEstoque) {
      result = result.filter(p => p.estoqueAtual > 0)
    }

    // Ordenação
    switch (ordenacao) {
      case 'menor-preco':
        result.sort((a, b) => (a.precoPromocional || a.precoSite) - (b.precoPromocional || b.precoSite))
        break
      case 'maior-preco':
        result.sort((a, b) => (b.precoPromocional || b.precoSite) - (a.precoPromocional || a.precoSite))
        break
      case 'nome':
        result.sort((a, b) => a.nome.localeCompare(b.nome))
        break
      default:
        // Relevância: destaques primeiro
        result.sort((a, b) => {
          if (a.destaqueHome && !b.destaqueHome) return -1
          if (!a.destaqueHome && b.destaqueHome) return 1
          return 0
        })
    }

    return result
  }, [search, selectedCategoria, selectedMarcas, precoMin, precoMax, ordenacao, apenasPromocao, apenasEstoque])

  const toggleMarca = (marca: string) => {
    setSelectedMarcas(prev => 
      prev.includes(marca) 
        ? prev.filter(m => m !== marca)
        : [...prev, marca]
    )
  }

  const limparFiltros = () => {
    setSearch('')
    setSelectedCategoria('')
    setSelectedMarcas([])
    setPrecoMin('')
    setPrecoMax('')
    setApenasPromocao(false)
    setApenasEstoque(true)
  }

  const temFiltrosAtivos = !!search || !!selectedCategoria || selectedMarcas.length > 0 || !!precoMin || !!precoMax || apenasPromocao

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold uppercase mb-2">
              Catálogo de Produtos
            </h1>
            <p className="text-muted-foreground">
              {produtosFiltrados.length} produto{produtosFiltrados.length !== 1 ? 's' : ''} encontrado{produtosFiltrados.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex gap-8">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24">
                <FilterContent 
                  selectedCategoria={selectedCategoria}
                  setSelectedCategoria={setSelectedCategoria}
                  selectedMarcas={selectedMarcas}
                  toggleMarca={toggleMarca}
                  precoMin={precoMin}
                  setPrecoMin={setPrecoMin}
                  precoMax={precoMax}
                  setPrecoMax={setPrecoMax}
                  apenasPromocao={apenasPromocao}
                  setApenasPromocao={setApenasPromocao}
                  apenasEstoque={apenasEstoque}
                  setApenasEstoque={setApenasEstoque}
                  limparFiltros={limparFiltros}
                  temFiltrosAtivos={temFiltrosAtivos}
                />
              </div>
            </aside>

            {/* Content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar produtos..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Mobile Filter */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="lg:hidden">
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Filtros
                        {temFiltrosAtivos && (
                          <Badge className="ml-2" variant="secondary">
                            {[selectedCategoria, ...selectedMarcas, precoMin, precoMax, apenasPromocao].filter(Boolean).length}
                          </Badge>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                      <SheetHeader>
                        <SheetTitle>Filtros</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <FilterContent 
                          selectedCategoria={selectedCategoria}
                          setSelectedCategoria={setSelectedCategoria}
                          selectedMarcas={selectedMarcas}
                          toggleMarca={toggleMarca}
                          precoMin={precoMin}
                          setPrecoMin={setPrecoMin}
                          precoMax={precoMax}
                          setPrecoMax={setPrecoMax}
                          apenasPromocao={apenasPromocao}
                          setApenasPromocao={setApenasPromocao}
                          apenasEstoque={apenasEstoque}
                          setApenasEstoque={setApenasEstoque}
                          limparFiltros={limparFiltros}
                          temFiltrosAtivos={temFiltrosAtivos}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>

                  {/* Ordenação */}
                  <Select value={ordenacao} onValueChange={setOrdenacao}>
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevancia">Relevância</SelectItem>
                      <SelectItem value="menor-preco">Menor Preço</SelectItem>
                      <SelectItem value="maior-preco">Maior Preço</SelectItem>
                      <SelectItem value="nome">Nome A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Filtros ativos */}
              {temFiltrosAtivos && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedCategoria && (
                    <Badge variant="secondary" className="gap-1">
                      {categorias.find(c => c.id === selectedCategoria)?.nome}
                      <button onClick={() => setSelectedCategoria('')}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedMarcas.map(marca => (
                    <Badge key={marca} variant="secondary" className="gap-1">
                      {marca}
                      <button onClick={() => toggleMarca(marca)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {apenasPromocao && (
                    <Badge variant="secondary" className="gap-1">
                      Promoções
                      <button onClick={() => setApenasPromocao(false)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              )}

              {/* Grid de produtos */}
              {produtosFiltrados.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {produtosFiltrados.map(produto => (
                    <ProductCard key={produto.id} produto={produto} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-muted-foreground mb-4">Nenhum produto encontrado com os filtros selecionados.</p>
                  <Button variant="outline" onClick={limparFiltros}>
                    Limpar Filtros
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}