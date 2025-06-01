/**
 * Página Inicial da Aplicação
 *
 * Esta página serve como ponto de entrada da aplicação, mas não exibe nenhum conteúdo próprio.
 * Em vez disso, redireciona automaticamente o usuário para a página do dashboard (/dashboard),
 * que é a interface principal do sistema de gerenciamento de hotel.
 *
 * O redirecionamento é feito usando a função 'redirect' do Next.js, que realiza um
 * redirecionamento no lado do servidor (SSR), evitando qualquer flash de conteúdo
 * antes do redirecionamento.
 */
import { redirect } from "next/navigation";

/**
 * Componente da página inicial
 *
 * Quando este componente é renderizado, o usuário é automaticamente
 * redirecionado para o dashboard. Não é necessário retornar nenhum
 * elemento JSX, pois o redirecionamento acontece antes da renderização.
 *
 * @returns Redirecionamento para a página do dashboard
 */
export default function Home() {
  redirect("/dashboard");
}
