import { redirect } from "next/navigation";

/**
 * Página inicial do aplicativo
 * Redireciona automaticamente o usuário para a página do painel de controle (dashboard)
 */
export default function Home() {
  redirect("/dashboard");
}
