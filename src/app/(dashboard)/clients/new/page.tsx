import { Building2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default function NewClientPage() {
  
  async function createClient(formData: FormData) {
    "use server";
    
    const name = formData.get("name") as string;
    const cnpj = formData.get("cnpj") as string;
    const email = formData.get("email") as string;
    const contact = formData.get("contact") as string;

    // Criar organização fake caso não haja auth ainda (mock para funcionar o DB relation)
    // O ideal seria pegar a organização do usuário logado na session (NextAuth).
    let tempOrg = await prisma.organization.findFirst();
    if (!tempOrg) {
      tempOrg = await prisma.organization.create({
        data: { name: "Organização Principal" }
      });
    }

    await prisma.client.create({
      data: {
        name,
        cnpj: cnpj || null,
        contactEmail: email || null,
        contactName: contact || null,
        organizationId: tempOrg.id
      }
    });

    redirect("/clients");
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/clients" 
          className="w-10 h-10 rounded-full bg-surface hover:bg-surface-elevated border border-border flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Novo Cliente</h1>
          <p className="text-muted-foreground mt-1">Cadastre as informações da empresa contratante.</p>
        </div>
      </div>

      {/* Form */}
      <div className="glass-card rounded-xl border border-border/50 shadow-sm p-8">
        <form action={createClient} className="space-y-6">
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2 border-b border-border/50 pb-2">
              <Building2 className="w-5 h-5 text-primary" />
              Dados da Empresa
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Razão Social / Nome Fantasia *</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  required
                  className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  placeholder="Ex: Indústrias Wayne Ltda"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="cnpj" className="text-sm font-medium">CNPJ</label>
                <input 
                  type="text" 
                  id="cnpj" 
                  name="cnpj" 
                  className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  placeholder="00.000.000/0000-00"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-medium flex items-center gap-2 border-b border-border/50 pb-2">
              Contato Principal
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <label htmlFor="contact" className="text-sm font-medium">Nome do Responsável</label>
                <input 
                  type="text" 
                  id="contact" 
                  name="contact" 
                  className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  placeholder="Ex: Bruce Wayne"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">E-mail Profissional</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  placeholder="bruce@wayne.com"
                />
              </div>
            </div>
          </div>

          <div className="pt-8 flex justify-end gap-4 border-t border-border/50">
            <Link 
              href="/clients"
              className="px-6 py-2 rounded-lg font-medium text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
            >
              Cancelar
            </Link>
            <button 
              type="submit"
              className="flex items-center gap-2 bg-primary hover:bg-primary-light text-primary-foreground px-8 py-2 rounded-lg font-medium transition-all shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Cliente</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
