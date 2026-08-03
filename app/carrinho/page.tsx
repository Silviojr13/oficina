'use client'

import Link from 'next/link'
import { ShoppingCart, Trash2, Plus, Minus, Package, ArrowRight, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { useCartStore } from '@/lib/store'

export default function CarrinhoPage() {
  const { items, removeItem, updateQuantity, clearCart, getSubtotal, getTotal } = useCartStore()

  const subtotal = getSubtotal()
  const total = getTotal()
  const frete = subtotal >= 299 ? 0 : 29.90

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-16 px-4">
            <div className="mb-6 flex justify-center">
              <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground" />
              </div>
            </div>
            <h1 className="font-display text-2xl font-bold uppercase mb-2">
              Seu carrinho está vazio
            </h1>
            <p className="text-muted-foreground mb-6">
              Adicione produtos ao carrinho para continuar
            </p>
            <Link href="/produtos">
              <Button className="gap-2">
                Ver Produtos
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
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
            <span className="text-foreground">Carrinho</span>
          </nav>

          <h1 className="font-display text-3xl font-bold uppercase mb-8">
            Carrinho de Compras
          </h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Lista de produtos */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(({ produto, quantidade }) => {
                const precoAtual = produto.precoPromocional || produto.precoSite
                const temPromocao = produto.precoPromocional && produto.precoPromocional < produto.precoSite

                return (
                  <Card key={produto.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Imagem */}
                        <div className="w-24 h-24 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="h-10 w-10 text-muted-foreground/30" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <Link 
                                href={`/produto/${produto.slug}`}
                                className="font-medium hover:text-primary transition-colors line-clamp-2"
                              >
                                {produto.nome}
                              </Link>
                              <p className="text-sm text-muted-foreground mt-1">
                                {produto.marca} | SKU: {produto.sku}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-destructive flex-shrink-0"
                              onClick={() => removeItem(produto.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="flex flex-wrap items-end justify-between gap-4 mt-4">
                            {/* Quantidade */}
                            <div className="flex items-center border border-border rounded-lg">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(produto.id, quantidade - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-10 text-center text-sm font-medium">{quantidade}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(produto.id, Math.min(produto.estoqueAtual, quantidade + 1))}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>

                            {/* Preço */}
                            <div className="text-right">
                              {temPromocao && (
                                <p className="text-xs text-muted-foreground line-through">
                                  R$ {(produto.precoSite * quantidade).toFixed(2).replace('.', ',')}
                                </p>
                              )}
                              <p className="text-lg font-bold text-primary">
                                R$ {(precoAtual * quantidade).toFixed(2).replace('.', ',')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              <div className="flex justify-between items-center pt-4">
                <Button variant="outline" onClick={clearCart}>
                  Limpar Carrinho
                </Button>
                <Link href="/produtos">
                  <Button variant="ghost" className="gap-2">
                    Continuar Comprando
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Resumo */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal ({items.length} {items.length === 1 ? 'item' : 'itens'})</span>
                    <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frete</span>
                    {frete === 0 ? (
                      <span className="text-success font-medium">Grátis</span>
                    ) : (
                      <span>R$ {frete.toFixed(2).replace('.', ',')}</span>
                    )}
                  </div>

                  {subtotal < 299 && (
                    <p className="text-xs text-muted-foreground bg-secondary p-2 rounded">
                      Faltam R$ {(299 - subtotal).toFixed(2).replace('.', ',')} para frete grátis!
                    </p>
                  )}

                  <Separator />

                  <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span className="text-primary">R$ {(total + frete).toFixed(2).replace('.', ',')}</span>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    ou 12x de R$ {((total + frete) / 12).toFixed(2).replace('.', ',')} sem juros
                  </p>
                </CardContent>
                <CardFooter className="flex-col gap-3">
                  <Button className="w-full" size="lg">
                    Finalizar Compra
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Pagamento 100% seguro. Aceitamos Pix, cartões e boleto.
                  </p>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
