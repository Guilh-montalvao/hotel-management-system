"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DownloadIcon,
  FileTextIcon,
  CalendarIcon,
  UsersIcon,
  DollarSignIcon,
  HotelIcon,
  TrendingUpIcon,
  PrinterIcon,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: "financial" | "operational" | "guest" | "custom";
  estimatedTime: string;
  formats: Array<"pdf" | "excel" | "csv">;
}

const reportTemplates: ReportTemplate[] = [
  {
    id: "financial-summary",
    name: "Relatório Financeiro",
    description: "Resumo completo de receitas, despesas e lucros",
    icon: DollarSignIcon,
    category: "financial",
    estimatedTime: "2-3 min",
    formats: ["pdf", "excel"],
  },
  {
    id: "occupancy-report",
    name: "Relatório de Ocupação",
    description: "Taxa de ocupação por período e tipo de quarto",
    icon: HotelIcon,
    category: "operational",
    estimatedTime: "1-2 min",
    formats: ["pdf", "excel", "csv"],
  },
  {
    id: "guest-analytics",
    name: "Análise de Hóspedes",
    description: "Perfil dos hóspedes, frequência e preferências",
    icon: UsersIcon,
    category: "guest",
    estimatedTime: "3-4 min",
    formats: ["pdf", "excel"],
  },
  {
    id: "daily-operations",
    name: "Operações Diárias",
    description: "Check-ins, check-outs e status dos quartos",
    icon: CalendarIcon,
    category: "operational",
    estimatedTime: "1 min",
    formats: ["pdf", "csv"],
  },
  {
    id: "revenue-trends",
    name: "Tendências de Receita",
    description: "Análise de receita por período com projeções",
    icon: TrendingUpIcon,
    category: "financial",
    estimatedTime: "2-3 min",
    formats: ["pdf", "excel"],
  },
  {
    id: "custom-report",
    name: "Relatório Personalizado",
    description: "Configure seus próprios parâmetros e métricas",
    icon: FileTextIcon,
    category: "custom",
    estimatedTime: "5-10 min",
    formats: ["pdf", "excel", "csv"],
  },
];

const recentReports = [
  {
    id: "1",
    name: "Relatório Financeiro - Dezembro 2024",
    generatedAt: new Date(2024, 11, 15),
    format: "pdf",
    size: "2.3 MB",
    status: "completed",
  },
  {
    id: "2",
    name: "Ocupação - Última Semana",
    generatedAt: new Date(2024, 11, 14),
    format: "excel",
    size: "1.1 MB",
    status: "completed",
  },
  {
    id: "3",
    name: "Análise de Hóspedes - Novembro",
    generatedAt: new Date(2024, 11, 10),
    format: "pdf",
    size: "3.7 MB",
    status: "completed",
  },
];

export function ReportsTab() {
  const [generatingReports, setGeneratingReports] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const handleGenerateReport = async (reportId: string, format: string) => {
    setGeneratingReports((prev) => [...prev, `${reportId}-${format}`]);

    try {
      // Simular geração de relatório
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success(`Relatório gerado com sucesso! Download iniciado.`);

      // Em um sistema real, aqui seria feito o download do arquivo
      console.log(`Gerando relatório ${reportId} em formato ${format}`);
    } catch (error) {
      toast.error("Erro ao gerar relatório. Tente novamente.");
    } finally {
      setGeneratingReports((prev) =>
        prev.filter((id) => id !== `${reportId}-${format}`)
      );
    }
  };

  const handlePrintReport = (reportId: string) => {
    toast.info("Preparando relatório para impressão...");
    // Lógica de impressão
  };

  const filteredReports =
    selectedCategory === "all"
      ? reportTemplates
      : reportTemplates.filter(
          (report) => report.category === selectedCategory
        );

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "financial":
        return "bg-green-100 text-green-800";
      case "operational":
        return "bg-blue-100 text-blue-800";
      case "guest":
        return "bg-purple-100 text-purple-800";
      case "custom":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "financial":
        return "Financeiro";
      case "operational":
        return "Operacional";
      case "guest":
        return "Hóspedes";
      case "custom":
        return "Personalizado";
      default:
        return category;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros de categoria */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Categoria:</span>
        <div className="flex gap-2">
          {["all", "financial", "operational", "guest", "custom"].map(
            (category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category === "all" ? "Todos" : getCategoryLabel(category)}
              </Button>
            )
          )}
        </div>
      </div>

      {/* Templates de relatórios */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredReports.map((report) => (
          <Card key={report.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <report.icon className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-base">{report.name}</CardTitle>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${getCategoryBadgeColor(
                        report.category
                      )}`}
                    >
                      {getCategoryLabel(report.category)}
                    </Badge>
                  </div>
                </div>
              </div>
              <CardDescription className="text-sm">
                {report.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-xs text-muted-foreground">
                  Tempo estimado: {report.estimatedTime}
                </div>

                <div className="flex flex-wrap gap-2">
                  {report.formats.map((format) => {
                    const isGenerating = generatingReports.includes(
                      `${report.id}-${format}`
                    );
                    return (
                      <Button
                        key={format}
                        variant="outline"
                        size="sm"
                        onClick={() => handleGenerateReport(report.id, format)}
                        disabled={isGenerating}
                        className="flex items-center gap-1"
                      >
                        <DownloadIcon className="h-3 w-3" />
                        {isGenerating ? "Gerando..." : format.toUpperCase()}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePrintReport(report.id)}
                    className="flex items-center gap-1"
                  >
                    <PrinterIcon className="h-3 w-3" />
                    Imprimir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Relatórios recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Recentes</CardTitle>
          <CardDescription>Seus últimos relatórios gerados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{report.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Gerado em{" "}
                      {format(report.generatedAt, "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {report.format.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {report.size}
                  </span>
                  <Button variant="ghost" size="sm">
                    <DownloadIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dicas e informações */}
      <Card>
        <CardHeader>
          <CardTitle>Dicas para Relatórios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              • Os relatórios são gerados em tempo real com os dados mais atuais
            </p>
            <p>• Formatos PDF são ideais para apresentações e arquivamento</p>
            <p>• Formatos Excel/CSV permitem análises personalizadas</p>
            <p>• Relatórios personalizados podem ser salvos como templates</p>
            <p>• Todos os relatórios ficam disponíveis por 30 dias</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
