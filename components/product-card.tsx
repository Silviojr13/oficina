'use client'

import Link from 'next/link'
import { ShoppingCart, Tag, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { useCartStore } from '@/lib/store'
import type { Produto } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  produto: Produto
  className?: string
}

export function ProductCard({ produto, className }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  
  const precoAtual = produto.precoPromocional || produto.precoSite
  const temPromocao = produto.precoPromocional && produto.precoPromocional < produto.precoSite
  const desconto = temPromocao 
    ? Math.round(((produto.precoSite - produto.precoPromocional!) / produto.precoSite) * 100)
    : 0

  const emEstoque = produto.estoqueAtual > 0
  const estoqueBaixo = produto.estoqueAtual > 0 && produto.estoqueAtual <= produto.estoqueMinimo

  return (
    <Card className={cn("group overflow-hidden bg-card border-border hover:border-primary/50 transition-colors", className)}>
      <Link href={`/produto/${produto.slug}`}>
        <div className="relative aspect-square bg-secondary/50 overflow-hidden">
          {/* Placeholder de imagem */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="h-16 w-16 text-muted-foreground/30" />
          </div>
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {temPromocao && (
              <Badge className="bg-destructive text-destructive-foreground">
                -{desconto}%
              </Badge>
            )}
            {produto.destaqueHome && (
              <Badge variant="secondary" className="bg-primary text-primary-foreground">
                Destaque
              </Badge>
            )}
          </div>

          {/* Status estoque */}
          <div className="absolute top-2 right-2">
            {!emEstoque ? (
              <Badge variant="destructive">Indisponível</Badge>
            ) : estoqueBaixo ? (
              <Badge variant="outline" className="bg-warning/20 text-warning border-warning">
                Últimas unidades
              </Badge>
            ) : null}
          </div>
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="mb-2">
          <Badge variant="outline" className="text-xs text-muted-foreground">
            {produto.marca}
          </Badge>
        </div>
        
        <Link href={`/produto/${produto.slug}`}>
          <h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors mb-2">
            {produto.nome}
          </h3>
        </Link>

        <p className="text-xs text-muted-foreground mb-3 font-mono">
          SKU: {produto.sku}
        </p>

        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-primary">
            R$ {precoAtual.toFixed(2).replace('.', ',')}
          </span>
          {temPromocao && (
            <span className="text-sm text-muted-foreground line-through">
              R$ {produto.precoSite.toFixed(2).replace('.', ',')}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full gap-2" 
          size="sm"
          disabled={!emEstoque}
          onClick={() => addItem(produto)}
        >
          <ShoppingCart className="h-4 w-4" />
          {emEstoque ? 'Adicionar ao Carrinho' : 'Indisponível'}
        </Button>
      </CardFooter>
    </Card>
  )
}
