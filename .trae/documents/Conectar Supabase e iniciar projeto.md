## Visão Geral
- Projeto Next.js (App Router) com `@supabase/supabase-js` centralizado em `lib/supabase.ts`.
- Variáveis esperadas: `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` em `/.env.local`.
- Arquivo `/.env` contém código JS e está inválido para uso como ambiente; será corrigido.

## Objetivos
1. Configurar ambiente com URL e chave anônima do Supabase.
2. Garantir dependências instaladas e cliente Supabase centralizado.
3. Verificar a conexão com o banco de dados.
4. Iniciar o servidor de desenvolvimento e validar.

## Passos Técnicos
### 1) Revisão e ajustes de ambiente
- Criar/atualizar `/.env.local` com:
  - `NEXT_PUBLIC_SUPABASE_URL=...`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
- Remover conteúdo JS de `/.env` (ou substituir por formato `KEY=VALUE`).
- Confirmar que `lib/supabase.ts` usa `process.env.NEXT_PUBLIC_SUPABASE_URL` e `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### 2) Obter credenciais via MCP do Supabase
- Recuperar de forma segura:
  - URL do projeto.
  - Chave anônima (anon key).
- Preencher `/.env.local` com esses valores (sem expor `service_role`).

### 3) Dependências e compatibilidade
- Instalar dependências do projeto (`npm install`).
- Validar presença de `@supabase/supabase-js` nas dependências.
- Conferir versões de Next/React/TypeScript e Tailwind.

### 4) Verificação de conexão
- Executar uma verificação simples usando o cliente:
  - `supabase.from('rooms').select('id').limit(1)` (ou outra tabela existente).
- Confirmar retorno sem erro e com status 200.

### 5) Inicialização do projeto
- Iniciar `npm run dev`.
- Abrir a aplicação e navegar à área que consome Supabase (ex.: `dashboard`, `rooms`).
- Validar carregamento de dados e ausência de erros no console.

### 6) Boas práticas de segurança
- Usar apenas `anon key` no cliente.
- Garantir que RLS está ativo nas tabelas acessadas pelo cliente.
- Não logar chaves ou segredos.

## Entregáveis
- Ambiente `.env.local` correto com variáveis do Supabase.
- Cliente Supabase funcional via `lib/supabase.ts`.
- Servidor de desenvolvimento rodando com conexão verificada.

## Próximos passos após aprovação
- Aplicar as mudanças no ambiente.
- Instalar dependências.
- Conectar ao projeto Supabase via MCP.
- Verificar e iniciar o servidor de desenvolvimento com preview.