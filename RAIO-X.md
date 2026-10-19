# Raio-X do Projeto — Oficina / AutoPeças Pro

> Gerado em 15/09/2026 a partir da branch `claude/project-analysis-overview-a6b9a2` (commit `f61c8fc`).

## 1. Identificação

| | |
|---|---|
| Repositório | `Silviojr13/oficina` (GitHub) |
| Nome exibido | "AutoPeças Pro" (loja, README, metadata) · "Silvio Auto Elétrica e Mecânica" (login) · "Oficina — Gestão & Pátio" (admin) |
| O que é | Sistema de gestão de oficina mecânica + loja pública de autopeças, num único app Next.js |
| Histórico | 32 commits, de 16/06/2026 a 31/08/2026 (origem: projeto gerado no v0.app) |
| Tamanho | ~18,6 mil linhas TS/TSX (≈1,7 mil no seed, ≈5 mil em componentes shadcn/ui) |
| Testes / CI | Nenhum teste automatizado; nenhum workflow de CI; só ESLint |

## 2. Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | Next.js (App Router, Server Actions, `proxy.ts`) | 16.2.4 |
| UI | React 19, Tailwind CSS 4, shadcn/ui (Radix), lucide-react, Recharts, sonner | — |
| Formulários | react-hook-form + zod (só no cliente) | 7.54 / 3.24 |
| Estado cliente | Zustand com `persist` (carrinho em localStorage) | 5.0 |
| Banco | SQLite local (dev) / Turso libSQL (prod) via Prisma 7 + `@prisma/adapter-libsql` | 7.9.1 |
| Autenticação | Auth.js v5 (next-auth beta.32) + Google OAuth + PrismaAdapter, sessão JWT | 5.0.0-beta |
| Integração | API do Mercado Livre (OAuth + publicação de anúncio) | — |
| Deploy | Vercel (`@vercel/analytics`), PWA via `app/manifest.ts` | — |
| Fontes | DM Sans (corpo), Barlow Condensed (display), JetBrains Mono | — |

## 3. Arquitetura

```
Navegador
  ├─ Loja pública (/ /produtos /produto/[slug] /carrinho /contato)  ← Server Components + Zustand
  ├─ /login (Google)                                                ← signIn server action
  └─ /admin/* (20 páginas, quase todas 'use client')                ← useEffect → Server Actions
          │
     proxy.ts (matcher /admin/:path*): exige sessão; cliente → "/"; funcionário bloqueado em rotas só-admin
          │
lib/actions/*.ts  (11 arquivos, ~60 Server Actions, 'use server')
  ├─ lib/auth-guard.ts  requireAdmin() / requireStaff()   ← proteção real (parcial, ver §8)
  ├─ lib/prisma-helpers.ts  parseDateFields()             ← "YYYY-MM-DD" → Date (Prisma 7)
  └─ lib/mercado-livre.ts   criarAnuncioMercadoLivre()    ← chamado em background no createProduto
          │
lib/prisma.ts → PrismaClient(adapter libsql) → SQLite (dev) | Turso (prod)
```

Convenções observadas:
- Toda action devolve `{ success, data | error }` e faz `try/catch` + `console.error` + `revalidatePath`.
- Campos multivalor (tags, fotos, referenciaCruzada, caracteristicas, formasPagamento, servicosRealizados) são JSON serializado em coluna `String`, parseado manualmente em cada getter.
- Fornecedor tem endereço/dados bancários "achatados" no banco e re-aninhados na camada de actions.
- Estoque (`Produto.estoqueAtual`) é mantido por `$transaction` em toda venda, compra e OS (create/update/delete).
- Numeração sequencial (`OS-0001`, `PED-001`) calculada por `findFirst` no último registro.

## 4. Modelo de dados (19 models Prisma, 7 migrations)

| Domínio | Models |
|---|---|
| Catálogo | `Produto` (≈80 colunas: fiscal, precificação, estoque, ML), `VeiculoCompativel` (cascade) |
| Oficina | `OrdemServico`, `ItemOrdemServico`, `Cliente`, `Veiculo` (cliente/veículo opcionais na OS; `SetNull` ao apagar cadastro) |
| Estoque | `EntradaEstoque` + `ItemMovimentacao_entrada` (compras/NF), `SaidaEstoque` + `ItemMovimentacao_saida` (vendas) |
| Cadastros | `Fornecedor`, `Funcionario`, `Gasto` (`@@map("gastos")`) |
| Site | `MensagemContato` (contato + "pedidos" do carrinho) |
| Auth | `User` (role: cliente/funcionario/admin), `Account`, `Session`, `VerificationToken` |
| Integração | `MercadoLivreToken` (uma linha, refresh automático) |

## 5. Módulos e estado real

| Módulo | Rota | Estado | Observação |
|---|---|---|---|
| Dashboard | `/admin/dashboard` | ✅ Pronto | KPIs reais (vendas, CMV, margem, contas a pagar), gráficos Recharts, quadro de pátio |
| Ordens de Serviço | `/admin/ordens-servico` | ✅ Pronto | Kanban por status, form com peças, autocomplete de cliente, histórico por placa |
| Clientes & Veículos | `/admin/clientes` | ✅ Pronto | Fase 3 do planejamento (último commit) |
| Produtos | `/admin/produtos` | ✅ Pronto | Form 480 linhas em abas; publica no ML ao criar |
| Compras (entrada) | `/admin/compras` | ✅ Pronto | Só criar/excluir; botão "Editar" sem fluxo ligado |
| Vendas (saída) | `/admin/vendas` | ✅ Pronto | Só criar/excluir |
| Fornecedores | `/admin/fornecedores` | ✅ Pronto | |
| Gastos | `/admin/gastos` | ✅ Pronto | Só admin |
| Funcionários | `/admin/funcionarios` | ✅ Pronto | Só admin; não ligado ao `User`/login |
| Usuários (papéis) | `/admin/usuarios` | ✅ Pronto | Promoção manual + `ADMIN_EMAILS` no 1º login |
| Mensagens | `/admin/mensagens` | ✅ Pronto | Lida/não lida |
| Integrações | `/admin/integracoes` | ⚠️ Parcial | Só conectar ML; sem sync de estoque/preço, sem webhooks |
| Estoque | `/admin/estoque` | ⛔ Placeholder | "Em construção" — mas está no menu com badge fixo "3" |
| Relatórios | `/admin/relatorios` | ⛔ Placeholder | "Em construção" |
| Loja pública | `/`, `/produtos`, `/produto/[slug]` | ✅ Pronto | Só `exibirNoSite`; ISR 60s na home |
| Carrinho | `/carrinho` | ⚠️ Parcial | Sem checkout: "Finalizar" vira mensagem de contato |
| Contato | `/contato` | ✅ Pronto | Persiste em `MensagemContato` |
| Login | `/login` | ✅ Pronto | Só Google |
| Busca do header admin | — | ⛔ Decorativa | Input sem handler |
| Notificações (sino) | — | ⛔ Decorativa | 3 itens hardcoded ("Pedido #1255", "NF Bosch") |

## 6. Autenticação e permissões

- Papéis: `cliente` (padrão ao criar conta), `funcionario`, `admin`.
- `proxy.ts` cobre só navegação em `/admin/*`. Rotas só-admin: gastos, funcionários, integrações, relatórios, usuários.
- `requireAdmin()` / `requireStaff()` são a proteção real, mas **não estão em todas as actions** (ver §8.1).
- Rotas `/api/mercado-livre/*` checam `role === 'admin'` diretamente.
- `/login` valida `callbackUrl` contra open redirect. `trustHost: true`.

## 7. Fluxo de estoque

```
Compra (EntradaEstoque)  ──► +quantidade ─┐
Venda (SaidaEstoque)     ──► −quantidade ─┼─► Produto.estoqueAtual   (tudo em $transaction)
OS com peças             ──► −quantidade ─┘
Editar: repõe itens antigos e aplica os novos.  Excluir: desfaz.
Exceção: mudar status da OS para "cancelado" NÃO devolve as peças (só o delete devolve).
```

## 8. Pontos de atenção

### 8.1 Alta — Server Actions sem guarda de autorização
Qualquer usuário logado com Google (papel `cliente`) consegue invocar diretamente, fora do `/admin`:
- `createProduto`, `updateProduto` (produtos.ts)
- `createFornecedor`, `updateFornecedor` + getters (fornecedores.ts)
- `createSaidaEstoque`, `updateSaidaEstoque` + getters de vendas (vendas.ts)
- `createEntradaEstoque`, `updateEntradaEstoque` + getters de compras (entradas-estoque.ts)
- `atualizarStatusOrdemServico`, `getOrdensServico`, `getOrdemServico` (ordens-servico.ts)

Só os `delete*` e os módulos mais novos (clientes, gastos, funcionários, dashboard, usuários, mensagens) estão guardados. O próprio comentário em `lib/auth-guard.ts` reconhece que o `proxy.ts` não protege actions.

### 8.2 Alta — `mode: 'insensitive'` não existe no SQLite
11 ocorrências em produtos, vendas, compras, fornecedores, funcionários, gastos e OS. O Prisma só aceita `mode` em PostgreSQL/MongoDB; no SQLite gera erro de validação, o `try/catch` engole e a listagem devolve `[]`. Resultado prático: **qualquer busca por texto nessas telas retorna vazio**. `clientes.ts` (mais novo) já não usa `mode` — é o padrão a seguir. O `whereClause: any` esconde o erro do TypeScript.

### 8.3 Média — Dados internos de custo expostos na loja pública
`getProdutosPublicos` / `getProdutoBySlug` entregam o `Produto` inteiro (custoAquisicao, margemLucro, precoMinimo, precoB2B, alíquotas, localização no estoque…) para `ProductCard` (client component) e para o carrinho (localStorage). `GET /api/produtos/promocoes` também retorna as linhas completas, sem autenticação. Falta um `select`/DTO público.

### 8.4 Média — Ícones do PWA não existem
`app/manifest.ts` referencia `/icon-192.png`, `/icon-512.png`, `/icon-maskable-512.png`; nenhum está em `public/`. A instalação como app falha/mostra ícone genérico.

### 8.5 Média — Numeração sequencial com race condition
`proximoNumero()` (OS) e `proximoNumeroPedido()` (venda) leem o último registro e somam 1. Duas criações simultâneas colidem no `@unique numero` (OS) ou geram números duplicados (venda, sem unique).

### 8.6 Média — Validação só no cliente
Todas as actions de escrita recebem `data: any` e gravam sem revalidar com zod no servidor. Os schemas zod existem só dentro dos forms.

### 8.7 Baixa — Variáveis de ambiente não documentadas
`.env.example` não lista `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` nem `ADMIN_EMAILS` — todas necessárias para logar. Migrations em produção são aplicadas manualmente com `scripts/apply-turso-migration.mjs`, sem passo automatizado.

### 8.8 Baixa — Identidade visual inconsistente
Três nomes diferentes (AutoPeças Pro / Silvio Auto Elétrica e Mecânica / Oficina). Página de contato com WhatsApp placeholder (`5511934567890`) e promessas de "entrega para todo Brasil / 12x sem juros" que o site não cumpre (não há checkout). README aponta para `seu-usuario/autopecas-pro` e uma `LICENSE` que não existe.

## 9. Dívida técnica

- **57 usos de `any`** em app/components/lib; `lib/types.ts` (`Produto`) diverge do schema Prisma (strings não-nulas vs. `String?`), forçando `as unknown as Produto` em várias páginas.
- **Admin quase todo `'use client'`**: 19 de 20 páginas fazem `useEffect` → server action ao montar, carregando `getProdutos(1, 1000)`/`getFornecedores(1, 1000)`. A paginação existe nas actions mas nenhuma tela a usa; sem SSR, sem `loading.tsx`, sem `error.tsx`.
- **Parse de JSON repetido** em 4 getters de produto (mesmo bloco de 4 linhas copiado).
- **Arquivos duplicados**: `hooks/use-toast.ts` = `components/ui/use-toast.ts`; `hooks/use-mobile.ts` ≈ `components/ui/use-mobile.tsx`; `styles/globals.css` não é importado (o vivo é `app/globals.css`).
- **35 de 55 componentes shadcn/ui nunca importados** (accordion, calendar, chart, command, form, sidebar, table, pagination…). A `Table` do shadcn existe mas as listas usam `<table>` manual.
- **`prisma/seed.ts` (1.724 linhas)** e `scripts/seed-exemplo-producao.mjs` repetem os mesmos dados de fornecedores em dois formatos.
- Compras: botão "Editar" renderizado sem fluxo de edição ligado.
- `next.config.mjs` com `typescript: {}` vazio e `images.unoptimized: true`.

## 10. O que está bem feito

- Comentários explicam o **porquê** (ex.: por que a promoção a admin fica no `jwt` callback e não no `signIn`; por que `Cliente` não se liga a `User`).
- Estoque consistente por transação em todos os caminhos de escrita, incluindo edição e exclusão.
- Tradução de `FOREIGN KEY constraint failed` para mensagens que o usuário entende.
- Helpers pequenos e certeiros: `parseDateFields`, `optionalNumber`, `nullsToUndefined`, `avisarErroValidacao` — cada um nasce de um bug real documentado no git.
- OS aceita cliente avulso ou cadastrado, sem travar o balcão; histórico por placa cobre os dois casos.
- Proteção contra open redirect no login; auto-promoção de admin resolve o "primeiro admin".
- Publicação no ML nunca bloqueia o cadastro do produto; erro fica gravado no produto para reenvio.

## 11. Próximos passos sugeridos (ordem de prioridade)

1. **Guardar todas as actions de escrita/leitura do admin** com `requireStaff()`/`requireAdmin()` (1–2 h; fecha §8.1).
2. **Remover `mode: 'insensitive'`** das 11 buscas e tipar `whereClause` com `Prisma.XWhereInput` (30 min; fecha §8.2).
3. **DTO público de produto** (`select` só dos campos de vitrine) para loja, carrinho e `/api/produtos/promocoes` (§8.3).
4. Gerar os PNGs do manifest ou apontar para os ícones existentes (§8.4).
5. Documentar `AUTH_*` e `ADMIN_EMAILS` no `.env.example`; automatizar `prisma migrate deploy` no Turso.
6. Decidir o destino de `/admin/estoque` e `/admin/relatorios`: implementar ou tirar do menu (e remover o badge "3" e as notificações fixas).
7. Validar `data` com zod no servidor (reaproveitando os schemas dos forms) e eliminar `any` nas actions.
8. Converter listagens do admin para Server Components com paginação real, `loading.tsx` e `error.tsx`.
9. Unificar identidade (nome, WhatsApp, promessas da home) e limpar componentes/arquivos duplicados.
10. Adicionar testes mínimos nas actions de estoque (as regras mais valiosas do sistema) e um workflow de lint+build no GitHub.
