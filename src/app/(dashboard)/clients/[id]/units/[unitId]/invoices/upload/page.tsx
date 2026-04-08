"use client";

import { useState } from "react";
import { UploadCloud, CheckCircle, FileText, ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { createInvoiceAction } from "../actions";
import { use } from "react";

export default function InvoiceUploadPage({ params }: { params: Promise<{ id: string, unitId: string }> }) {
  const resolvedParams = use(params);
  const { id: clientId, unitId } = resolvedParams;
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseComplete, setParseComplete] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const selected = acceptedFiles[0];
      if (selected) {
        await handleInvoiceUpload(selected);
      }
    }
  });

  const handleInvoiceUpload = async (file: File) => {
    setFile(file);
    setIsParsing(true);
    setParseComplete(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/parse-invoice-details", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (res.ok && json.data) {
        setExtractedData({ ...json.data, fileName: file.name });
        setParseComplete(true);
      } else {
        alert("Erro na leitura da fatura: " + (json.error || "Tente novamente"));
        setFile(null);
      }
    } catch (e) {
      alert("Falha fatal na comunicação com servidor.");
      console.error(e);
      setFile(null);
    } finally {
      setIsParsing(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extractedData) return;
    
    setIsSaving(true);
    const result = await createInvoiceAction(clientId, unitId, extractedData);
    setIsSaving(false);

    if (result.success) {
      router.push(`/clients/${clientId}/units/${unitId}`);
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center gap-4 border-b border-border/50 pb-6">
        <Link 
          href={`/clients/${clientId}/units/${unitId}`}
          className="w-10 h-10 rounded-full bg-surface hover:bg-surface-elevated border border-border flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Importador Inteligente de Faturas
          </h1>
          <p className="text-muted-foreground mt-1">
            Reconhecimento ótico e semântico (IA) para alimentar o histórico de Consumo e Tarifas.
          </p>
        </div>
      </div>

      {!parseComplete && (
        <div 
          {...getRootProps()} 
          className={`
            border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-surface'}
            ${isParsing ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            {isParsing ? <Loader2 className="w-8 h-8 animate-spin" /> : <UploadCloud className="w-8 h-8" />}
          </div>
          <h3 className="text-xl font-medium mb-2">
            {isParsing ? 'A IA está lendo consumo e tarifas da fatura...' : 'Arraste o PDF da Fatura aqui'}
          </h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Suporta qualquer distribuidora brasileira. Nossa IA mapeia PIS, COFINS, TE, TUSD e Fator de Potência.
          </p>
        </div>
      )}

      {parseComplete && extractedData && (
        <form onSubmit={handleSave} className="space-y-8 animate-slide-up">
          <div className="glass-card rounded-xl p-6 border border-primary/20 bg-primary/5">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="w-6 h-6 text-success" />
              <h3 className="text-lg font-semibold text-success">Leitura Concluída com Sucesso</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Mês / Vencimento</label>
                <div className="text-lg font-medium">{extractedData.referenceMonth} • {extractedData.dueDate}</div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Valor da Fatura</label>
                <div className="text-lg font-medium text-destructive">R$ {extractedData.totalAmount?.toLocaleString('pt-BR')}</div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Fator de Potência</label>
                <div className="text-lg font-medium text-warning">{extractedData.powerFactor || '1.00'}</div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Consumo Ponta</label>
                <div className="text-lg font-medium">{extractedData.consumptionPeakKwh || 0} kWh</div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Consumo Fora Ponta</label>
                <div className="text-lg font-medium">{extractedData.consumptionOffPeakKwh || 0} kWh</div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Tarifas ANEEL (TUSD/TE)</label>
                <div className="text-sm font-medium text-foreground">Extrato processado com sucesso</div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Demanda e Impostos</label>
                <div className="text-sm font-medium text-success">ICMS, PIS/COFINS extraídos</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
             <button
              type="button"
              onClick={() => { setFile(null); setParseComplete(false); setExtractedData(null); }}
              className="px-5 py-2.5 rounded-lg font-medium text-muted-foreground hover:bg-surface border border-border transition-colors"
            >
              Cancelar e Ler Outra
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 bg-primary hover:bg-primary-light text-primary-foreground px-6 py-2.5 rounded-lg font-medium transition-all shadow-[0_0_20px_rgba(15,118,110,0.2)]"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isSaving ? 'Salvando no Histórico...' : 'Confirmar Lançamento'}
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
