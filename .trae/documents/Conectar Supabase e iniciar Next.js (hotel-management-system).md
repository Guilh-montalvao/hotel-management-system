## Esclarecimento Rápido
- O Supabase usa PostgreSQL por baixo. No seu projeto Next.js, a integração correta no front/edge é via `@supabase/supabase-js` (chaves `NEXT_PUBLIC_*`).
- Conexão direta via driver PostgreSQL (`pg`) só deve ser feita em código de servidor (Route Handlers/Server Actions) com a `SUPABASE_DB_URL` e nunca no navegador.
- Seu código atual já segue o padrão recomendado: `lib/supabase.ts`:15–41 e hooks/serviços consumindo `supabase.from(...)`.

## O Que Vamos Entregar
- Configurar corretamente as variáveis (`.env.local`) para o cliente Supabase.
- Instalar dependências.
- Validar a conexão (consulta simples e páginas que usam dados).
- Iniciar o servidor de desenvolvimento e fornecer preview.
- (Opcional) Adicionar um endpoint de saúde usando driver `pg` no servidor, se desejar validação PostgreSQL direta.

## Passos
1. Variáveis de Ambiente
- Criar `/.env.local` com:
  - `NEXT_PUBLIC_SUPABASE_URL=https://pesypacipkwzdotvbbbj.supabase.co`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY_DO_PROJETO>`
- Corrigir `/.env` (remover JS ou migrar para pares `KEY=VALUE`).

2. Dependências
- Executar `npm install --legacy-peer-deps` (conforme `vercel.json`). `@supabase/supabase-js` já presente (`package.json`:40).

3. Validação da Conexão
- Usar o teste já existente: `hooks/useSupabase.ts`:171–182 (`select("count")` em `guests`).
- Verificar ausência dos avisos de env em `lib/supabase.ts`:23–30.
- (Opcional) Criar `GET /api/health/supabase` no servidor com driver `pg` para checar Postgres diretamente.

4. Inicialização
- Rodar `npm run dev` e abrir `http://localhost:3000`.
- Navegar `/dashboard` e `/diagnosticos` e observar dados reais.

5. Esquema Mínimo no Supabase
- Tabelas: `rooms`, `guests`, `bookings`, `payments` com campos usados pelo código.
- RPCs: `check_room_availability(...)` e `calculate_booking_total(...)`.

## Próximo Passo
- Com sua confirmação, executo os passos acima, preparo `.env.local`, instalo, valido a conexão (incluindo opção `pg` no servidor se desejar) e inicio o projeto com preview para você validar.