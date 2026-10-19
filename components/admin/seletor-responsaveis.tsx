'use client';

import { useMemo, useRef, useState } from 'react';
import { UserPlus, X, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type MembroEquipe = {
  id: string;
  nome: string;
  cargo: string;
  setor: string;
};

export type ResponsavelSelecionado = {
  // null quando a pessoa nao esta no cadastro de funcionarios (terceirizado,
  // ajudante do dia, alguem que ainda nao foi cadastrado).
  funcionarioId: string | null;
  nome: string;
};

interface SeletorResponsaveisProps {
  equipe: MembroEquipe[];
  value: ResponsavelSelecionado[];
  onChange: (responsaveis: ResponsavelSelecionado[]) => void;
}

export default function SeletorResponsaveis({ equipe, value, onChange }: SeletorResponsaveisProps) {
  const [busca, setBusca] = useState('');
  const [aberto, setAberto] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const termo = busca.trim();
  const termoNormalizado = termo.toLowerCase();

  const jaSelecionado = (candidato: ResponsavelSelecionado) =>
    value.some((r) =>
      candidato.funcionarioId
        ? r.funcionarioId === candidato.funcionarioId
        : r.nome.toLowerCase() === candidato.nome.toLowerCase()
    );

  // Sem termo digitado o seletor ja mostra a equipe inteira - a ideia e clicar,
  // nao ter que adivinhar o nome e digitar.
  const sugestoes = useMemo(() => {
    const disponiveis = equipe.filter((m) => !value.some((r) => r.funcionarioId === m.id));
    if (!termoNormalizado) return disponiveis.slice(0, 8);
    return disponiveis
      .filter(
        (m) =>
          m.nome.toLowerCase().includes(termoNormalizado) ||
          m.cargo.toLowerCase().includes(termoNormalizado) ||
          m.setor.toLowerCase().includes(termoNormalizado)
      )
      .slice(0, 8);
  }, [equipe, value, termoNormalizado]);

  // Só oferece "adicionar avulso" quando o nome digitado nao e exatamente o de
  // alguem da equipe nem de alguem ja marcado - evita duas entradas pra mesma
  // pessoa, uma cadastrada e outra solta.
  const podeAdicionarAvulso =
    termo.length >= 2 &&
    !equipe.some((m) => m.nome.toLowerCase() === termoNormalizado) &&
    !value.some((r) => r.nome.toLowerCase() === termoNormalizado);

  const adicionar = (responsavel: ResponsavelSelecionado) => {
    if (jaSelecionado(responsavel)) return;
    onChange([...value, responsavel]);
    setBusca('');
    inputRef.current?.focus();
  };

  const remover = (index: number) => onChange(value.filter((_, i) => i !== index));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setBusca('');
      setAberto(false);
      return;
    }
    if (e.key !== 'Enter') return;
    // Enter aqui adiciona a pessoa; sem isso ele enviaria a OS inteira.
    e.preventDefault();
    if (sugestoes.length > 0) {
      const membro = sugestoes[0];
      adicionar({ funcionarioId: membro.id, nome: membro.nome });
    } else if (podeAdicionarAvulso) {
      adicionar({ funcionarioId: null, nome: termo });
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="buscaResponsavel">Responsáveis pelo serviço</Label>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((responsavel, index) => (
            <span
              key={responsavel.funcionarioId ?? `avulso-${responsavel.nome}-${index}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary py-1 pl-1 pr-1.5 text-sm"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                {iniciais(responsavel.nome)}
              </span>
              <span className="max-w-[14rem] truncate">{responsavel.nome}</span>
              {!responsavel.funcionarioId && (
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">avulso</span>
              )}
              <button
                type="button"
                onClick={() => remover(index)}
                aria-label={`Remover ${responsavel.nome}`}
                className="rounded-full p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <Input
          id="buscaResponsavel"
          ref={inputRef}
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setAberto(true);
          }}
          onFocus={() => setAberto(true)}
          // blur com atraso para o clique na sugestao acontecer antes de fechar
          onBlur={() => setTimeout(() => setAberto(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder={value.length ? 'Adicionar outra pessoa...' : 'Clique para escolher ou digite um nome...'}
          autoComplete="off"
        />

        {aberto && (sugestoes.length > 0 || podeAdicionarAvulso) && (
          <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-md">
            {sugestoes.map((membro) => (
              <button
                type="button"
                key={membro.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => adicionar({ funcionarioId: membro.id, nome: membro.nome })}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-secondary"
              >
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                  {iniciais(membro.nome)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{membro.nome}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {[membro.cargo, membro.setor].filter(Boolean).join(' · ')}
                  </span>
                </span>
                <Check className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              </button>
            ))}

            {podeAdicionarAvulso && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => adicionar({ funcionarioId: null, nome: termo })}
                className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-left text-sm hover:bg-secondary"
              >
                <UserPlus className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <span className="min-w-0">
                  Adicionar <strong className="font-medium">{termo}</strong>
                  <span className="block text-xs text-muted-foreground">Pessoa de fora do cadastro</span>
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {equipe.length === 0
          ? 'Nenhum funcionário ativo cadastrado — por enquanto é só digitar o nome.'
          : 'Escolha quantas pessoas quiser. Quem não está no cadastro entra só pelo nome.'}
      </p>
    </div>
  );
}

export function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}
