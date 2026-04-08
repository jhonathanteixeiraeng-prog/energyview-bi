import { Activity, ArrowUpRight, CheckCircle2, TrendingDown, Users, FileText, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ConsumptionChart } from "@/components/dashboard/consumption-chart";
import { DemandChart } from "@/components/dashboard/demand-chart";
import { CostDistributionChart } from "@/components/dashboard/cost-distribution-chart";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default async function DashboardPage() {
  // 1. Fetch Summary Statistics
  const totalPotentialSavings = await prisma.auditItem.aggregate({
    _sum: { potentialSavings: true }
  });

  const totalInvoices = await prisma.invoice.count();
  
  const criticalAlertsCount = await prisma.auditItem.count({
    where: { severity: { in: ['HIGH', 'CRITICAL'] } }
  });

  const activeClientsCount = await prisma.client.count();

  // 2. Fetch Chart Data (Last 12 months)
  const invoices = await prisma.invoice.findMany({
    orderBy: { referenceMonth: 'asc' },
    include: { consumerUnit: true }
  });

  const consumptionData = invoices.map(inv => ({
    month: format(inv.referenceMonth, "MMM", { locale: ptBR }),
    ponta: inv.consumptionPeakKwh || 0,
    foraPonta: inv.consumptionOffPeakKwh || 0,
  }));

  const demandData = invoices.map(inv => ({
    month: format(inv.referenceMonth, "MMM", { locale: ptBR }),
    medida: inv.measuredDemandPeakKw || 0,
    contratada: inv.consumerUnit?.contractedDemandPeak || 0,
  }));

  // 3. Cost Distribution (Average of all invoices for demo)
  const costBreakdown = [
    { name: "TUSD", value: 45, color: "#0ea5e9" },
    { name: "TE", value: 35, color: "#10b981" },
    { name: "Tributos", value: 20, color: "#f59e0b" },
  ];

  // 4. Recent Audits
  const recentAudits = await prisma.auditItem.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { 
      invoice: {
        include: { consumerUnit: { include: { client: true } } }
      }
    }
  });

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground text-lg">
          Inteligência de faturamento e análise de performance energética.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="glass-card p-6 rounded-2xl flex flex-col gap-4 border-success/20 hover:border-success/40 transition-all group">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wider">Economia Potencial</h3>
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingDown className="w-5 h-5 text-success" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black stat-value text-success tracking-tight">
              {formatCurrency(totalPotentialSavings._sum.potentialSavings || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1 bg-success/5 w-fit px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3 text-success" />
              <span className="text-success font-bold">+12%</span> <span className="opacity-70">vs meta anual</span>
            </p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex flex-col gap-4 border-primary/20 hover:border-primary/40 transition-all group">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wider">Faturas Analisadas</h3>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black stat-value tracking-tight">{totalInvoices}</div>
            <p className="text-xs text-muted-foreground mt-2 px-2 py-1 bg-surface-elevated rounded-full w-fit">
              Base de dados consolidada
            </p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex flex-col gap-4 border-destructive/20 hover:border-destructive/40 transition-all group">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wider">Alertas Críticos</h3>
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5 text-destructive" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black stat-value text-destructive tracking-tight">{criticalAlertsCount}</div>
            <p className="text-xs text-muted-foreground mt-2 px-2 py-1 bg-destructive/5 rounded-full w-fit">
              Requerem atenção imediata
            </p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex flex-col gap-4 border-accent/20 hover:border-accent/40 transition-all group">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wider">Clientes Ativos</h3>
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5 text-accent" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black stat-value tracking-tight">{activeClientsCount}</div>
            <p className="text-xs text-muted-foreground mt-2 px-2 py-1 bg-accent/5 rounded-full w-fit">
              Gestão ativa de portfólio
            </p>
          </div>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Gráfico de Consumo */}
        <div className="lg:col-span-3 glass-card p-8 rounded-3xl flex flex-col border-border/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap className="w-24 h-24 text-primary" />
          </div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold tracking-tight">Histórico de Consumo</h3>
              <p className="text-sm text-muted-foreground">Comparativo de consumo em kWh (Ponta vs Fora Ponta)</p>
            </div>
          </div>
          <ConsumptionChart data={consumptionData} />
        </div>

        {/* Distribuição de Custos */}
        <div className="glass-card p-8 rounded-3xl flex flex-col items-center justify-center border-border/40 text-center">
          <div className="w-full mb-6 text-left">
            <h3 className="text-lg font-bold tracking-tight">Composição de Custos</h3>
            <p className="text-xs text-muted-foreground">Distribuição média da fatura</p>
          </div>
          <CostDistributionChart data={costBreakdown} />
          <div className="mt-4 grid grid-cols-2 gap-4 w-full">
            <div className="p-3 rounded-xl bg-surface-elevated border border-border/50">
              <span className="block text-[10px] text-muted-foreground uppercase font-bold">Custo Médio</span>
              <span className="text-sm font-bold">R$ 0,82/kWh</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-elevated border border-border/50">
              <span className="block text-[10px] text-muted-foreground uppercase font-bold">Encargos</span>
              <span className="text-sm font-bold">18.4%</span>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Gráfico de Demanda */}
        <div className="lg:col-span-2 glass-card p-8 rounded-3xl border-border/40">
           <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold tracking-tight">Eficiência de Demanda</h3>
              <p className="text-sm text-muted-foreground">Acompanhamento de demanda medida vs contratada (kW)</p>
            </div>
            <div className="px-3 py-1 bg-success/10 text-success text-xs font-bold rounded-full border border-success/20">
              OTIMIZADO
            </div>
          </div>
          <DemandChart data={demandData} />
        </div>

        {/* Atividades Recentes de Auditoria */}
        <div className="glass-card p-8 rounded-3xl flex flex-col border-border/40 relative overflow-hidden">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            Auditorias Recentes
            <span className="ml-auto w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center font-bold">
              {recentAudits.length}
            </span>
          </h3>
          <div className="space-y-6">
            {recentAudits.map((audit) => (
              <div key={audit.id} className="flex items-start gap-4 group cursor-pointer hover:bg-surface-elevated/50 p-2 rounded-xl transition-all -m-2">
                <div className={`mt-1 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 
                  ${audit.severity === 'HIGH' || audit.severity === 'CRITICAL' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                  {audit.severity === 'HIGH' || audit.severity === 'CRITICAL' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold truncate">
                    {audit.invoice.consumerUnit.client.name}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium mb-1">{audit.title}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-success bg-success/10 px-1.5 py-0.5 rounded tracking-tighter">
                      -{formatCurrency(audit.potentialSavings || 0)}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60">{format(audit.createdAt, "dd/MM/yy")}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-8 w-full py-3 rounded-xl border border-border/60 text-sm font-bold text-muted-foreground hover:bg-surface-elevated hover:text-foreground transition-all">
            Ver Relatório Completo
          </button>
        </div>

      </div>
    </div>
  );
}

// Helper icon
function Zap(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 14.71 13 3l-1.3 8.3H20l-9 11.71L12.3 13H4Z" />
    </svg>
  );
}
