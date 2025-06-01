/**
 * Arquivo de Configuração do Next.js
 *
 * Este arquivo contém todas as configurações personalizadas para o framework Next.js,
 * incluindo otimizações de compilação, configurações de desenvolvimento e opções de imagem.
 *
 * @type {import('next').NextConfig} - Tipo de configuração do Next.js para suporte de tipagem
 */

const nextConfig = {
  /**
   * Configurações do ESLint
   *
   * ignoreDuringBuilds: true - Desativa a verificação do ESLint durante o processo de build,
   * o que torna a compilação mais rápida mas requer verificações manuais ou em CI/CD.
   */
  eslint: {
    ignoreDuringBuilds: true,
  },

  /**
   * Configurações do TypeScript
   *
   * ignoreBuildErrors: true - Ignora erros de TypeScript durante a compilação,
   * permitindo que o build continue mesmo com erros de tipo. Útil para desenvolvimento
   * rápido, mas não recomendado para produção sem verificações adicionais.
   */
  typescript: {
    ignoreBuildErrors: true,
  },

  /**
   * Configurações de Imagens
   *
   * unoptimized: true - Desativa a otimização automática de imagens do Next.js.
   * Útil quando se usa outras ferramentas para otimização ou quando as imagens
   * já são pré-otimizadas. Pode aumentar o tamanho do pacote final.
   */
  images: {
    unoptimized: true,
  },

  /**
   * Configurações do Webpack
   *
   * Permite personalizar a configuração do bundler Webpack usado pelo Next.js.
   * Esta função recebe a configuração atual e o contexto, e deve retornar
   * a configuração modificada.
   *
   * @param {Object} config - Configuração atual do Webpack
   * @param {Object} context - Contexto da compilação (ambiente de dev/prod, server/client)
   * @returns {Object} - Configuração do Webpack modificada
   */
  webpack: (config, { dev, isServer }) => {
    // Ativa a minimização para reduzir o tamanho do bundle
    config.optimization.minimize = true;

    // Configurações específicas para ambiente de desenvolvimento
    if (dev) {
      /**
       * Otimizações para melhorar a velocidade de compilação em desenvolvimento:
       *
       * runtimeChunk: "single" - Coloca todo o código de runtime em um único arquivo
       * removeAvailableModules: false - Não remove módulos disponíveis de chunks
       * removeEmptyChunks: false - Não remove chunks vazios
       * splitChunks: false - Desativa a divisão de chunks
       *
       * Estas configurações reduzem o tempo de compilação em desenvolvimento,
       * mas podem resultar em bundles maiores.
       */
      config.optimization.runtimeChunk = "single";
      config.optimization.removeAvailableModules = false;
      config.optimization.removeEmptyChunks = false;
      config.optimization.splitChunks = false;
    }

    return config;
  },
};

export default nextConfig;
