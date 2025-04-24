# Sistema de Gestão Hoteleira

Sistema completo para gerenciamento de hotel desenvolvido com Next.js 15, TypeScript e Tailwind CSS.

## Funcionalidades

- **Dashboard**: Painel completo com métricas, gráficos e visão geral do hotel
- **Gestão de Quartos**: Cadastro, visualização e gerenciamento de quartos
- **Gestão de Reservas**: Sistema de reservas com status e detalhamento
- **Gestão de Hóspedes**: Cadastro e gerenciamento de hóspedes
- **Gestão de Pagamentos**: Controle financeiro e pagamentos

## Tecnologias

- [Next.js 15](https://nextjs.org/) - Framework React
- [TypeScript](https://www.typescriptlang.org/) - Linguagem de programação
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Radix UI](https://www.radix-ui.com/) - Componentes primitivos de UI
- [Recharts](https://recharts.org/) - Biblioteca de gráficos
- [React Hook Form](https://react-hook-form.com/) - Gerenciamento de formulários
- [Zod](https://zod.dev/) - Validação de dados

## Requisitos

- Node.js 20.x ou superior
- npm ou yarn

## Instalação

```bash
# Clone o repositório
git clone []

# Entre na pasta do projeto
cd v0-untitled-project

# Instale as dependências
npm install
# ou
yarn install

# Inicie o servidor de desenvolvimento
npm run dev
# ou
yarn dev
```

O aplicativo estará disponível em [http://localhost:3000](http://localhost:3000)

## Estrutura do Projeto

```
app/               # Diretórios de rotas do Next.js App Router
  ├── bookings/    # Gestão de reservas
  ├── dashboard/   # Painel principal
  ├── guests/      # Gestão de hóspedes
  ├── payments/    # Gestão de pagamentos
  └── rooms/       # Gestão de quartos
components/        # Componentes reutilizáveis
  ├── bookings/    # Componentes de reservas
  ├── dashboard/   # Componentes do painel
  ├── guests/      # Componentes de hóspedes
  ├── rooms/       # Componentes de quartos
  └── ui/          # Componentes de UI genéricos
hooks/             # Hooks personalizados
lib/               # Funções utilitárias
public/            # Arquivos estáticos
styles/            # Estilos globais
```

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria a versão de produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter

## Licença

Este projeto é licenciado sob a licença MIT - veja o arquivo LICENSE para mais detalhes.
