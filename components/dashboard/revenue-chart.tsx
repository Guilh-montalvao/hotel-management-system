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

/**
 * Dados de exemplo para o gráfico de receitas
 * Contém informações de receitas e despesas mensais
 */
const data = [
  { name: "Jan", revenue: 32000, expenses: 21000 },
  { name: "Fev", revenue: 38000, expenses: 24000 },
  { name: "Mar", revenue: 45000, expenses: 28000 },
  { name: "Abr", revenue: 40000, expenses: 25000 },
  { name: "Mai", revenue: 42000, expenses: 27000 },
  { name: "Jun", revenue: 48000, expenses: 30000 },
];

/**
 * Componente de gráfico de barras para visualização de receitas
 * Exibe a receita e despesas em um comparativo mensal
 */
export function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        {/* Grade de fundo do gráfico */}
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="hsl(var(--border))"
        />
        {/* Eixo X com os nomes dos meses */}
        <XAxis
          dataKey="name"
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
                        {payload[0].payload.name}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Receita
                      </span>
                      <span className="font-bold">
                        R${payload[0].value.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex flex-col col-span-2">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Despesas
                      </span>
                      <span className="font-bold">
                        R${payload[1].value.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        {/* Barras representando receitas e despesas */}
        <Bar
          dataKey="revenue"
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="expenses"
          fill="hsl(var(--muted))"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
