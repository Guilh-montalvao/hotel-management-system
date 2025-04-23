"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

/**
 * Componente para alternar entre os modos de tema (claro e escuro)
 * Ao ser clicado, alterna automaticamente entre os dois modos
 */
export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Garante que o componente seja renderizado apenas no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Função para alternar entre os modos claro e escuro
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Renderize um placeholder durante a renderização do servidor
  // ou antes da montagem no cliente para evitar erros de hidratação
  if (!mounted) {
    return (
      <Button variant="outline" size="icon">
        <span className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Alternar tema</span>
      </Button>
    );
  }

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme}>
      {theme === "dark" ? (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}
