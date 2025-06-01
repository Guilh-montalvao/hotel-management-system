/**
 * Arquivo de funções utilitárias para toda a aplicação
 *
 * Este arquivo contém funções auxiliares que podem ser utilizadas
 * em diversos componentes e páginas da aplicação.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Função de utilitário para mesclar classes CSS
 *
 * Esta função combina as bibliotecas clsx e tailwind-merge para criar uma
 * solução completa para mesclar classes CSS condicionalmente e resolver
 * conflitos de classes Tailwind.
 *
 * @example
 * // Uso básico
 * <div className={cn("text-red-500", isActive && "font-bold")} />
 *
 * @example
 * // Resolvendo conflitos de classes Tailwind
 * <div className={cn("px-4 bg-red-500", isSpecial && "px-8 bg-blue-500")} />
 * // Resultado com isSpecial=true: "px-8 bg-blue-500" (px-8 substitui px-4)
 *
 * @param inputs - Lista de classes CSS, expressões condicionais, ou objetos de classe
 * @returns String de classes CSS mescladas e otimizadas
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
