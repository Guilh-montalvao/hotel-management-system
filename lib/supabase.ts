import { createClient } from "@supabase/supabase-js";

// Verificamos se as variáveis de ambiente estão definidas
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
) {
  console.warn(
    "Variáveis de ambiente do Supabase ausentes. Verifique se o arquivo .env.local está presente e contém NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

// Usamos apenas as variáveis de ambiente, sem fallbacks com credenciais
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
