"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ChevronDownIcon, XIcon } from "lucide-react";

export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: "default" | "destructive" | "secondary";
  action: (selectedIds: string[]) => void | Promise<void>;
  confirmMessage?: string;
}

interface BulkActionsProps {
  items: Array<{ id: string; [key: string]: any }>;
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  actions: BulkAction[];
  children: (
    item: any,
    isSelected: boolean,
    onToggle: () => void
  ) => React.ReactNode;
}

export function BulkActions({
  items,
  selectedIds,
  onSelectionChange,
  actions,
  children,
}: BulkActionsProps) {
  const [isExecuting, setIsExecuting] = useState<string | null>(null);

  const isAllSelected = items.length > 0 && selectedIds.length === items.length;
  const isPartiallySelected =
    selectedIds.length > 0 && selectedIds.length < items.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(items.map((item) => item.id));
    }
  };

  const handleToggleItem = (itemId: string) => {
    if (selectedIds.includes(itemId)) {
      onSelectionChange(selectedIds.filter((id) => id !== itemId));
    } else {
      onSelectionChange([...selectedIds, itemId]);
    }
  };

  const handleAction = async (action: BulkAction) => {
    if (selectedIds.length === 0) return;

    if (action.confirmMessage) {
      const confirmed = window.confirm(
        `${action.confirmMessage}\n\nEsta ação afetará ${selectedIds.length} ${
          selectedIds.length === 1 ? "item" : "itens"
        }.`
      );
      if (!confirmed) return;
    }

    setIsExecuting(action.id);
    try {
      await action.action(selectedIds);
      onSelectionChange([]); // Limpar seleção após ação
    } catch (error) {
      console.error(`Erro ao executar ação ${action.label}:`, error);
    } finally {
      setIsExecuting(null);
    }
  };

  const clearSelection = () => {
    onSelectionChange([]);
  };

  return (
    <div className="space-y-4">
      {/* Barra de controle de seleção */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} />
          <span className="text-sm text-muted-foreground">
            {selectedIds.length === 0
              ? `Selecionar todos (${items.length})`
              : `${selectedIds.length} de ${items.length} selecionados`}
          </span>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              {selectedIds.length} selecionado
              {selectedIds.length !== 1 ? "s" : ""}
            </Badge>

            {actions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isExecuting !== null}
                  >
                    Ações
                    <ChevronDownIcon className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {actions.map((action, index) => (
                    <div key={action.id}>
                      <DropdownMenuItem
                        onClick={() => handleAction(action)}
                        disabled={isExecuting !== null}
                        className={
                          action.variant === "destructive"
                            ? "text-destructive"
                            : ""
                        }
                      >
                        {action.icon && (
                          <action.icon className="mr-2 h-4 w-4" />
                        )}
                        {isExecuting === action.id
                          ? "Executando..."
                          : action.label}
                      </DropdownMenuItem>
                      {index < actions.length - 1 &&
                        action.variant === "destructive" && (
                          <DropdownMenuSeparator />
                        )}
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button variant="ghost" size="sm" onClick={clearSelection}>
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Lista de itens */}
      <div className="space-y-2">
        {items.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <div
              key={item.id}
              className={`transition-colors ${isSelected ? "bg-muted/50" : ""}`}
            >
              {children(item, isSelected, () => handleToggleItem(item.id))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Hook para gerenciar seleção
export function useBulkSelection() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const clearSelection = () => setSelectedIds([]);

  const selectAll = (items: Array<{ id: string }>) => {
    setSelectedIds(items.map((item) => item.id));
  };

  const toggleItem = (itemId: string) => {
    setSelectedIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  return {
    selectedIds,
    setSelectedIds,
    clearSelection,
    selectAll,
    toggleItem,
  };
}
