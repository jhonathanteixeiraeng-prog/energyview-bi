import { Zap, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { InvoiceParserZone } from "@/components/invoices/invoice-parser-zone";

export default async function NewConsumerUnitPage({ params }: { params: { id: string } }) {
  const { id: clientId } = await params;

  // Nossa Server Action recebe o FormData submetido pelo componente Client do parser!
  async function saveAutoParsedUnit(formData: FormData) {
    "use server";
    
    // Captura os dados que o InvoiceParserZone gerou escondido no formulário
    const installationNumber = formData.get("installationNumber") as string;
    const meterNumber = formData.get("meterNumber") as string;
    const distributorName = formData.get("distributorName") as string;
    const address = formData.get("address") as string;
    const supplyGroup = formData.get("supplyGroup") as "GROUP_A" | "GROUP_B";
    const tariffModality = formData.get("tariffModality") as "BLUE" | "GREEN" | "CONVENTIONAL" | "WHITE";
    const connectionType = formData.get("connectionType") as "SINGLE_PHASE" | "TWO_PHASE" | "THREE_PHASE";
    
    const contractedDemandPeak = parseFloat(formData.get("contractedDemandPeak") as string) || null;
    const contractedDemandOffPeak = parseFloat(formData.get("contractedDemandOffPeak") as string) || null;
    const cid = formData.get("clientId") as string;

    // Criamos a Unidade Consumidora nova!
    await prisma.consumerUnit.create({
      data: {
        installationNumber,
        meterNumber,
        distributorName,
        address,
        supplyGroup,
        tariffModality,
        connectionType,
        contractedDemandPeak,
        contractedDemandOffPeak,
        clientId: cid
      }
    });

    redirect(`/clients/${cid}`);
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href={`/clients/${clientId}`} 
          className="w-10 h-10 rounded-full bg-surface hover:bg-surface-elevated border border-border flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            Inteligência Artificial de Faturas <SparklesIcon />
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">Faça o upload do PDF da conta. Nós criaremos o cadastro da Unidade Consumidora automaticamente.</p>
        </div>
      </div>

      {/* Super Componente Integrado */}
      <div className="pt-4">
         <InvoiceParserZone clientId={clientId} onSubmitTarget={saveAutoParsedUnit} />
      </div>

      {/* Rodapé Opcional */}
      <div className="text-center pt-8">
        <Link href={`/clients/${clientId}/units/manual`} className="text-muted-foreground text-sm hover:text-primary transition-colors underline underline-offset-4">
          O PDF falhou? Cadastre a unidade consumidora manualmente
        </Link>
      </div>

    </div>
  );
}

function SparklesIcon() {
  return (
    <div className="relative inline-flex items-center justify-center">
      <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
      <Zap className="w-6 h-6 text-primary relative z-10" />
    </div>
  )
}
