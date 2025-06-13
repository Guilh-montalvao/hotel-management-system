import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Configuração de fontes para suporte ao português
const configurePDFFont = (doc: jsPDF) => {
  // Configurar fonte padrão para suporte a caracteres especiais
  doc.setFont("helvetica");
};

export interface ReportData {
  title: string;
  subtitle?: string;
  data: any[];
  columns: { header: string; dataKey: string; width?: number }[];
  summary?: { label: string; value: string | number }[];
  dateRange?: { start: Date; end: Date };
}

export class PDFService {
  /**
   * Gera um relatório PDF genérico
   */
  static generateReport(reportData: ReportData): void {
    const doc = new jsPDF();
    configurePDFFont(doc);

    // Cabeçalho do documento
    this.addHeader(doc, reportData.title, reportData.subtitle);

    // Informações de data
    if (reportData.dateRange) {
      this.addDateRange(doc, reportData.dateRange);
    }

    // Tabela principal
    this.addTable(doc, reportData.data, reportData.columns);

    // Resumo/Totais
    if (reportData.summary) {
      this.addSummary(doc, reportData.summary);
    }

    // Rodapé
    this.addFooter(doc);

    // Download do arquivo com método mais seguro
    const fileName = `${reportData.title
      .toLowerCase()
      .replace(/\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.pdf`;

    try {
      // Método mais compatível com navegadores
      const pdfBlob = doc.output("blob");
      const url = URL.createObjectURL(pdfBlob);

      // Criar link temporário para download
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.style.display = "none";

      // Adicionar ao DOM, clicar e remover
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Limpar URL temporária
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error("Erro ao fazer download:", error);
      // Fallback para o método original
      doc.save(fileName);
    }
  }

  /**
   * Abre o PDF em uma nova aba (alternativa ao download)
   */
  static openReportInNewTab(reportData: ReportData): void {
    const doc = new jsPDF();
    configurePDFFont(doc);

    // Cabeçalho do documento
    this.addHeader(doc, reportData.title, reportData.subtitle);

    // Informações de data
    if (reportData.dateRange) {
      this.addDateRange(doc, reportData.dateRange);
    }

    // Tabela principal
    this.addTable(doc, reportData.data, reportData.columns);

    // Resumo/Totais
    if (reportData.summary) {
      this.addSummary(doc, reportData.summary);
    }

    // Rodapé
    this.addFooter(doc);

    // Abrir em nova aba
    const pdfDataUri = doc.output("datauristring");
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>${reportData.title}</title>
            <style>
              body { margin: 0; padding: 0; }
              iframe { width: 100%; height: 100vh; border: none; }
            </style>
          </head>
          <body>
            <iframe src="${pdfDataUri}"></iframe>
          </body>
        </html>
      `);
    }
  }

  /**
   * Gera relatório de hóspedes
   */
  static generateGuestsReport(guests: any[]): void {
    const reportData: ReportData = {
      title: "Relatório de Hóspedes",
      subtitle: "Lista completa de hóspedes cadastrados",
      data: guests.map((guest) => ({
        nome: guest.name,
        email: guest.email,
        telefone: guest.phone || "N/A",
        cpf: guest.cpf || "N/A",
        status: guest.status,
        nascimento: guest.birth_date
          ? format(new Date(guest.birth_date), "dd/MM/yyyy")
          : "N/A",
      })),
      columns: [
        { header: "Nome", dataKey: "nome", width: 40 },
        { header: "Email", dataKey: "email", width: 50 },
        { header: "Telefone", dataKey: "telefone", width: 30 },
        { header: "CPF", dataKey: "cpf", width: 30 },
        { header: "Status", dataKey: "status", width: 25 },
        { header: "Nascimento", dataKey: "nascimento", width: 25 },
      ],
      summary: [
        { label: "Total de Hóspedes", value: guests.length },
        {
          label: "Hospedados",
          value: guests.filter((g) => g.status === "Hospedado").length,
        },
        {
          label: "Reservados",
          value: guests.filter((g) => g.status === "Reservado").length,
        },
        {
          label: "Sem Estadia",
          value: guests.filter((g) => g.status === "Sem estadia").length,
        },
      ],
    };

    this.generateReport(reportData);
  }

  /**
   * Abre relatório de hóspedes em nova aba
   */
  static openGuestsReportInNewTab(guests: any[]): void {
    const reportData: ReportData = {
      title: "Relatório de Hóspedes",
      subtitle: "Lista completa de hóspedes cadastrados",
      data: guests.map((guest) => ({
        nome: guest.name,
        email: guest.email,
        telefone: guest.phone || "N/A",
        cpf: guest.cpf || "N/A",
        status: guest.status,
        nascimento: guest.birth_date
          ? format(new Date(guest.birth_date), "dd/MM/yyyy")
          : "N/A",
      })),
      columns: [
        { header: "Nome", dataKey: "nome", width: 40 },
        { header: "Email", dataKey: "email", width: 50 },
        { header: "Telefone", dataKey: "telefone", width: 30 },
        { header: "CPF", dataKey: "cpf", width: 30 },
        { header: "Status", dataKey: "status", width: 25 },
        { header: "Nascimento", dataKey: "nascimento", width: 25 },
      ],
      summary: [
        { label: "Total de Hóspedes", value: guests.length },
        {
          label: "Hospedados",
          value: guests.filter((g) => g.status === "Hospedado").length,
        },
        {
          label: "Reservados",
          value: guests.filter((g) => g.status === "Reservado").length,
        },
        {
          label: "Sem Estadia",
          value: guests.filter((g) => g.status === "Sem estadia").length,
        },
      ],
    };

    this.openReportInNewTab(reportData);
  }

  /**
   * Gera relatório de quartos
   */
  static generateRoomsReport(rooms: any[]): void {
    const reportData: ReportData = {
      title: "Relatório de Quartos",
      subtitle: "Status e informações dos quartos",
      data: rooms.map((room) => ({
        numero: room.number,
        tipo: room.type,
        status: room.status,
        diaria: `R$ ${room.rate.toFixed(2)}`,
        descricao: room.description || "N/A",
      })),
      columns: [
        { header: "Número", dataKey: "numero", width: 20 },
        { header: "Tipo", dataKey: "tipo", width: 30 },
        { header: "Status", dataKey: "status", width: 30 },
        { header: "Diária", dataKey: "diaria", width: 25 },
        { header: "Descrição", dataKey: "descricao", width: 95 },
      ],
      summary: [
        { label: "Total de Quartos", value: rooms.length },
        {
          label: "Disponíveis",
          value: rooms.filter((r) => r.status === "Disponível").length,
        },
        {
          label: "Ocupados",
          value: rooms.filter((r) => r.status === "Ocupado").length,
        },
        {
          label: "Em Limpeza",
          value: rooms.filter((r) => r.status === "Limpeza").length,
        },
      ],
    };

    this.generateReport(reportData);
  }

  /**
   * Gera relatório de reservas
   */
  static generateBookingsReport(bookings: any[]): void {
    const reportData: ReportData = {
      title: "Relatório de Reservas",
      subtitle: "Histórico de reservas do hotel",
      data: bookings.map((booking) => ({
        hospede: booking.guests?.name || "N/A",
        quarto: `Quarto ${booking.rooms?.number || "N/A"}`,
        checkin: booking.check_in
          ? format(new Date(booking.check_in), "dd/MM/yyyy")
          : "N/A",
        checkout: booking.check_out
          ? format(new Date(booking.check_out), "dd/MM/yyyy")
          : "N/A",
        status: booking.status,
        pagamento: booking.payment_status || "N/A",
      })),
      columns: [
        { header: "Hóspede", dataKey: "hospede", width: 40 },
        { header: "Quarto", dataKey: "quarto", width: 25 },
        { header: "Check-in", dataKey: "checkin", width: 25 },
        { header: "Check-out", dataKey: "checkout", width: 25 },
        { header: "Status", dataKey: "status", width: 30 },
        { header: "Pagamento", dataKey: "pagamento", width: 25 },
      ],
      summary: [
        { label: "Total de Reservas", value: bookings.length },
        {
          label: "Reservadas",
          value: bookings.filter((b) => b.status === "Reservado").length,
        },
        {
          label: "Check-in Feito",
          value: bookings.filter((b) => b.status === "Check-in Feito").length,
        },
        {
          label: "Check-out Feito",
          value: bookings.filter((b) => b.status === "Check-out Feito").length,
        },
        {
          label: "Canceladas",
          value: bookings.filter((b) => b.status === "Cancelada").length,
        },
      ],
    };

    this.generateReport(reportData);
  }

  /**
   * Gera relatório financeiro
   */
  static generateFinancialReport(payments: any[]): void {
    const totalRevenue = payments
      .filter((p) => p.status === "Aprovado")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const pendingAmount = payments
      .filter((p) => ["Pendente", "Processando"].includes(p.status))
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const reportData: ReportData = {
      title: "Relatório Financeiro",
      subtitle: "Resumo de pagamentos e receitas",
      data: payments.map((payment) => ({
        id: payment.id.toString().slice(0, 8),
        hospede: payment.bookings?.guests?.name || "N/A",
        valor: `R$ ${(payment.amount || 0).toFixed(2)}`,
        metodo: payment.method || "N/A",
        status: payment.status,
        data: payment.payment_date
          ? format(new Date(payment.payment_date), "dd/MM/yyyy")
          : "N/A",
      })),
      columns: [
        { header: "ID", dataKey: "id", width: 20 },
        { header: "Hóspede", dataKey: "hospede", width: 40 },
        { header: "Valor", dataKey: "valor", width: 25 },
        { header: "Método", dataKey: "metodo", width: 30 },
        { header: "Status", dataKey: "status", width: 25 },
        { header: "Data", dataKey: "data", width: 25 },
      ],
      summary: [
        { label: "Total de Transações", value: payments.length },
        { label: "Receita Total", value: `R$ ${totalRevenue.toFixed(2)}` },
        {
          label: "Pagamentos Pendentes",
          value: `R$ ${pendingAmount.toFixed(2)}`,
        },
        {
          label: "Aprovados",
          value: payments.filter((p) => p.status === "Aprovado").length,
        },
        {
          label: "Pendentes",
          value: payments.filter((p) =>
            ["Pendente", "Processando"].includes(p.status)
          ).length,
        },
      ],
    };

    this.generateReport(reportData);
  }

  /**
   * Gera relatório de ocupação
   */
  static generateOccupancyReport(rooms: any[], bookings: any[]): void {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Calcular ocupação do mês atual
    const monthlyBookings = bookings.filter((booking) => {
      const checkIn = new Date(booking.check_in);
      return (
        checkIn.getMonth() === currentMonth &&
        checkIn.getFullYear() === currentYear
      );
    });

    const occupancyRate =
      rooms.length > 0 ? (monthlyBookings.length / rooms.length) * 100 : 0;

    const reportData: ReportData = {
      title: "Relatório de Ocupação",
      subtitle: `Análise de ocupação - ${format(today, "MMMM yyyy", {
        locale: ptBR,
      })}`,
      data: rooms.map((room) => {
        const roomBookings = bookings.filter((b) => b.room_id === room.id);
        const currentBooking = roomBookings.find(
          (b) => new Date(b.check_in) <= today && new Date(b.check_out) >= today
        );

        return {
          numero: room.number,
          tipo: room.type,
          status: room.status,
          hospede_atual: currentBooking?.guests?.name || "Vago",
          reservas_mes: roomBookings.filter((b) => {
            const checkIn = new Date(b.check_in);
            return (
              checkIn.getMonth() === currentMonth &&
              checkIn.getFullYear() === currentYear
            );
          }).length,
        };
      }),
      columns: [
        { header: "Quarto", dataKey: "numero", width: 20 },
        { header: "Tipo", dataKey: "tipo", width: 25 },
        { header: "Status", dataKey: "status", width: 25 },
        { header: "Hóspede Atual", dataKey: "hospede_atual", width: 40 },
        { header: "Reservas/Mês", dataKey: "reservas_mes", width: 30 },
      ],
      summary: [
        { label: "Taxa de Ocupação", value: `${occupancyRate.toFixed(1)}%` },
        {
          label: "Quartos Ocupados",
          value: rooms.filter((r) => r.status === "Ocupado").length,
        },
        {
          label: "Quartos Disponíveis",
          value: rooms.filter((r) => r.status === "Disponível").length,
        },
        { label: "Reservas no Mês", value: monthlyBookings.length },
      ],
    };

    this.generateReport(reportData);
  }

  /**
   * Adiciona cabeçalho ao documento
   */
  private static addHeader(doc: jsPDF, title: string, subtitle?: string): void {
    // Logo/Nome do hotel
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Hotel Management System", 20, 20);

    // Título do relatório
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(title, 20, 35);

    // Subtítulo
    if (subtitle) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(subtitle, 20, 45);
    }

    // Data de geração
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`,
      20,
      subtitle ? 55 : 45
    );

    // Linha separadora
    doc.setLineWidth(0.5);
    doc.line(20, subtitle ? 65 : 55, 190, subtitle ? 65 : 55);
  }

  /**
   * Adiciona range de datas
   */
  private static addDateRange(
    doc: jsPDF,
    dateRange: { start: Date; end: Date }
  ): void {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const dateText = `Período: ${format(
      dateRange.start,
      "dd/MM/yyyy"
    )} - ${format(dateRange.end, "dd/MM/yyyy")}`;
    doc.text(dateText, 20, 75);
  }

  /**
   * Adiciona tabela ao documento
   */
  private static addTable(
    doc: jsPDF,
    data: any[],
    columns: { header: string; dataKey: string; width?: number }[]
  ): void {
    const startY = 85;

    autoTable(doc, {
      startY: startY,
      head: [columns.map((col) => col.header)],
      body: data.map((row) => columns.map((col) => row[col.dataKey] || "")),
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: columns.reduce((acc, col, index) => {
        if (col.width) {
          acc[index] = { cellWidth: col.width };
        }
        return acc;
      }, {} as any),
      margin: { left: 20, right: 20 },
    });
  }

  /**
   * Adiciona resumo/totais
   */
  private static addSummary(
    doc: jsPDF,
    summary: { label: string; value: string | number }[]
  ): void {
    const finalY = (doc as any).lastAutoTable.finalY + 20;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Resumo:", 20, finalY);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    summary.forEach((item, index) => {
      const yPos = finalY + 15 + index * 8;
      doc.text(`${item.label}:`, 20, yPos);
      doc.text(item.value.toString(), 100, yPos);
    });
  }

  /**
   * Adiciona rodapé
   */
  private static addFooter(doc: jsPDF): void {
    const pageHeight = doc.internal.pageSize.height;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Hotel Management System - Relatório Gerado Automaticamente",
      20,
      pageHeight - 20
    );
    doc.text(`Página 1`, 170, pageHeight - 20);
  }
}
