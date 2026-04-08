import { Plus, Search, Building2, MapPin, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

// Renderização estática dinâmica (Server Component)
export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  // Buscar no banco (no futuro: com paginação e filtro real)
  const clients = await prisma.client.findMany({
    include: {
      _count: {
        select: { units: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground mt-1">Gerencie as empresas e suas unidades consumidoras.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64 group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar cliente ou CNPJ..." 
              className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
          </div>
          <Link 
            href="/clients/new"
            className="flex items-center gap-2 bg-primary hover:bg-primary-light text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Cliente</span>
          </Link>
        </div>
      </div>

      {/* Tabela de Clientes */}
      <div className="glass-card rounded-xl overflow-hidden border border-border/50 shadow-sm relative">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface/50 border-b border-border/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Razão Social</th>
                <th className="px-6 py-4 font-medium">CNPJ / CPF</th>
                <th className="px-6 py-4 font-medium">Contato</th>
                <th className="px-6 py-4 font-medium">Unidades (UCs)</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              
              {clients.length === 0 ? (
                 <tr className="data-table-row">
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Building2 className="w-8 h-8 text-muted-foreground/50" />
                      <p>Nenhum cliente cadastrado ainda.</p>
                      <Link 
                        href="/clients/new"
                        className="text-primary hover:underline hover:text-primary-light transition-colors mt-2"
                      >
                        Cadastre o seu primeiro cliente
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="data-table-row group">
                    <td className="px-6 py-4">
                      <Link href={`/clients/${client.id}`} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center border border-border group-hover:border-primary/30 transition-colors">
                          <Building2 className="w-5 h-5 text-primary/70" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground hover:text-primary transition-colors">{client.name}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-mono">
                      {client.cnpj || client.cpf || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <p className="text-foreground">{client.contactName || "—"}</p>
                      <p className="text-xs">{client.contactEmail}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full badge-info text-xs font-medium">
                        {client._count.units} UCs
                      </span>
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
  );
}
