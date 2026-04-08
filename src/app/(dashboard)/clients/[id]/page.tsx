import { Building2, Plus, Zap, ArrowLeft, MoreHorizontal, FileText } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      units: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!client) {
    notFound();
  }

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/clients"
            className="w-10 h-10 rounded-full bg-surface hover:bg-surface-elevated border border-border flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              {client.cnpj || client.cpf || "CNPJ não informado"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            disabled
            className="hidden sm:flex items-center gap-2 bg-surface hover:bg-surface-elevated border border-border text-muted-foreground px-4 py-2 rounded-xl font-medium transition-all text-sm opacity-50 cursor-not-allowed"
          >
            <MoreHorizontal className="w-4 h-4" />
            Opções
          </button>

          {/* We'll link to the first unit's report for simplicity in the main header, 
              but specific report buttons are added to each unit in the table below */}
          {client.units.length > 0 && (
            <a
              href={`/api/reports/${client.units[0].id}`}
              target="_blank"
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] text-sm"
            >
              <FileText className="w-4 h-4" />
              Gerar Diagnóstico PDF
            </a>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-xl flex flex-col gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">Contato</h3>
          <p className="text-lg font-semibold">{client.contactName || "—"}</p>
          <p className="text-sm text-muted-foreground">{client.contactEmail || "Sem email cadastrado"}</p>
        </div>

        <div className="glass-card p-6 rounded-xl flex flex-col gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">Unidades Consumidoras</h3>
          <p className="text-lg font-semibold">{client.units.length} cadastradas</p>
          <p className="text-sm text-primary flex items-center gap-1">
            <Zap className="w-3 h-3" /> Grupo A: {client.units.filter((u: any) => u.supplyGroup === 'GROUP_A').length}
          </p>
        </div>

        <div className="glass-card p-6 rounded-xl flex flex-col gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">Total Economizado</h3>
          <p className="text-lg font-semibold text-success">R$ 0,00</p>
          <p className="text-sm text-muted-foreground">Nenhuma análise concluída</p>
        </div>
      </div>

      {/* Unidades Consumidoras (UCs) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" />
            Unidades Consumidoras
          </h2>
          <Link
            href={`/clients/${client.id}/units/new`}
            className="flex items-center gap-2 bg-surface hover:bg-surface-elevated border border-border text-foreground px-4 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Nova UC
          </Link>
        </div>

        <div className="glass-card rounded-xl overflow-hidden border border-border/50 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface/50 border-b border-border/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Instalação / Medidor</th>
                  <th className="px-6 py-4 font-medium">Localização</th>
                  <th className="px-6 py-4 font-medium">Distribuidora</th>
                  <th className="px-6 py-4 font-medium">Enquadramento</th>
                  <th className="px-6 py-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {client.units.length === 0 ? (
                  <tr className="data-table-row">
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      Nenhuma unidade consumidora cadastrada para este cliente.
                    </td>
                  </tr>
                ) : (
                  client.units.map((unit: any) => (
                    <tr key={unit.id} className="data-table-row group">
                      <td className="px-6 py-4">
                        <Link href={`/clients/${client.id}/units/${unit.id}`} className="block w-full h-full">
                          <p className="font-medium text-foreground group-hover:text-primary transition-colors">{unit.installationNumber}</p>
                          {unit.meterNumber && <p className="text-xs text-muted-foreground">Medidor: {unit.meterNumber}</p>}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {unit.city && unit.state ? `${unit.city} - ${unit.state}` : unit.address}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {unit.distributorName}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${unit.supplyGroup === 'GROUP_A' ? 'bg-primary/20 text-primary-light' : 'bg-accent/20 text-accent-light'}`}>
                            {unit.supplyGroup === 'GROUP_A' ? 'Grupo A' : 'Grupo B'}
                          </span>
                          <span className="text-xs text-muted-foreground">{unit.tariffModality}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-surface-elevated transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
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
