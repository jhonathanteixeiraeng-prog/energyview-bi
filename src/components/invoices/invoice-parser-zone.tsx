"use client";

import { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle2, Loader2, Sparkles, Zap, Building2, Terminal } from "lucide-react";
import { useFormStatus } from "react-dom";

type ParseStep = {
  id: number;
  label: string;
  status: 'pending' | 'loading' | 'success';
};

export function InvoiceParserZone({ clientId, onSubmitTarget }: { clientId: string, onSubmitTarget: (formData: FormData) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseComplete, setParseComplete] = useState(false);
  const [steps, setSteps] = useState<ParseStep[]>([
    { id: 1, label: "Lendo estrutura do PDF...", status: 'pending' },
    { id: 2, label: "Identificando dados da Unidade Consumidora...", status: 'pending' },
    { id: 3, label: "Calculando demanda e fator de potência...", status: 'pending' },
    { id: 4, label: "Extraindo tarifas TUSD/TE e tributos...", status: 'pending' }
  ]);
  
  // Dados Mock extraídos do PDF
  const [extractedData, setExtractedData] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      startSimulatedParsing(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      startSimulatedParsing(e.target.files[0]);
    }
  };

  const startSimulatedParsing = async (file: File) => {
    setFile(file);
    setIsParsing(true);
    setParseComplete(false);
    
    // Inicia animação visual da interface
    let currentVisualStep = 0;
    const visualInterval = setInterval(() => {
      setSteps(prev => prev.map((step, index) => {
        if (index < currentVisualStep) return { ...step, status: 'success' };
        if (index === currentVisualStep) return { ...step, status: 'loading' };
        return step;
      }));
      currentVisualStep++;
      if (currentVisualStep >= steps.length) clearInterval(visualInterval);
    }, 1000);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Chamada REAl para o backend (PDF-Parse + GPT-4o)
      const res = await fetch("/api/parse-invoice", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      
      clearInterval(visualInterval); // Para a animação caso o servidor responda muito rápido
      setSteps(prev => prev.map(step => ({ ...step, status: 'success' }))); // Conclui tudo visualmente

      if (res.ok && json.data) {
        setExtractedData({
          ...json.data,
          fileName: file.name
        });
      } else {
        alert("Erro na leitura: " + (json.error || "Tente novamente"));
      }

    } catch (e) {
      alert("Falha ao comunicar com o servidor de Inteligência Artificial.");
      console.error(e);
    } finally {
      setIsParsing(false);
      setParseComplete(true);
    }
  };

  // Status button handle
  const { pending } = useFormStatus();

  return (
    <div className="w-full">
      {!file && !isParsing && !parseComplete && (
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-primary/30 hover:border-primary/60 bg-surface/30 hover:bg-surface/50 rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:shadow-[0_0_30px_rgba(15,118,110,0.1)] group min-h-[300px]"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileInput} 
            className="hidden" 
            accept="application/pdf,image/jpeg,image/png" 
          />
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all">
            <UploadCloud className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-foreground">Arraste a fatura aqui</h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            Nós vamos extrair automaticamente a Unidade Consumidora, dados técnicos, leitura e tributos sem você precisar digitar uma linha.
          </p>
          <span className="px-4 py-2 bg-primary/10 text-primary font-medium rounded-full text-sm flex items-center gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
            <Sparkles className="w-4 h-4" /> Buscar arquivo no computador
          </span>
        </div>
      )}

      {(isParsing || parseComplete) && (
        <div className="glass-card p-8 rounded-2xl animate-fade-in border-primary/30 relative overflow-hidden">
          {/* Header do arquivo */}
          <div className="flex items-center gap-4 mb-8 border-b border-border/50 pb-6">
            <div className="w-12 h-12 rounded-lg bg-surface border border-border flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-lg">{file?.name}</p>
              <p className="text-sm text-muted-foreground">{(file?.size! / 1024 / 1024).toFixed(2)} MB • Processamento Inteligente em Execução</p>
            </div>
            {isParsing ? (
              <div className="ml-auto flex items-center gap-2 text-accent bg-accent/10 px-3 py-1 rounded-full text-sm font-medium">
                <Loader2 className="w-4 h-4 animate-spin" /> Mapeando dados
              </div>
            ) : (
              <div className="ml-auto flex items-center gap-2 text-success bg-success/10 px-3 py-1 rounded-full text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" /> Leitura concluída
              </div>
            )}
          </div>

          {/* Stepper de progresso */}
          {isParsing && (
            <div className="space-y-4 max-w-xl mx-auto py-4">
              {steps.map((step) => (
                <div key={step.id} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-500
                    ${step.status === 'pending' ? 'border-border/50 bg-transparent text-muted-foreground' : 
                      step.status === 'loading' ? 'border-accent bg-accent/10 text-accent' : 
                      'border-success bg-success/10 text-success'}`}
                  >
                    {step.status === 'success' ? <CheckCircle2 className="w-4 h-4" /> : 
                     step.status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                     <Terminal className="w-3 h-3" />}
                  </div>
                  <span className={`text-sm font-medium transition-colors ${step.status === 'success' ? 'text-foreground' : step.status === 'loading' ? 'text-accent' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Dados Extraídos */}
          {parseComplete && extractedData && (
            <form action={onSubmitTarget} className="space-y-8 animate-slide-up">
              
              <input type="hidden" name="clientId" value={clientId} />
              
              <div className="bg-success/5 border border-success/20 rounded-xl p-4 flex items-start gap-4 mb-6">
                <Sparkles className="w-5 h-5 text-success mt-0.5" />
                <div>
                  <p className="font-medium text-success">Sucesso! Criamos o espelho da sua Unidade Consumidora automaticamente.</p>
                  <p className="text-sm text-foreground/80 mt-1">Revisão final antes de continuarmos para a auditoria de faturas.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Inputs Hidden para submeter - Mapeamento Completo */}
                <input type="hidden" name="installationNumber" value={extractedData.installation} />
                <input type="hidden" name="meterNumber" value={extractedData.meter} />
                <input type="hidden" name="distributorName" value={extractedData.distributor} />
                <input type="hidden" name="address" value={extractedData.address} />
                <input type="hidden" name="supplyGroup" value={extractedData.group} />
                <input type="hidden" name="tariffModality" value={extractedData.modality} />
                <input type="hidden" name="connectionType" value={extractedData.connection} />
                <input type="hidden" name="referenceMonth" value={extractedData.referenceMonth} />
                <input type="hidden" name="dueDate" value={extractedData.dueDate} />
                <input type="hidden" name="totalAmount" value={extractedData.totalAmount} />
                <input type="hidden" name="consumptionPeakKwh" value={extractedData.consumptionPeakKwh} />
                <input type="hidden" name="consumptionOffPeakKwh" value={extractedData.consumptionOffPeakKwh} />
                <input type="hidden" name="consumptionTotalKwh" value={extractedData.consumptionTotalKwh} />
                <input type="hidden" name="measuredDemandPeakKw" value={extractedData.measuredDemandPeakKw} />
                <input type="hidden" name="measuredDemandOffPeakKw" value={extractedData.measuredDemandOffPeakKw} />
                <input type="hidden" name="billedDemandPeakKw" value={extractedData.billedDemandPeakKw} />
                <input type="hidden" name="billedDemandOffPeakKw" value={extractedData.billedDemandOffPeakKw} />
                <input type="hidden" name="demandOveragePeakKw" value={extractedData.demandOveragePeakKw} />
                <input type="hidden" name="demandOverageOffPeakKw" value={extractedData.demandOverageOffPeakKw} />
                <input type="hidden" name="reactiveEnergyPeakKvarh" value={extractedData.reactiveEnergyPeakKvarh} />
                <input type="hidden" name="powerFactorPeak" value={extractedData.powerFactorPeak} />
                <input type="hidden" name="tariffTePeak" value={extractedData.tariffTePeak} />
                <input type="hidden" name="tariffTusdPeak" value={extractedData.tariffTusdPeak} />
                <input type="hidden" name="icmsAmount" value={extractedData.icmsAmount} />
                <input type="hidden" name="pisAmount" value={extractedData.pisAmount} />
                <input type="hidden" name="cofinsAmount" value={extractedData.cofinsAmount} />
                <input type="hidden" name="publicLightingAmount" value={extractedData.publicLightingAmount} />
                <input type="hidden" name="fileName" value={extractedData.fileName} />
                
                <div className="space-y-1 bg-surface-elevated p-4 rounded-lg border border-border">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block">ID da Instalação (UC)</span>
                  <span className="text-lg font-mono font-bold">{extractedData.installation}</span>
                </div>
                
                <div className="space-y-1 bg-surface-elevated p-4 rounded-lg border border-border">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block">Distribuidora</span>
                  <span className="text-lg font-semibold flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" /> {extractedData.distributor}</span>
                </div>
                
                <div className="space-y-1 bg-surface-elevated p-4 rounded-lg border border-border col-span-2">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block">Endereço Fiscal</span>
                  <span className="text-base">{extractedData.address}</span>
                </div>

                <div className="space-y-1 bg-surface-elevated p-4 rounded-lg border border-border">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block">Grupo / Modalidade</span>
                  <div className="flex gap-2 items-center mt-1">
                    <span className="px-2 py-0.5 rounded bg-primary/20 text-primary-light text-xs font-bold uppercase tracking-wider">Grupo A</span>
                    <span className="text-sm font-medium">Tarifa Verde</span>
                  </div>
                </div>

                <div className="space-y-1 bg-surface-elevated p-4 rounded-lg border border-border">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block">Demanda Contratada (Exibição)</span>
                  <span className="text-lg font-mono font-bold text-accent">{extractedData.peakDemand || extractedData.measuredDemandPeakKw || "N/A"} <span className="text-xs text-muted-foreground">kW</span></span>
                </div>

                {/* Sub-grid de detalhes técnicos */}
                <div className="col-span-full mt-4 pt-4 border-t border-border/30">
                  <h4 className="text-sm font-bold flex items-center gap-2 mb-4 text-primary">
                    <Zap className="w-4 h-4" /> Detalhes Técnicos Extraídos
                  </h4>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                     <div className="p-3 bg-surface/30 rounded border border-border/50">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block">Consumo Ponta</span>
                        <span className="text-sm font-semibold">{extractedData.consumptionPeakKwh || 0} kWh</span>
                     </div>
                     <div className="p-3 bg-surface/30 rounded border border-border/50">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block">Demanda Medida</span>
                        <span className="text-sm font-semibold">{extractedData.measuredDemandPeakKw || 0} kW</span>
                     </div>
                     <div className="p-3 bg-surface/30 rounded border border-border/50">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block">Fator de Potência</span>
                        <span className="text-sm font-semibold">{extractedData.powerFactorPeak || "1.00"}</span>
                     </div>
                     <div className="p-3 bg-surface/30 rounded border border-border/50">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block">Tributos (Totais)</span>
                        <span className="text-sm font-semibold text-success">
                          R$ {((extractedData.icmsAmount || 0) + (extractedData.pisAmount || 0) + (extractedData.cofinsAmount || 0)).toFixed(2)}
                        </span>
                     </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border/50 pt-6 flex justify-end">
                <button 
                  type="submit" 
                  disabled={pending}
                  className="bg-primary hover:bg-primary-light text-primary-foreground px-8 py-3 rounded-full font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" /> Confirmar e Salvar Unidade
                </button>
              </div>

            </form>
          )}

        </div>
      )}
    </div>
  );
}
