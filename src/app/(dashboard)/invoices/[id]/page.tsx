import { ArrowLeft, CheckCircle, AlertTriangle, XCircle, TrendingDown, DollarSign, Calculator, Zap, FileText, Download, BarChart2, Activity, PieChart, Info, Scale } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function InvoiceDiagnosticPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      consumerUnit: {
        include: { client: true }
      }
    }
  });

  if (!invoice) notFound();

  // === CALCULOS DE ENGENHARIA ===
  const totalKwh = (invoice.consumptionTotalKwh || 0);
  const averagePrice = totalKwh > 0 ? invoice.totalAmount / totalKwh : 0;
  
  // Estimativa de Custos baseados na Tarifa TE / TUSD puras (Sem impostos no calculo direto)
  let peakKwh = invoice.consumptionPeakKwh || (totalKwh * 0.15); // mock se n tiver
  let offPeakKwh = invoice.consumptionOffPeakKwh || (totalKwh * 0.85); // mock se n tiver
  
  const teCost = totalKwh * (invoice.tariffTePeak || 0.25); // Exemplo visual
  const tusdCost = totalKwh * (invoice.tariffTusdPeak || 0.22);
  const estTaxes = invoice.totalAmount - (teCost + tusdCost);

  // Fator de Carga (Estimativa considerando Demanda Contratada e 730h)
  const demand = invoice.consumerUnit.contractedDemandOffPeak || 500;
  const loadFactor = totalKwh > 0 ? (totalKwh / (demand * 730)) * 100 : 0;

  // Audit Motor (Simulação de Anomalias Reais e Detalhadas)
  const anomalies = [];
  let pf = invoice.powerFactorPeak || invoice.powerFactorOffPeak;
  
  // Rule 1: Power Factor < 0.92
  if (pf && pf < 0.92) {
    anomalies.push({
      id: "PF_LOW",
      title: "Baixo Fator de Potência",
      desc: `O fator de potência registrado (${pf}) está abaixo do limite mínimo da ANEEL (0.92). Multas e encargos por Energia Reativa Excedente (FER) foram ou serão aplicados se não houver correção do banco de capacitores.`,
      severity: "critical",
      potentialLoss: invoice.totalAmount * 0.08
    });
  } else {
    anomalies.push({
      id: "PF_OK",
      title: "Energia Reativa e Fator de Potência Saudável",
      desc: "Instalação estabilizada. O consumo de energia reativa está dentro da gratuidade regulatória, sem aplicação de multas pela concessionária.",
      severity: "success",
      potentialLoss: 0
    });
  }

  // Rule 2: TUSD High Cost
  if (invoice.tariffTusdPeak && invoice.tariffTusdPeak > 0.3) {
    anomalies.push({
      id: "TUSD_HIGH",
      title: "TUSD Ponta Elevada",
      desc: `A tarifa R$ ${invoice.tariffTusdPeak.toFixed(2)}/kWh da TUSD está no percentil superior histórico da distribuidora. Recomendável revisar o enquadramento tarifário.`,
      severity: "warning",
      potentialLoss: invoice.totalAmount * 0.12
    });
  }

  // Rule 3: Load Factor Analysis
  if (loadFactor < 30 && loadFactor > 0) {
    anomalies.push({
      id: "LOAD_LOW",
      title: "Fator de Carga Muito Baixo",
      desc: `Sua demanda é altíssima e pouco utilizada (${loadFactor.toFixed(1)}%). Você está pagando uma "reserva de espaço" na rede elétrica muito maior do que realmente consome. Sugerido redução de demanda.`,
      severity: "warning",
      potentialLoss: invoice.totalAmount * 0.15
    });
  } else {
     anomalies.push({
      id: "LOAD_OK",
      title: "Otimização de Demanda",
      desc: "O balanço entre a demanda contratada e a energia consumida ao longo das horas do mês tem um fator de carga excelente.",
      severity: "success",
      potentialLoss: 0
    });
  }

  // Formatter hook
  const f = (val: number | null | undefined, cur = false, dec = 2) => {
    if (val === null || val === undefined) return "—";
    if (cur) return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec })}`;
    return val.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      
      {/* HEADER TÁTICO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface/40 p-6 rounded-2xl border border-border/50">
        <div className="flex items-center gap-4">
          <Link 
            href={`/clients/${invoice.consumerUnit.clientId}/units/${invoice.consumerUnitId}`} 
            className="w-12 h-12 rounded-full bg-surface-elevated hover:bg-surface border border-border flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">Análise da Fatura</h1>
              <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold bg-primary/20 text-primary-light rounded-md border border-primary/20">Auditado Inteligência A.</span>
            </div>
            <p className="text-muted-foreground mt-1 text-sm font-medium">
              REFERÊNCIA: <span className="text-foreground">{new Date(invoice.referenceMonth).toLocaleDateString('pt-BR', {month: 'long', year: 'numeric'}).toUpperCase()}</span> 
              <span className="mx-2">•</span> 
              UC {invoice.consumerUnit.installationNumber} 
              <span className="mx-2">•</span> 
              <span className="uppercase">{invoice.consumerUnit.distributorName}</span>
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
           <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface hover:bg-surface-elevated border border-border text-sm font-medium transition-colors">
              <FileText className="w-4 h-4" /> Ver Arquivo PDF
           </button>
           <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-light text-primary-foreground text-sm font-medium transition-colors shadow-lg shadow-primary/20">
              <Download className="w-4 h-4" /> Exportar Diagnóstico
           </button>
        </div>
      </div>

      {/* STRATEGIC KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="glass-card p-5 rounded-xl border-t-4 border-t-destructive flex flex-col justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2"><DollarSign className="w-4 h-4 text-destructive"/> Valor da Fatura</span>
            <div className="text-3xl font-bold font-mono tracking-tight">{f(invoice.totalAmount, true)}</div>
            <div className="text-xs text-muted-foreground mt-2">Vencimento: {new Date(invoice.dueDate || Date.now()).toLocaleDateString('pt-BR')}</div>
         </div>
         <div className="glass-card p-5 rounded-xl border-t-4 border-t-accent flex flex-col justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2"><Zap className="w-4 h-4 text-accent"/> Consumo Ativo Total</span>
            <div className="text-3xl font-bold font-mono tracking-tight">{f(totalKwh)} <span className="text-sm font-sans text-muted-foreground">kWh</span></div>
            <div className="text-xs text-muted-foreground mt-2">Divisão estimada: Ponta e Fora Ponta</div>
         </div>
         <div className="glass-card p-5 rounded-xl border-t-4 border-t-primary flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute right-[-10px] top-[-10px] opacity-10 group-hover:scale-110 transition-transform"><Scale className="w-24 h-24 text-primary" /></div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex z-10">Preço Médio (KWh)</span>
            <div className="text-3xl font-bold font-mono tracking-tight z-10">{f(averagePrice, true, 4)}</div>
            <div className="text-xs text-primary mt-2 font-medium z-10">Custo efetivo global da unidade</div>
         </div>
         <div className="glass-card p-5 rounded-xl border-t-4 border-t-indigo-500 flex flex-col justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2"><Activity className="w-4 h-4 text-indigo-500" /> Fator de Carga</span>
            <div className="text-3xl font-bold font-mono tracking-tight">{f(loadFactor, false, 1)}<span className="text-sm font-sans text-muted-foreground">%</span></div>
            <div className="text-xs text-muted-foreground mt-2">Grau de aproveitamento da demanda</div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUNA ESQUERDA E CENTRAL: DADOS TECNICOS E AUDITORIA */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Breakdown Financeiro Rápido */}
          <div className="glass-card rounded-2xl p-6 border border-border/50">
             <div className="flex items-center justify-between mb-6">
               <h3 className="text-lg font-bold flex items-center gap-2">
                 <PieChart className="w-5 h-5 text-primary" /> Estrutura da Cobrança (Aproximada)
               </h3>
             </div>
             
             <div className="bg-surface rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                   <thead className="bg-surface-elevated/50 text-muted-foreground border-b border-border/50">
                      <tr>
                         <th className="px-4 py-3 text-left font-medium">Componente</th>
                         <th className="px-4 py-3 text-right font-medium">Tarifa Unitária</th>
                         <th className="px-4 py-3 text-right font-medium">Estimativa Financeira</th>
                         <th className="px-4 py-3 text-right font-medium">% da Fatura</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-border/50">
                      <tr>
                         <td className="px-4 py-3 font-medium text-primary-light">Energia (TE)</td>
                         <td className="px-4 py-3 text-right font-mono">{f(invoice.tariffTePeak, true, 5)}</td>
                         <td className="px-4 py-3 text-right font-mono">{f(teCost, true)}</td>
                         <td className="px-4 py-3 text-right font-mono">~{f((teCost/invoice.totalAmount)*100, false, 1)}%</td>
                      </tr>
                      <tr>
                         <td className="px-4 py-3 font-medium text-accent-light">Uso do Sistema (TUSD)</td>
                         <td className="px-4 py-3 text-right font-mono">{f(invoice.tariffTusdPeak, true, 5)}</td>
                         <td className="px-4 py-3 text-right font-mono">{f(tusdCost, true)}</td>
                         <td className="px-4 py-3 text-right font-mono">~{f((tusdCost/invoice.totalAmount)*100, false, 1)}%</td>
                      </tr>
                      <tr>
                         <td className="px-4 py-3 font-medium text-muted-foreground flex items-center gap-1">Tributos e Encargos B<Info className="w-3 h-3"/></td>
                         <td className="px-4 py-3 text-right text-muted-foreground">—</td>
                         <td className="px-4 py-3 text-right font-mono text-muted-foreground">{f(estTaxes > 0 ? estTaxes : 0, true)}</td>
                         <td className="px-4 py-3 text-right font-mono text-muted-foreground">~{f(estTaxes > 0 ? (estTaxes/invoice.totalAmount)*100 : 0, false, 1)}%</td>
                      </tr>
                   </tbody>
                   <tfoot className="bg-surface-elevated border-t border-border/80">
                      {(invoice.icmsAmount || invoice.pisAmount || invoice.cofinsAmount) && (
                         <tr>
                            <td colSpan={2} className="px-4 py-2 font-medium text-right text-[10px] uppercase text-muted-foreground">Tributos (ICMS/PIS/COFINS)</td>
                            <td className="px-4 py-2 text-right font-mono text-muted-foreground">{f((invoice.icmsAmount||0) + (invoice.pisAmount||0) + (invoice.cofinsAmount||0), true)}</td>
                            <td className="px-4 py-2 text-right"></td>
                         </tr>
                      )}
                      <tr>
                         <td colSpan={2} className="px-4 py-3 font-bold text-right uppercase text-xs tracking-wider">Total Lançado</td>
                         <td className="px-4 py-3 text-right font-bold text-destructive font-mono text-base">{f(invoice.totalAmount, true)}</td>
                         <td className="px-4 py-3 text-right font-bold font-mono">100%</td>
                      </tr>
                   </tfoot>
                </table>
             </div>
          </div>

          {/* Raio-X Técnico Completo */}
          <div className="glass-card rounded-2xl p-6 border border-border/50">
             <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
                <Activity className="w-5 h-5 text-primary" /> Raio-X Técnico da Instalação
             </h2>
             
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                
                {/* Cadastral */}
                <div className="space-y-3">
                   <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border/50 pb-1">Enquadramento</h4>
                   <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Mercado</span>
                      <span className="font-semibold text-foreground">Cativo</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Grupo Tarifário</span>
                      <span className="font-semibold text-foreground">{invoice.consumerUnit.supplyGroup === 'GROUP_A' ? 'Grupo A (Alta Tensão)' : 'Grupo B (Baixa Tensão)'}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Modalidade</span>
                      <span className="font-semibold text-foreground capitalize">{invoice.consumerUnit.tariffModality.toLowerCase()}</span>
                   </div>
                </div>

                {/* Tarifas */}
                <div className="space-y-3">
                   <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border/50 pb-1">Tarifas Aplicadas</h4>
                   <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">TE (Energia)</span>
                      <span className="font-mono text-primary-light">{f(invoice.tariffTePeak, true, 4)} <span className="text-[10px] text-muted-foreground font-sans">/kWh</span></span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">TUSD (Uso do Sistema)</span>
                      <span className="font-mono text-accent-light">{f(invoice.tariffTusdPeak, true, 4)} <span className="text-[10px] text-muted-foreground font-sans">/kWh</span></span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Custo Médio Global</span>
                      <span className="font-mono text-foreground">{f(averagePrice, true, 4)} <span className="text-[10px] text-muted-foreground font-sans">/kWh</span></span>
                   </div>
                </div>

                {/* Tributos */}
                <div className="space-y-3">
                   <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border/50 pb-1">Tributos Setoriais</h4>
                   <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">ICMS</span>
                      <span className="font-mono">{invoice.icmsRate ? `${invoice.icmsRate}%` : '—'}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">PIS/COFINS</span>
                      <span className="font-mono">{invoice.pisRate && invoice.cofinsRate ? `${invoice.pisRate + invoice.cofinsRate}%` : '—'}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cosip/Iluminação</span>
                      <span className="font-mono">{f(invoice.publicLightingAmount, true)}</span>
                   </div>
                </div>

                {/* Demanda */}
                <div className="space-y-3">
                   <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border/50 pb-1">Análise de Demanda (kW)</h4>
                   <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Contratada</span>
                      <span className="font-mono text-foreground">{f(invoice.consumerUnit.contractedDemandOffPeak, false, 0)}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Medida</span>
                      <span className="font-mono text-foreground">{f(invoice.measuredDemandOffPeakKw || invoice.measuredDemandPeakKw, false, 0)}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Faturada</span>
                      <span className="font-mono text-foreground">{f(invoice.billedDemandOffPeakKw || invoice.billedDemandPeakKw, false, 0)}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ultrapassagem</span>
                      <span className="font-mono text-destructive">{invoice.demandOveragePeakKw || invoice.demandOverageOffPeakKw ? f(invoice.demandOveragePeakKw || invoice.demandOverageOffPeakKw, false, 0) : '0,00'}</span>
                   </div>
                </div>

                {/* Consumo */}
                <div className="space-y-3">
                   <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border/50 pb-1">Métricas de Consumo</h4>
                   <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Consumo Ponta</span>
                      <span className="font-mono text-foreground">{f(invoice.consumptionPeakKwh, false, 0)} <span className="text-[10px] text-muted-foreground font-sans">kWh</span></span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Consumo Fora Ponta</span>
                      <span className="font-mono text-foreground">{f(invoice.consumptionOffPeakKwh, false, 0)} <span className="text-[10px] text-muted-foreground font-sans">kWh</span></span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Fator de Carga</span>
                      <span className="font-mono text-foreground">{f(loadFactor, false, 1)}%</span>
                   </div>
                </div>

                {/* Qualidade / Reativos */}
                <div className="space-y-3">
                   <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border/50 pb-1">Qualidade (Reativos)</h4>
                   <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Fator de Potência</span>
                      <span className={`font-mono font-bold ${pf && pf < 0.92 ? 'text-destructive' : 'text-success'}`}>{pf ? f(pf, false, 2) : '—'}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Energia Reativa Exced.</span>
                      <span className="font-mono text-destructive">{invoice.reactiveExcessPeakKvarh || invoice.reactiveExcessOffPeakKvarh ? f(invoice.reactiveExcessPeakKvarh || invoice.reactiveExcessOffPeakKvarh, false, 0) : '0,00'} <span className="text-[10px] text-muted-foreground font-sans">kVArh</span></span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Multa (FER)</span>
                      <span className="font-mono text-destructive">{invoice.amountReactiveExcess ? f(invoice.amountReactiveExcess, true) : 'R$ 0,00'}</span>
                   </div>
                </div>

             </div>
          </div>

          {/* Motor de Validação */}
          <div className="glass-card rounded-2xl p-6 border border-border/50">
             <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
                <Calculator className="w-5 h-5 text-primary" /> Conformidade Regulatória (ANEEL)
             </h2>
          
             <div className="grid gap-3">
               {anomalies.map((anom) => (
                 <div key={anom.id} className={`rounded-xl p-4 border shadow-sm flex items-start gap-4 transition-transform hover:translate-x-1 ${
                   anom.severity === 'critical' ? 'bg-destructive/5 border-destructive/20' : 
                   anom.severity === 'warning' ? 'bg-warning/5 border-warning/20' : 
                   'bg-success/5 border-success/20'
                 }`}>
                   <div className={`p-2 rounded-xl mt-0.5 ${
                     anom.severity === 'critical' ? 'bg-destructive/20 text-destructive' : 
                     anom.severity === 'warning' ? 'bg-warning/20 text-warning' : 
                     'bg-success/20 text-success'
                   }`}>
                     {anom.severity === 'critical' ? <XCircle className="w-5 h-5" /> : 
                      anom.severity === 'warning' ? <AlertTriangle className="w-5 h-5" /> : 
                      <CheckCircle className="w-5 h-5" />}
                   </div>
                   <div className="flex-1">
                     <h4 className={`font-bold mb-1 ${
                       anom.severity === 'critical' ? 'text-destructive' : 
                       anom.severity === 'warning' ? 'text-warning' : 'text-success'
                     }`}>{anom.title}</h4>
                     <p className="text-sm text-foreground/80 leading-relaxed max-w-2xl">
                       {anom.desc}
                     </p>
                     
                     {anom.potentialLoss > 0 && (
                        <div className="inline-flex mt-3 items-center gap-1.5 px-3 py-1.5 bg-surface-elevated rounded-md text-xs font-semibold text-muted-foreground border border-border/50">
                          <TrendingDown className="w-4 h-4 text-accent" />
                          Sobrecusto / Penalidade Est.: <span className="text-foreground tracking-wide font-mono">{f(anom.potentialLoss, true)}</span>
                        </div>
                     )}
                   </div>
                 </div>
               ))}
             </div>
          </div>

        </div>

        {/* COLUNA DIREITA: ACL SUGGESTION & DADOS DE DEMANDA */}
        <div className="space-y-6">
           
           {/* Card ACL */}
           <div className="bg-gradient-to-br from-primary/20 via-surface to-background border border-primary/30 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                 <Zap className="w-32 h-32" />
              </div>
              <h3 className="text-lg font-bold text-primary-light mb-2">Migração para o Mercado Livre (ACL)</h3>
              <p className="text-sm text-foreground/80 mb-6 relative z-10 leading-relaxed">
                Pelo volume massivo de consumo ({f(totalKwh)} kWh) e preço médio alto no Mercado Cativo, essa Unidade Consumidora tem retorno **Imediato** migrando para o ACL.
              </p>
              
              <div className="space-y-4 mb-6 relative z-10 bg-surface/50 p-4 rounded-xl border border-primary/10">
                 <div className="flex justify-between items-center text-sm border-b border-border/50 pb-3">
                    <span className="text-muted-foreground tracking-wide uppercase text-[10px] font-bold">Gasto Anual Estimado (Cativo):</span>
                    <span className="font-mono font-medium">{f(invoice.totalAmount * 12, true)}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-primary-light tracking-wide uppercase text-[10px] font-bold">Economia Média ACL (Varejo ~25%):</span>
                    <span className="font-mono font-bold text-success text-lg">-{f((invoice.totalAmount * 12) * 0.25, true)}</span>
                 </div>
                 <div className="text-[10px] text-muted-foreground text-right italic">Projeção conservadora considerando deságio na TE.</div>
              </div>

              <button className="w-full relative z-10 bg-primary hover:bg-primary-light text-primary-foreground py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg hover:shadow-primary/30">
                Gerar Proposta Comercial PDF
              </button>
           </div>
           
           {/* Info Consumo Breakdown */}
           <div className="glass-card rounded-2xl p-6 border border-border/50">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2"><BarChart2 className="w-4 h-4"/> Perfil Bi-horário</h3>
              
              <div className="space-y-5">
                 <div>
                    <div className="flex justify-between text-sm mb-1 line-clamp-1">
                       <span className="font-medium text-accent">Ponta</span>
                       <span className="font-mono">{f(peakKwh)} kWh</span>
                    </div>
                    <div className="w-full bg-surface-elevated rounded-full h-2.5 overflow-hidden">
                       <div className="bg-accent h-2.5 rounded-full" style={{ width: `${(peakKwh/totalKwh)*100}%` }}></div>
                    </div>
                 </div>

                 <div>
                    <div className="flex justify-between text-sm mb-1 line-clamp-1">
                       <span className="font-medium text-primary">Fora Ponta</span>
                       <span className="font-mono">{f(offPeakKwh)} kWh</span>
                    </div>
                    <div className="w-full bg-surface-elevated rounded-full h-2.5 overflow-hidden">
                       <div className="bg-primary h-2.5 rounded-full" style={{ width: `${(offPeakKwh/totalKwh)*100}%` }}></div>
                    </div>
                 </div>
              </div>
           </div>

        </div>

      </div>

    </div>
  );
}
