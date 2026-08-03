'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  ChevronRight,
  MessageSquare,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export default function ContatoPage() {
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simular envio
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setLoading(false)
    setEnviado(true)
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
            <span className="text-foreground">Contato</span>
          </nav>

          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="font-display text-3xl md:text-4xl font-bold uppercase mb-4">
                Fale Conosco
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Estamos prontos para ajudar você a encontrar as peças certas para seu veículo. 
                Entre em contato conosco por telefone, e-mail ou através do formulário abaixo.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 mb-12">
              {/* Cards de contato */}
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">Telefone</h3>
                  <p className="text-muted-foreground text-sm mb-2">Atendimento rápido</p>
                  <a href="tel:1134567890" className="text-primary font-medium hover:underline">
                    (11) 3456-7890
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">E-mail</h3>
                  <p className="text-muted-foreground text-sm mb-2">Respondemos em até 24h</p>
                  <a href="mailto:contato@autopecaspro.com.br" className="text-primary font-medium hover:underline break-all">
                    contato@autopecaspro.com.br
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">WhatsApp</h3>
                  <p className="text-muted-foreground text-sm mb-2">Chat instantâneo</p>
                  <a 
                    href="https://wa.me/5511934567890" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary font-medium hover:underline"
                  >
                    (11) 93456-7890
                  </a>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Formulário */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5 text-primary" />
                    Envie uma Mensagem
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {enviado ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-success" />
                      </div>
                      <h3 className="font-medium text-lg mb-2">Mensagem Enviada!</h3>
                      <p className="text-muted-foreground mb-4">
                        Obrigado pelo seu contato. Responderemos em breve.
                      </p>
                      <Button variant="outline" onClick={() => setEnviado(false)}>
                        Enviar Nova Mensagem
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nome">Nome *</Label>
                          <Input id="nome" placeholder="Seu nome completo" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="telefone">Telefone *</Label>
                          <Input id="telefone" type="tel" placeholder="(11) 99999-9999" required />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail *</Label>
                        <Input id="email" type="email" placeholder="seu@email.com" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="assunto">Assunto</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o assunto" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="orcamento">Solicitar Orçamento</SelectItem>
                            <SelectItem value="disponibilidade">Disponibilidade de Peça</SelectItem>
                            <SelectItem value="duvida">Dúvida Técnica</SelectItem>
                            <SelectItem value="pedido">Acompanhar Pedido</SelectItem>
                            <SelectItem value="outros">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="veiculo">Veículo (opcional)</Label>
                        <Input 
                          id="veiculo" 
                          placeholder="Ex: Honda Civic 2018 1.5 Turbo" 
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mensagem">Mensagem *</Label>
                        <Textarea 
                          id="mensagem" 
                          placeholder="Descreva sua dúvida ou solicitação..."
                          rows={4}
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full gap-2" disabled={loading}>
                        {loading ? (
                          <>Enviando...</>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Enviar Mensagem
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>

              {/* Informações */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Nossa Localização
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <address className="not-italic text-muted-foreground">
                      <p className="mb-2">
                        Av. das Autopeças, 1234<br />
                        Centro - São Paulo/SP<br />
                        CEP: 01234-567
                      </p>
                    </address>
                    <div className="mt-4 aspect-video bg-secondary rounded-lg flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">Mapa interativo</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Horário de Atendimento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Segunda a Sexta</span>
                        <span className="font-medium">08:00 - 18:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sábado</span>
                        <span className="font-medium">08:00 - 13:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Domingo e Feriados</span>
                        <span className="font-medium text-destructive">Fechado</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
