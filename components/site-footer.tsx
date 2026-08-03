import Link from 'next/link'
import { Wrench, Phone, Mail, MapPin, Clock, Facebook, Instagram, Youtube } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo e descrição */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Wrench className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold uppercase tracking-tight">
                  AutoPeças
                </h2>
                <p className="text-xs text-muted-foreground">Pro</p>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Há mais de 20 anos oferecendo as melhores peças e acessórios automotivos 
              com qualidade e preços justos.
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links rápidos */}
          <div>
            <h3 className="font-display text-lg font-semibold uppercase mb-4">
              Links Rápidos
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/produtos" className="text-muted-foreground hover:text-primary transition-colors">
                  Catálogo de Produtos
                </Link>
              </li>
              <li>
                <Link href="/produtos?categoria=filtros" className="text-muted-foreground hover:text-primary transition-colors">
                  Filtros
                </Link>
              </li>
              <li>
                <Link href="/produtos?categoria=freios" className="text-muted-foreground hover:text-primary transition-colors">
                  Freios
                </Link>
              </li>
              <li>
                <Link href="/produtos?categoria=suspensao" className="text-muted-foreground hover:text-primary transition-colors">
                  Suspensão
                </Link>
              </li>
              <li>
                <Link href="/produtos?categoria=eletrica" className="text-muted-foreground hover:text-primary transition-colors">
                  Elétrica
                </Link>
              </li>
              <li>
                <Link href="/contato" className="text-muted-foreground hover:text-primary transition-colors">
                  Fale Conosco
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-display text-lg font-semibold uppercase mb-4">
              Contato
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">
                  Av. das Autopeças, 1234<br />
                  Centro - São Paulo/SP<br />
                  CEP: 01234-567
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">(11) 3456-7890</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">contato@autopecaspro.com.br</span>
              </li>
            </ul>
          </div>

          {/* Horários */}
          <div>
            <h3 className="font-display text-lg font-semibold uppercase mb-4">
              Horário de Atendimento
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">Segunda a Sexta</span>
              </li>
              <li className="pl-6 text-muted-foreground">08:00 às 18:00</li>
              <li className="flex items-center gap-2 mt-2">
                <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">Sábado</span>
              </li>
              <li className="pl-6 text-muted-foreground">08:00 às 13:00</li>
              <li className="flex items-center gap-2 mt-2">
                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">Domingo e Feriados</span>
              </li>
              <li className="pl-6 text-muted-foreground">Fechado</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} AutoPeças Pro. Todos os direitos reservados.
            CNPJ: 12.345.678/0001-90
          </p>
        </div>
      </div>
    </footer>
  )
}
