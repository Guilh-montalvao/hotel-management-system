"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/chart";

interface RevenueChartProps {
  data: any[];
  isLoading: boolean;
}

/**
 * Componente de gráfico de barras para visualização de receitas
 * Exibe a receita semanal dos últimos 30 dias
 */
export function RevenueChart({ data, isLoading }: RevenueChartProps) {
  // Dados de fallback caso não haja dados reais
  const fallbackData = [
    { week: "Sem 1", revenue: 0 },
    { week: "Sem 2", revenue: 0 },
    { week: "Sem 3", revenue: 0 },
    { week: "Sem 4", revenue: 0 },
  ];

  const chartData = data && data.length > 0 ? data : fallbackData;

  if (isLoading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <div className="text-muted-foreground">Carregando dados...</div>
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        {/* Grade de fundo do gráfico */}
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="hsl(var(--border))"
        />
        {/* Eixo X com os nomes das semanas */}
        <XAxis
          dataKey="week"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        {/* Eixo Y com os valores formatados em reais */}
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `R$${value / 1000}k`}
        />
        {/* Tooltip personalizado exibido ao passar o mouse sobre as barras */}
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Mês
                      </span>
                      <span className="font-bold text-muted-foreground">
                        {payload[0]?.payload?.week || "N/A"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Receita
                      </span>
                      <span className="font-bold">
                        R${" "}
                        {typeof payload[0]?.value === "number"
                          ? payload[0].value.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : "0,00"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        {/* Barras representando receitas */}
        <Bar
          dataKey="revenue"
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
