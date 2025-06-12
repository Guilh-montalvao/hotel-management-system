"use client";

import { useState } from "react";
import { CalendarIcon, FilterIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface FilterConfig {
  key: string;
  label: string;
  type: "text" | "select" | "date" | "dateRange" | "number" | "numberRange";
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export interface FilterValue {
  [key: string]: any;
}

interface AdvancedFiltersProps {
  filters: FilterConfig[];
  values: FilterValue;
  onChange: (values: FilterValue) => void;
  onClear: () => void;
}

export function AdvancedFilters({
  filters,
  values,
  onChange,
  onClear,
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: string, value: any) => {
    onChange({
      ...values,
      [key]: value,
    });
  };

  const removeFilter = (key: string) => {
    const newValues = { ...values };
    delete newValues[key];
    onChange(newValues);
  };

  const getActiveFiltersCount = () => {
    return Object.keys(values).filter((key) => {
      const value = values[key];
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== undefined && value !== null && value !== "";
    }).length;
  };

  const renderFilterInput = (filter: FilterConfig) => {
    const value = values[filter.key];

    switch (filter.type) {
      case "text":
        return (
          <Input
            placeholder={filter.placeholder}
            value={value || ""}
            onChange={(e) => updateFilter(filter.key, e.target.value)}
          />
        );

      case "select":
        return (
          <Select
            value={value || ""}
            onValueChange={(newValue) => updateFilter(filter.key, newValue)}
          >
            <SelectTrigger>
              <SelectValue placeholder={filter.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "date":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value
                  ? format(new Date(value), "dd/MM/yyyy", { locale: ptBR })
                  : filter.placeholder}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) =>
                  updateFilter(filter.key, date?.toISOString())
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      case "dateRange":
        return (
          <div className="space-y-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value?.from
                    ? format(new Date(value.from), "dd/MM/yyyy", {
                        locale: ptBR,
                      })
                    : "Data inicial"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={value?.from ? new Date(value.from) : undefined}
                  onSelect={(date) =>
                    updateFilter(filter.key, {
                      ...value,
                      from: date?.toISOString(),
                    })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value?.to
                    ? format(new Date(value.to), "dd/MM/yyyy", { locale: ptBR })
                    : "Data final"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={value?.to ? new Date(value.to) : undefined}
                  onSelect={(date) =>
                    updateFilter(filter.key, {
                      ...value,
                      to: date?.toISOString(),
                    })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        );

      case "number":
        return (
          <Input
            type="number"
            placeholder={filter.placeholder}
            value={value || ""}
            onChange={(e) =>
              updateFilter(
                filter.key,
                e.target.value ? Number(e.target.value) : undefined
              )
            }
          />
        );

      case "numberRange":
        return (
          <div className="space-y-2">
            <Input
              type="number"
              placeholder="Valor mínimo"
              value={value?.min || ""}
              onChange={(e) =>
                updateFilter(filter.key, {
                  ...value,
                  min: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
            <Input
              type="number"
              placeholder="Valor máximo"
              value={value?.max || ""}
              onChange={(e) =>
                updateFilter(filter.key, {
                  ...value,
                  max: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </div>
        );

      default:
        return null;
    }
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <FilterIcon className="mr-2 h-4 w-4" />
              Filtros Avançados
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filtros Avançados</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClear}
                  disabled={activeFiltersCount === 0}
                >
                  Limpar Tudo
                </Button>
              </div>

              {filters.map((filter) => (
                <div key={filter.key} className="space-y-2">
                  <Label htmlFor={filter.key}>{filter.label}</Label>
                  {renderFilterInput(filter)}
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <XIcon className="mr-2 h-4 w-4" />
            Limpar Filtros
          </Button>
        )}
      </div>

      {/* Mostrar filtros ativos como badges */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(values).map(([key, value]) => {
            if (!value || (Array.isArray(value) && value.length === 0))
              return null;

            const filter = filters.find((f) => f.key === key);
            if (!filter) return null;

            let displayValue = "";
            if (filter.type === "dateRange" && value.from && value.to) {
              displayValue = `${format(new Date(value.from), "dd/MM", {
                locale: ptBR,
              })} - ${format(new Date(value.to), "dd/MM", { locale: ptBR })}`;
            } else if (filter.type === "date") {
              displayValue = format(new Date(value), "dd/MM/yyyy", {
                locale: ptBR,
              });
            } else if (
              filter.type === "numberRange" &&
              (value.min || value.max)
            ) {
              displayValue = `${value.min || "∞"} - ${value.max || "∞"}`;
            } else if (filter.type === "select") {
              const option = filter.options?.find((opt) => opt.value === value);
              displayValue = option?.label || value;
            } else {
              displayValue = String(value);
            }

            return (
              <Badge key={key} variant="secondary" className="gap-1">
                {filter.label}: {displayValue}
                <XIcon
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFilter(key)}
                />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
