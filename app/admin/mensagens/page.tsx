'use client';

import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Car, MailOpen } from 'lucide-react';
import { getMensagensContato, marcarMensagemComoLida } from '@/lib/actions/mensagens';

const assuntoLabels: Record<string, string> = {
  orcamento: 'Solicitar Orçamento',
  disponibilidade: 'Disponibilidade de Peça',
  duvida: 'Dúvida Técnica',
  pedido: 'Fechar Pedido',
  acompanhar: 'Acompanhar Pedido',
  outros: 'Outros',
};

type Mensagem = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  assunto: string | null;
  veiculo: string | null;
  mensagem: string;
  lida: boolean;
  createdAt: Date;
};

export default function MensagensPage() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = async () => {
    const dados = await getMensagensContato();
    setMensagens(dados);
    setCarregando(false);
  };

  useEffect(() => {
    carregar();
  }, []);

  const toggleLida = async (id: string, lida: boolean) => {
    await marcarMensagemComoLida(id, lida);
    await carregar();
  };

  const naoLidas = mensagens.filter((m) => !m.lida).length;

  return (
    <>
      <AdminHeader title="Mensagens" subtitle="Contatos e pedidos enviados pelo site" />
      <main className="p-4 sm:p-6 space-y-6">
        {carregando ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Carregando...</p>
        ) : mensagens.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              Nenhuma mensagem recebida ainda.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {naoLidas > 0 && (
              <p className="text-sm text-muted-foreground">{naoLidas} não lida{naoLidas !== 1 ? 's' : ''}</p>
            )}
            {mensagens.map((msg) => (
              <Card key={msg.id} className={!msg.lida ? 'border-l-4 border-l-primary' : undefined}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{msg.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(msg.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {msg.assunto && <Badge variant="outline">{assuntoLabels[msg.assunto] ?? msg.assunto}</Badge>}
                      {!msg.lida && <Badge>Nova</Badge>}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" /> {msg.email}
                    </span>
                    {msg.telefone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" /> {msg.telefone}
                      </span>
                    )}
                    {msg.veiculo && (
                      <span className="flex items-center gap-1.5">
                        <Car className="h-3.5 w-3.5" /> {msg.veiculo}
                      </span>
                    )}
                  </div>

                  <p className="text-sm whitespace-pre-wrap border-t border-border pt-3">{msg.mensagem}</p>

                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => toggleLida(msg.id, !msg.lida)}>
                      <MailOpen className="h-3.5 w-3.5 mr-1.5" />
                      {msg.lida ? 'Marcar como não lida' : 'Marcar como lida'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
