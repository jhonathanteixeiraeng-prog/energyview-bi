import Link from "next/link";
import { FileText, Building2, Calendar, AlertTriangle, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { referenceMonth: "desc" },
    include: {
      consumerUnit: {
        include: {
          client: true,
        },
      },
      _count: {
        select: {
          auditItems: true,
        },
      },
    },
    take: 50,
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Faturas</h1>
        <p className="text-muted-foreground">
          Histórico recente das faturas processadas, com acesso rápido ao diagnóstico técnico.
        </p>
      </div>

      <div className="glass-card rounded-xl overflow-hidden border border-border/50 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface/50 border-b border-border/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Referência</th>
                <th className="px-6 py-4 font-medium">Cliente / UC</th>
                <th className="px-6 py-4 font-medium">Distribuidora</th>
                <th className="px-6 py-4 font-medium">Valor</th>
                <th className="px-6 py-4 font-medium">Alertas</th>
                <th className="px-6 py-4 font-medium text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                      <FileText className="w-8 h-8 opacity-50" />
                      <p>Nenhuma fatura foi importada ainda.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="data-table-row">
                    <td className="px-6 py-4 font-medium uppercase">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center border border-border">
                          <Calendar className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p>
                            {new Date(invoice.referenceMonth).toLocaleDateString("pt-BR", {
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground normal-case">
                            {invoice.originalFileName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <Building2 className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">{invoice.consumerUnit.client.name}</p>
                          <p className="text-xs text-muted-foreground">
                            UC {invoice.consumerUnit.installationNumber}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {invoice.consumerUnit.distributorName}
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(invoice.totalAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {invoice._count.auditItems} apontamentos
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 font-medium text-primary hover:bg-primary/5"
                      >
                        Abrir
                        <ArrowRight className="w-4 h-4" />
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
  );
}
