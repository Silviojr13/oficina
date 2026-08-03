import Link from 'next/link'
import { ArrowRight, Truck, Shield, CreditCard, Headphones, Wrench, Cog, Zap, Filter, CircleDot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ProductCard } from '@/components/product-card'
import { produtos, categorias } from '@/lib/mock-data'

const categoryIcons: Record<string, React.ReactNode> = {
  motor: <Cog className="h-8 w-8" />,
  freios: <CircleDot className="h-8 w-8" />,
  suspensao: <Wrench className="h-8 w-8" />,
  eletrica: <Zap className="h-8 w-8" />,
  filtros: <Filter className="h-8 w-8" />,
}

const features = [
  {
    icon: <Truck className="h-6 w-6" />,
    title: 'Entrega Rápida',
    description: 'Enviamos para todo Brasil'
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Garantia de Fábrica',
    description: 'Todas as peças com garantia'
  },
  {
    icon: <CreditCard className="h-6 w-6" />,
    title: 'Parcelamento',
    description: 'Em até 12x sem juros'
  },
  {
    icon: <Headphones className="h-6 w-6" />,
    title: 'Suporte Técnico',
    description: 'Equipe especializada'
  },
]

export default function HomePage() {
  const produtosDestaque = produtos.filter(p => p.destaqueHome && p.exibirNoSite).slice(0, 8)
  const produtosPromocao = produtos.filter(p => p.precoPromocional && p.exibirNoSite).slice(0, 4)
  const categoriasDestaque = categorias.slice(0, 5)

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-background via-background to-secondary/30 border-b border-border">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-3xl">
              <h1 className="font-display text-4xl md:text-6xl font-bold uppercase tracking-tight mb-4">
                Peças e Acessórios
                <span className="text-primary block">Automotivos</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl">
                A maior variedade em peças para seu veículo. 
                Qualidade garantida, preços competitivos e entrega rápida para todo Brasil.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/produtos">
                  <Button size="lg" className="gap-2">
                    Ver Catálogo
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contato">
                  <Button size="lg" variant="outline">
                    Fale Conosco
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Decorative element */}
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary/5 to-transparent hidden lg:block" />
        </section>

        {/* Features Bar */}
        <section className="bg-card border-b border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categorias */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold uppercase">
                  Categorias
                </h2>
                <p className="text-muted-foreground">Encontre peças por categoria</p>
              </div>
              <Link href="/produtos">
                <Button variant="ghost" className="gap-2">
                  Ver todas
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {categoriasDestaque.map((categoria) => (
                <Link 
                  key={categoria.id} 
                  href={`/produtos?categoria=${categoria.id}`}
                >
                  <Card className="group hover:border-primary/50 transition-colors cursor-pointer h-full">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <div className="mb-3 text-muted-foreground group-hover:text-primary transition-colors">
                        {categoryIcons[categoria.id] || <Cog className="h-8 w-8" />}
                      </div>
                      <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                        {categoria.nome}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {categoria.subcategorias.length} subcategorias
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Produtos em Destaque */}
        <section className="py-12 md:py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold uppercase">
                  Produtos em Destaque
                </h2>
                <p className="text-muted-foreground">As melhores peças para seu veículo</p>
              </div>
              <Link href="/produtos">
                <Button variant="ghost" className="gap-2">
                  Ver todos
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {produtosDestaque.map((produto) => (
                <ProductCard key={produto.id} produto={produto} />
              ))}
            </div>
          </div>
        </section>

        {/* Banner Promocional */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <Card className="bg-gradient-to-r from-primary/20 via-primary/10 to-background border-primary/30 overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <div className="max-w-2xl">
                  <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded mb-4">
                    Oferta Especial
                  </span>
                  <h2 className="font-display text-3xl md:text-4xl font-bold uppercase mb-4">
                    Óleo Motor 5W30
                    <span className="text-primary block">A partir de R$ 49,90</span>
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Aproveite a promoção de óleos sintéticos das melhores marcas. 
                    Mobil, Shell, Castrol e muito mais.
                  </p>
                  <Link href="/produtos?categoria=lubrificantes">
                    <Button className="gap-2">
                      Conferir Ofertas
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Produtos em Promoção */}
        {produtosPromocao.length > 0 && (
          <section className="py-12 md:py-16 bg-secondary/30">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold uppercase">
                    Promoções
                  </h2>
                  <p className="text-muted-foreground">Ofertas imperdíveis por tempo limitado</p>
                </div>
                <Link href="/produtos?promocao=true">
                  <Button variant="ghost" className="gap-2">
                    Ver todas
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {produtosPromocao.map((produto) => (
                  <ProductCard key={produto.id} produto={produto} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Marcas */}
        <section className="py-12 md:py-16 border-t border-border">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-xl font-bold uppercase text-center mb-8 text-muted-foreground">
              Trabalhamos com as Melhores Marcas
            </h2>
            <div className="flex flex-wrap justify-center gap-8 items-center">
              {['Bosch', 'NGK', 'Cofap', 'Mahle', 'Monroe', 'Gates', 'Sachs', 'TRW'].map((marca) => (
                <div 
                  key={marca} 
                  className="text-lg font-display font-bold text-muted-foreground/50 hover:text-primary transition-colors"
                >
                  {marca}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
