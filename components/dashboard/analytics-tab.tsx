"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUpIcon,
  TrendingDownIcon,
  UsersIcon,
  CalendarIcon,
  DollarSignIcon,
  PercentIcon,
} from "lucide-react";
import { dashboardService } from "@/lib/services/dashboard-service";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AnalyticsData {
  occupancyTrend: Array<{ date: string; rate: number }>;
  revenueTrend: Array<{ date: string; amount: number }>;
  guestAnalytics: {
    newGuests: number;
    returningGuests: number;
    averageStay: number;
  };
  roomTypePerformance: Array<{
    type: string;
    occupancyRate: number;
    revenue: number;
    averageRate: number;
  }>;
  monthlyComparison: {
    currentMonth: {
      revenue: number;
      bookings: number;
      occupancy: number;
    };
    previousMonth: {
      revenue: number;
      bookings: number;
      occupancy: number;
    };
  };
}

export function AnalyticsTab() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("30d");

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        // Simular dados de análise (em um sistema real, viria do backend)
        const mockData: AnalyticsData = {
          occupancyTrend: Array.from({ length: 30 }, (_, i) => ({
            date: format(subDays(new Date(), 29 - i), "yyyy-MM-dd"),
            rate: Math.floor(Math.random() * 40) + 60, // 60-100%
          })),
          revenueTrend: Array.from({ length: 30 }, (_, i) => ({
            date: format(subDays(new Date(), 29 - i), "yyyy-MM-dd"),
            amount: Math.floor(Math.random() * 5000) + 2000, // R$ 2000-7000
          })),
          guestAnalytics: {
            newGuests: 45,
            returningGuests: 23,
            averageStay: 2.3,
          },
          roomTypePerformance: [
            {
              type: "Solteiro",
              occupancyRate: 85,
              revenue: 15000,
              averageRate: 120,
            },
            {
              type: "Casal",
              occupancyRate: 92,
              revenue: 28000,
              averageRate: 180,
            },
            {
              type: "Suíte",
              occupancyRate: 78,
              revenue: 12000,
              averageRate: 250,
            },
          ],
          monthlyComparison: {
            currentMonth: { revenue: 55000, bookings: 156, occupancy: 87 },
            previousMonth: { revenue: 48000, bookings: 142, occupancy: 82 },
          },
        };

        setAnalyticsData(mockData);
      } catch (error) {
        console.error("Erro ao carregar dados de análise:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedPeriod]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  const calculateGrowth = (current: number, previous: number) => {
    return ((current - previous) / previous) * 100;
  };

  const revenueGrowth = calculateGrowth(
    analyticsData.monthlyComparison.currentMonth.revenue,
    analyticsData.monthlyComparison.previousMonth.revenue
  );

  const bookingsGrowth = calculateGrowth(
    analyticsData.monthlyComparison.currentMonth.bookings,
    analyticsData.monthlyComparison.previousMonth.bookings
  );

  const occupancyGrowth = calculateGrowth(
    analyticsData.monthlyComparison.currentMonth.occupancy,
    analyticsData.monthlyComparison.previousMonth.occupancy
  );

  return (
    <div className="space-y-6">
      {/* Período de análise */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Análises Detalhadas</h3>
        <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <TabsList>
            <TabsTrigger value="7d">7 dias</TabsTrigger>
            <TabsTrigger value="30d">30 dias</TabsTrigger>
            <TabsTrigger value="90d">90 dias</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Métricas de crescimento */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Crescimento da Receita
            </CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {revenueGrowth > 0 ? "+" : ""}
              {revenueGrowth.toFixed(1)}%
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {revenueGrowth > 0 ? (
                <TrendingUpIcon className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <TrendingDownIcon className="mr-1 h-3 w-3 text-red-500" />
              )}
              vs. mês anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Crescimento de Reservas
            </CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bookingsGrowth > 0 ? "+" : ""}
              {bookingsGrowth.toFixed(1)}%
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {bookingsGrowth > 0 ? (
                <TrendingUpIcon className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <TrendingDownIcon className="mr-1 h-3 w-3 text-red-500" />
              )}
              vs. mês anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Crescimento da Ocupação
            </CardTitle>
            <PercentIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {occupancyGrowth > 0 ? "+" : ""}
              {occupancyGrowth.toFixed(1)}%
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {occupancyGrowth > 0 ? (
                <TrendingUpIcon className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <TrendingDownIcon className="mr-1 h-3 w-3 text-red-500" />
              )}
              vs. mês anterior
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análise de hóspedes */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Análise de Hóspedes</CardTitle>
            <CardDescription>
              Distribuição de novos vs. recorrentes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Novos Hóspedes</span>
              </div>
              <Badge variant="secondary">
                {analyticsData.guestAnalytics.newGuests}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4 text-green-500" />
                <span className="text-sm">Hóspedes Recorrentes</span>
              </div>
              <Badge variant="secondary">
                {analyticsData.guestAnalytics.returningGuests}
              </Badge>
            </div>
            <div className="pt-2">
              <div className="flex items-center justify-between text-sm">
                <span>Tempo médio de estadia</span>
                <span className="font-medium">
                  {analyticsData.guestAnalytics.averageStay} dias
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance por Tipo de Quarto</CardTitle>
            <CardDescription>Taxa de ocupação e receita</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analyticsData.roomTypePerformance.map((room) => (
              <div key={room.type} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{room.type}</span>
                  <span className="text-sm text-muted-foreground">
                    {room.occupancyRate}%
                  </span>
                </div>
                <Progress value={room.occupancyRate} className="h-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>R$ {room.revenue.toLocaleString()}</span>
                  <span>Média: R$ {room.averageRate}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Insights e recomendações */}
      <Card>
        <CardHeader>
          <CardTitle>Insights e Recomendações</CardTitle>
          <CardDescription>Análise automática dos dados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {revenueGrowth > 10 && (
              <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                <TrendingUpIcon className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Excelente crescimento!
                  </p>
                  <p className="text-xs text-green-600">
                    A receita cresceu {revenueGrowth.toFixed(1)}% este mês.
                    Continue com as estratégias atuais.
                  </p>
                </div>
              </div>
            )}

            {analyticsData.roomTypePerformance.some(
              (room) => room.occupancyRate < 70
            ) && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                <TrendingDownIcon className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Atenção à ocupação
                  </p>
                  <p className="text-xs text-yellow-600">
                    Alguns tipos de quarto têm ocupação baixa. Considere
                    promoções ou ajustes de preço.
                  </p>
                </div>
              </div>
            )}

            {analyticsData.guestAnalytics.returningGuests /
              (analyticsData.guestAnalytics.newGuests +
                analyticsData.guestAnalytics.returningGuests) >
              0.4 && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                <UsersIcon className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Alta fidelização
                  </p>
                  <p className="text-xs text-blue-600">
                    {Math.round(
                      (analyticsData.guestAnalytics.returningGuests /
                        (analyticsData.guestAnalytics.newGuests +
                          analyticsData.guestAnalytics.returningGuests)) *
                        100
                    )}
                    % dos hóspedes são recorrentes. Excelente retenção!
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
