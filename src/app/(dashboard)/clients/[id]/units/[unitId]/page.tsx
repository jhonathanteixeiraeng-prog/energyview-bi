import { Zap, Calendar, UploadCloud, ArrowLeft, MoreHorizontal, FileText, TrendingDown, DollarSign } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function ConsumerUnitPage({ params }: { params: { id: string, unitId: string } }) {
  const { id, unitId } = await params;
  
  const unit = await prisma.consumerUnit.findUnique({
    where: { id: unitId },
    include: {
      client: true,
      invoices: {
        orderBy: { dueDate: 'desc' }
      }
    }
  });

  if (!unit) notFound();

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-6">
        <div className="flex items-center gap-4">
          <Link 
            href={`/clients/${id}`} 
            className="w-10 h-10 rounded-full bg-surface hover:bg-surface-elevated border border-border flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">UC {unit.installationNumber}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${unit.supplyGroup === 'GROUP_A' ? 'bg-primary/20 text-primary-light' : 'bg-accent/20 text-accent-light'}`}>
                {unit.supplyGroup === 'GROUP_A' ? 'Grupo A' : 'Grupo B'}
              </span>
            </div>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              {unit.distributorName} • {unit.address} {unit.city ? `- ${unit.city}` : ''}
            </p>
          </div>
        </div>
        
        <Link 
          href={`/clients/${id}/units/${unitId}/invoices/upload`}
          className="flex items-center gap-2 bg-primary hover:bg-primary-light text-primary-foreground px-5 py-2.5 rounded-lg font-medium transition-all shadow-[0_0_20px_rgba(15,118,110,0.2)] hover:shadow-[0_0_30px_rgba(20,184,166,0.4)]"
        >
          <UploadCloud className="w-5 h-5" />
          Importar Faturas PDF
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-xl flex flex-col gap-1 border-l-4 border-l-primary/50">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Demanda (Ponta)</span>
          <span className="text-2xl font-mono">{unit.contractedDemandPeak || '—'} <span className="text-sm font-sans text-muted-foreground">kW</span></span>
        </div>
        <div className="glass-card p-5 rounded-xl flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Demanda (Fora Ponta)</span>
          <span className="text-2xl font-mono">{unit.contractedDemandOffPeak || '—'} <span className="text-sm font-sans text-muted-foreground">kW</span></span>
        </div>
        <div className="glass-card p-5 rounded-xl flex flex-col gap-1 border-l-4 border-l-accent/50">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Modalidade</span>
          <span className="text-2xl tracking-tight capitalize truncate">{unit.tariffModality.toLowerCase()}</span>
        </div>
        <div className="glass-card p-5 rounded-xl flex flex-col gap-1 border-l-4 border-l-success/50">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Histórico</span>
          <span className="text-2xl truncate">{unit.invoices.length} Faturas</span>
        </div>
      </div>

      {/* Histórico de Faturas Table */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          Histórico de Consumo
        </h2>

        <div className="glass-card rounded-xl overflow-hidden border border-border/50 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface/50 border-b border-border/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Mês Ref.</th>
                  <th className="px-6 py-4 font-medium">Vencimento</th>
                  <th className="px-6 py-4 font-medium">Consumo (kWh)</th>
                  <th className="px-6 py-4 font-medium">Fator Potência</th>
                  <th className="px-6 py-4 font-medium">Valor Total</th>
                  <th className="px-6 py-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {unit.invoices.length === 0 ? (
                  <tr className="data-table-row">
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                        <FileText className="w-8 h-8 opacity-50" />
                        <p>Nenhuma fatura analisada para esta Unidade ainda.</p>
                        <p className="text-xs">Faça o upload do PDF para processarmos TUSD, TE e Anomalias em segundos.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  unit.invoices.map((invoice: any) => (
                    <tr key={invoice.id} className="data-table-row">
                      <td className="px-6 py-4 font-medium uppercase tracking-wide">
                        {new Date(invoice.referenceMonth).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                         {new Date(invoice.dueDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 font-mono text-muted-foreground">
                        {invoice.consumptionPeakKwh || invoice.consumptionOffPeakKwh 
                          ? `${(invoice.consumptionPeakKwh || 0) + (invoice.consumptionOffPeakKwh || 0)}` 
                          : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold
                          ${invoice.powerFactor && invoice.powerFactor < 0.92 ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}
                        `}>
                          {invoice.powerFactor || '0.92'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-foreground">
                        R$ {invoice.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                           href={`/invoices/${invoice.id}`}
                           className="text-primary hover:text-primary-light px-3 py-1.5 rounded-md hover:bg-primary/10 transition-colors font-medium text-xs whitespace-nowrap"
                        >
                          Ver Diagnóstico
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
