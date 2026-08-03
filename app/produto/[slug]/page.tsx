'use client'

import { use } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { 
  ShoppingCart, 
  Package, 
  Truck, 
  Shield, 
  ChevronRight,
  Plus,
  Minus,
  Check,
  AlertTriangle,
  Car,
  FileText,
  Tag
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ProductCard } from '@/components/product-card'
import { useCartStore } from '@/lib/store'
import { produtos } from '@/lib/mock-data'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default function ProdutoPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const produto = produtos.find(p => p.slug === resolvedParams.slug)
  const [quantidade, setQuantidade] = useState(1)
  const addItem = useCartStore((state) => state.addItem)

  if (!produto) {
    notFound()
  }

  const precoAtual = produto.precoPromocional || produto.precoSite
  const temPromocao = produto.precoPromocional && produto.precoPromocional < produto.precoSite
  const desconto = temPromocao 
    ? Math.round(((produto.precoSite - produto.precoPromocional!) / produto.precoSite) * 100)
    : 0

  const emEstoque = produto.estoqueAtual > 0
  const estoqueBaixo = produto.estoqueAtual > 0 && produto.estoqueAtual <= produto.estoqueMinimo

  // Produtos relacionados (mesma categoria)
  const produtosRelacionados = produtos
    .filter(p => p.categoria === produto.categoria && p.id !== produto.id && p.exibirNoSite)
    .slice(0, 4)

  const handleAddToCart = () => {
    addItem(produto, quantidade)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-primary">Início</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/produtos" className="hover:text-primary">Produtos</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/produtos?categoria=${produto.categoria.toLowerCase()}`} className="hover:text-primary">
              {produto.categoria}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground truncate max-w-48">{produto.nome}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Imagem */}
            <div className="relative">
              <div className="aspect-square bg-card rounded-lg border border-border flex items-center justify-center">
                <Package className="h-32 w-32 text-muted-foreground/30" />
              </div>
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {temPromocao && (
                  <Badge className="bg-destructive text-destructive-foreground text-lg px-3 py-1">
                    -{desconto}%
                  </Badge>
                )}
              </div>
            </div>

            {/* Informações */}
            <div>
              <div className="mb-4">
                <Badge variant="outline" className="mb-2">{produto.marca}</Badge>
                <h1 className="font-display text-2xl md:text-3xl font-bold uppercase mb-2">
                  {produto.nome}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground font-mono">
                  <span>SKU: {produto.sku}</span>
                  {produto.codigoOEM && <span>OEM: {produto.codigoOEM}</span>}
                  {produto.codigoBarras && <span>EAN: {produto.codigoBarras}</span>}
                </div>
              </div>

              <p className="text-muted-foreground mb-6">
                {produto.descricaoCurta}
              </p>

              {/* Preço */}
              <div className="mb-6">
                {temPromocao && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-muted-foreground line-through">
                      R$ {produto.precoSite.toFixed(2).replace('.', ',')}
                    </span>
                    <Badge className="bg-destructive text-destructive-foreground">
                      -{desconto}%
                    </Badge>
                  </div>
                )}
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-primary">
                    R$ {precoAtual.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-muted-foreground">
                    à vista
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  ou 12x de R$ {(precoAtual / 12).toFixed(2).replace('.', ',')} sem juros
                </p>
              </div>

              {/* Estoque */}
              <div className="mb-6">
                {emEstoque ? (
                  <div className="flex items-center gap-2 text-success">
                    <Check className="h-5 w-5" />
                    <span className="font-medium">Em estoque</span>
                    {estoqueBaixo && (
                      <Badge variant="outline" className="bg-warning/20 text-warning border-warning">
                        Últimas {produto.estoqueAtual} unidades
                      </Badge>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-medium">Produto indisponível</span>
                  </div>
                )}
              </div>

              {/* Quantidade e Comprar */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center border border-border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                    disabled={!emEstoque}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantidade}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantidade(Math.min(produto.estoqueAtual, quantidade + 1))}
                    disabled={!emEstoque}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <Button 
                  size="lg" 
                  className="flex-1 gap-2"
                  disabled={!emEstoque}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-5 w-5" />
                  Adicionar ao Carrinho
                </Button>
              </div>

              {/* Benefícios */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
                  <Truck className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">Frete Grátis</p>
                    <p className="text-muted-foreground">Acima de R$ 299</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
                  <Shield className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">Garantia</p>
                    <p className="text-muted-foreground">{produto.garantia}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs de informações */}
          <Tabs defaultValue="descricao" className="mb-12">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="descricao">Descrição</TabsTrigger>
              <TabsTrigger value="especificacoes">Especificações</TabsTrigger>
              <TabsTrigger value="compatibilidade">Compatibilidade</TabsTrigger>
            </TabsList>

            <TabsContent value="descricao" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-6">
                    {produto.descricaoCompleta}
                  </p>
                  
                  {produto.caracteristicas.length > 0 && (
                    <>
                      <h3 className="font-medium mb-3">Características</h3>
                      <ul className="space-y-2">
                        {produto.caracteristicas.map((caracteristica, index) => (
                          <li key={index} className="flex items-start gap-2 text-muted-foreground">
                            <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            {caracteristica}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="especificacoes" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-4 flex items-center gap-2">
                        <Tag className="h-4 w-4 text-primary" />
                        Identificação
                      </h3>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between py-2 border-b border-border">
                          <dt className="text-muted-foreground">SKU</dt>
                          <dd className="font-mono">{produto.sku}</dd>
                        </div>
                        {produto.codigoOEM && (
                          <div className="flex justify-between py-2 border-b border-border">
                            <dt className="text-muted-foreground">Código OEM</dt>
                            <dd className="font-mono">{produto.codigoOEM}</dd>
                          </div>
                        )}
                        {produto.codigoBarras && (
                          <div className="flex justify-between py-2 border-b border-border">
                            <dt className="text-muted-foreground">EAN</dt>
                            <dd className="font-mono">{produto.codigoBarras}</dd>
                          </div>
                        )}
                        <div className="flex justify-between py-2 border-b border-border">
                          <dt className="text-muted-foreground">Marca</dt>
                          <dd>{produto.marca}</dd>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border">
                          <dt className="text-muted-foreground">País de Origem</dt>
                          <dd>{produto.paisOrigem}</dd>
                        </div>
                        <div className="flex justify-between py-2">
                          <dt className="text-muted-foreground">Tipo de Peça</dt>
                          <dd className="capitalize">{produto.tipoPeca}</dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <h3 className="font-medium mb-4 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        Dimensões e Peso
                      </h3>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between py-2 border-b border-border">
                          <dt className="text-muted-foreground">Peso Bruto</dt>
                          <dd>{produto.pesoBruto} kg</dd>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border">
                          <dt className="text-muted-foreground">Peso Líquido</dt>
                          <dd>{produto.pesoLiquido} kg</dd>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border">
                          <dt className="text-muted-foreground">Dimensões</dt>
                          <dd>{produto.comprimento} x {produto.largura} x {produto.altura} cm</dd>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border">
                          <dt className="text-muted-foreground">Unidade</dt>
                          <dd>{produto.unidadeMedida}</dd>
                        </div>
                        {produto.material && (
                          <div className="flex justify-between py-2 border-b border-border">
                            <dt className="text-muted-foreground">Material</dt>
                            <dd>{produto.material}</dd>
                          </div>
                        )}
                        <div className="flex justify-between py-2">
                          <dt className="text-muted-foreground">Garantia</dt>
                          <dd>{produto.garantia}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compatibilidade" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  {produto.tipoAplicacao === 'universal' ? (
                    <p className="text-muted-foreground">
                      Este produto é de aplicação universal e pode ser utilizado em diversos veículos. 
                      Consulte as especificações técnicas para verificar a compatibilidade com seu veículo.
                    </p>
                  ) : produto.veiculosCompativeis.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="font-medium flex items-center gap-2">
                        <Car className="h-4 w-4 text-primary" />
                        Veículos Compatíveis
                      </h3>
                      <div className="grid gap-3">
                        {produto.veiculosCompativeis.map((veiculo) => (
                          <div 
                            key={veiculo.id} 
                            className="flex flex-wrap items-center gap-2 p-3 bg-secondary/50 rounded-lg"
                          >
                            <Badge variant="outline">{veiculo.montadora}</Badge>
                            <span className="font-medium">{veiculo.modelo}</span>
                            <span className="text-muted-foreground">{veiculo.versaoMotor}</span>
                            <span className="text-muted-foreground">
                              {veiculo.anoInicial} - {veiculo.anoFinal || 'Atual'}
                            </span>
                            {veiculo.posicao && (
                              <Badge variant="secondary">{veiculo.posicao}</Badge>
                            )}
                            {veiculo.observacao && (
                              <span className="text-sm text-muted-foreground">({veiculo.observacao})</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      Informações de compatibilidade não disponíveis para este produto.
                    </p>
                  )}

                  {produto.referenciaCruzada.length > 0 && (
                    <div className="mt-6">
                      <Separator className="my-6" />
                      <h3 className="font-medium mb-3">Referências Cruzadas</h3>
                      <div className="flex flex-wrap gap-2">
                        {produto.referenciaCruzada.map((ref, index) => (
                          <Badge key={index} variant="outline" className="font-mono">
                            {ref}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Produtos Relacionados */}
          {produtosRelacionados.length > 0 && (
            <section>
              <h2 className="font-display text-2xl font-bold uppercase mb-6">
                Produtos Relacionados
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {produtosRelacionados.map(p => (
                  <ProductCard key={p.id} produto={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
