import { prisma } from "@/lib/prisma";
import { AclSimulatorView } from "@/components/acl/acl-simulator-view";
import { Scale, Zap, Info, Building2 } from "lucide-react";

export default async function AclPage({ searchParams }: { searchParams: Promise<{ unitId?: string }> }) {
  const resolvedSearchParams = await searchParams;
  
  // 1. Fetch available units for selection
  const units = await prisma.consumerUnit.findMany({
    where: { supplyGroup: 'GROUP_A' }, // ACL is mainly for Group A
    include: { client: true }
  });

  const selectedUnitId = resolvedSearchParams.unitId || (units.length > 0 ? units[0].id : null);

  if (!selectedUnitId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-surface-elevated border border-border flex items-center justify-center">
          <Zap className="w-10 h-10 text-primary opacity-20" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black">Nenhuma Unidade do Grupo A encontrada</h2>
          <p className="text-muted-foreground max-w-md">
            O Simulador de Migração ACL requer faturas de Unidades Consumidoras atendidas em Alta Tensão (Grupo A).
          </p>
        </div>
      </div>
    );
  }

  // 2. Fetch the selected unit and its last 12 months of invoices
  const unit = await prisma.consumerUnit.findUnique({
    where: { id: selectedUnitId },
    include: { client: true }
  });

  const invoices = await prisma.invoice.findMany({
    where: { consumerUnitId: selectedUnitId },
    orderBy: { referenceMonth: 'desc' },
    take: 12
  });

  if (invoices.length < 1) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-surface-elevated border border-border flex items-center justify-center">
          <Building2 className="w-10 h-10 text-accent opacity-20" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black">Dados Insuficientes</h2>
          <p className="text-muted-foreground max-w-md">
            Você precisa importar pelo menos uma fatura para a unidade <strong>{unit?.installationNumber}</strong> para iniciar a simulação.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-tighter border border-primary/20">
              Módulo de Inteligência
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            Simulador Mercado Livre <Scale className="w-8 h-8 text-primary" />
          </h1>
          <p className="text-muted-foreground text-lg">
            Projeção de viabilidade técnica e financeira para migração ACL.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="glass-card px-4 py-2 rounded-2xl flex items-center gap-4 border-border/40">
            <div className="w-10 h-10 rounded-xl bg-surface-elevated flex items-center justify-center">
              <Building2 className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Unidade em Análise</p>
              <p className="font-bold text-sm tracking-tight">{unit?.client?.name} - {unit?.installationNumber}</p>
            </div>
          </div>

          <a
            href={`/api/reports/${unit?.id}`}
            target="_blank"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-5 py-3 rounded-2xl font-bold transition-all hover:scale-[1.02] text-sm"
          >
            Exportar Estudo
          </a>
        </div>
      </div>

      <div className="p-4 bg-accent/5 border border-accent/20 rounded-2xl flex items-start gap-4">
        <div className="p-2 bg-accent/10 rounded-lg">
          <Info className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h4 className="font-bold text-sm text-accent">Análise Baseada em Histórico Real</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Esta simulação utiliza os últimos {invoices.length} meses de faturas reais da distribuidora <strong>{unit?.distributorName}</strong> para garantir precisão no cálculo de TUSD e encargos.
          </p>
        </div>
      </div>

      {/* Simulator Interface */}
      <AclSimulatorView initialInvoices={invoices} unit={unit} />

    </div>
  );
}
