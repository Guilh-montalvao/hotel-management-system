"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, DownloadIcon, SettingsIcon } from "lucide-react";

export function DownloadInstructions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <InfoIcon className="h-4 w-4 mr-2" />
          Downloads bloqueados?
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DownloadIcon className="h-5 w-5" />
            Como Permitir Downloads Automáticos
          </DialogTitle>
          <DialogDescription>
            Se os downloads estão sendo bloqueados, siga estas instruções para
            permitir downloads automáticos neste site.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              <strong>Problema:</strong> O navegador está bloqueando downloads
              automáticos por segurança.
              <br />
              <strong>Solução:</strong> Configure o site como confiável para
              downloads.
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <SettingsIcon className="h-4 w-4" />
                Google Chrome
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Clique no ícone de cadeado 🔒 na barra de endereços</li>
                <li>Selecione "Configurações do site"</li>
                <li>Procure por "Downloads automáticos"</li>
                <li>Altere para "Permitir"</li>
                <li>Recarregue a página</li>
              </ol>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Microsoft Edge</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Clique no ícone de informações 🛈 na barra de endereços</li>
                <li>Clique em "Permissões para este site"</li>
                <li>Encontre "Downloads automáticos"</li>
                <li>Altere para "Permitir"</li>
                <li>Recarregue a página</li>
              </ol>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Firefox</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Clique no ícone de escudo 🛡️ na barra de endereços</li>
                <li>Clique em "Configurações de proteção"</li>
                <li>
                  Desative temporariamente a "Proteção aprimorada contra
                  rastreamento"
                </li>
                <li>Ou adicione este site às exceções</li>
              </ol>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold mb-2 text-blue-800">
                💡 Alternativa
              </h4>
              <p className="text-sm text-blue-700">
                Se ainda assim não funcionar, use a opção{" "}
                <strong>"Visualizar PDF"</strong> que abre o relatório em uma
                nova aba, onde você pode salvá-lo manualmente usando Ctrl+S ou o
                menu do navegador.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setIsOpen(false)}>Entendi</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
