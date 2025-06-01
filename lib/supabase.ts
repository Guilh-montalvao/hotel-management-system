/**
 * Arquivo de configuração do cliente Supabase
 *
 * Este arquivo inicializa e exporta o cliente Supabase que será usado
 * em toda a aplicação para interagir com o banco de dados.
 *
 * O Supabase é uma alternativa de código aberto ao Firebase, fornecendo:
 * - Banco de dados PostgreSQL
 * - Autenticação
 * - Armazenamento de arquivos
 * - API RESTful automática
 * - Funções Edge
 */

import { createClient } from "@supabase/supabase-js";

/**
 * Verificação das variáveis de ambiente necessárias
 *
 * Este bloco verifica se as variáveis de ambiente obrigatórias para
 * conectar ao Supabase estão definidas, exibindo um aviso caso não estejam.
 */
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
) {
  console.warn(
    "Variáveis de ambiente do Supabase ausentes. Verifique se o arquivo .env.local está presente e contém NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

/**
 * URLs e chaves de acesso ao Supabase
 *
 * Estas variáveis devem ser definidas no arquivo .env.local.
 * O uso das variáveis de ambiente é essencial para manter a segurança
 * e permitir diferentes configurações em ambientes de desenvolvimento e produção.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/**
 * Instância do cliente Supabase
 *
 * Este cliente será utilizado em todos os serviços e componentes que precisam
 * acessar o banco de dados, fornecendo métodos para:
 * - Autenticação de usuários
 * - Consultas ao banco de dados
 * - Upload e download de arquivos
 * - Chamadas a funções do lado do servidor
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
