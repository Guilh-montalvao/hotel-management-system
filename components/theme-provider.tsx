"use client";

import * as React from "react";
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";

/**
 * Provedor de tema da aplicação
 * Encapsula o provedor de temas do next-themes para fornecer funcionalidade de tema em toda a aplicação
 * @param children - Componentes filhos que terão acesso ao contexto do tema
 * @param props - Propriedades adicionais para configuração do tema
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
