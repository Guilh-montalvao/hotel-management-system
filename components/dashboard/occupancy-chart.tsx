"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/chart";

interface OccupancyChartProps {
  data: any[];
  isLoading: boolean;
}

/**
 * Componente de gráfico de área para visualização da taxa de ocupação
 * Exibe a evolução da ocupação dos quartos ao longo do tempo
 */
export function OccupancyChart({ data, isLoading }: OccupancyChartProps) {
  // Dados de fallback caso não haja dados reais
  const fallbackData = [
    { day: "Seg", occupancyRate: 0 },
    { day: "Ter", occupancyRate: 0 },
    { day: "Qua", occupancyRate: 0 },
    { day: "Qui", occupancyRate: 0 },
    { day: "Sex", occupancyRate: 0 },
    { day: "Sáb", occupancyRate: 0 },
    { day: "Dom", occupancyRate: 0 },
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
      <AreaChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        {/* Definição do gradiente para preenchimento do gráfico */}
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="hsl(var(--primary))"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="hsl(var(--primary))"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        {/* Eixo X com as datas */}
        <XAxis
          dataKey="day"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        {/* Eixo Y com as percentagens de ocupação */}
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}%`}
        />
        {/* Grade do gráfico */}
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="hsl(var(--border))"
        />
        {/* Tooltip personalizado exibido ao passar o mouse */}
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Data
                      </span>
                      <span className="font-bold text-muted-foreground">
                        {payload[0].payload.day}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Ocupação
                      </span>
                      <span className="font-bold">
                        {typeof payload[0].value === "number"
                          ? payload[0].value.toFixed(1)
                          : payload[0].value}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        {/* Área preenchida representando a taxa de ocupação */}
        <Area
          type="monotone"
          dataKey="occupancyRate"
          stroke="hsl(var(--primary))"
          fillOpacity={1}
          fill="url(#colorValue)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
