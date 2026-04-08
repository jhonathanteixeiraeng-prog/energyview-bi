"use client";

import { useState, useMemo } from "react";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Cell 
} from "recharts";
import { 
  Zap, TrendingDown, Target, ArrowRight, Info, Scale, 
  ShieldCheck, Calculator, CheckCircle2, AlertCircle
} from "lucide-react";
import { SimulationResult, AclEngine, SimulationParams } from "@/lib/acl-engine";

export function AclSimulatorView({ initialInvoices, unit }: { initialInvoices: any[], unit: any }) {
  const [params, setParams] = useState<SimulationParams>({
    energyPriceMwh: 260, // R$/MWh médio mercado livre
    tusdDiscountPercent: 50, // 50% para renovável
    chargesPercent: 12, // 12% encargos estimados
  });

  const result = useMemo(() => {
    return AclEngine.simulate(initialInvoices, unit, params);
  }, [initialInvoices, unit, params]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Parameters Sidebar */}
      <div className="lg:col-span-4 space-y-6">
        <div className="glass-card p-6 rounded-3xl border-primary/20 sticky top-24">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Parâmetros ACL
          </h3>
          
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  Preço Energia (R$/MWh)
                  <Info className="w-3 h-3 opacity-50" />
                </label>
                <span className="text-sm font-black text-primary">R$ {params.energyPriceMwh}</span>
              </div>
              <input 
                type="range" min="150" max="450" step="5"
                value={params.energyPriceMwh}
                onChange={(e) => setParams(p => ({ ...p, energyPriceMwh: Number(e.target.value) }))}
                className="w-full accent-primary bg-surface-elevated h-2 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-bold">
                <span>150</span>
                <span>300</span>
                <span>450</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  Desconto TUSD Fio (%)
                  <Info className="w-3 h-3 opacity-50" />
                </label>
                <span className="text-sm font-black text-accent">{params.tusdDiscountPercent}%</span>
              </div>
              <input 
                type="range" min="0" max="100" step="1"
                value={params.tusdDiscountPercent}
                onChange={(e) => setParams(p => ({ ...p, tusdDiscountPercent: Number(e.target.value) }))}
                className="w-full accent-accent bg-surface-elevated h-2 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-bold">
                <span>0%</span>
                <span>50% (I50)</span>
                <span>100% (I100)</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  Encargos e Perdas (%)
                </label>
                <span className="text-sm font-black text-warning">{params.chargesPercent}%</span>
              </div>
              <input 
                type="range" min="5" max="25" step="0.5"
                value={params.chargesPercent}
                onChange={(e) => setParams(p => ({ ...p, chargesPercent: Number(e.target.value) }))}
                className="w-full accent-warning bg-surface-elevated h-2 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div className="mt-10 p-4 rounded-2xl bg-primary/5 border border-primary/10">
            <p className="text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              Os cálculos consideram tarifas TUSD de ponta/fora ponta e alíquotas de impostos baseadas no histórico da UC.
            </p>
          </div>
        </div>
      </div>

      {/* Results Area */}
      <div className="lg:col-span-8 space-y-8">
        
        {/* Savings Header Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl border-success/20 bg-success/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-125 transition-transform">
              <TrendingDown className="w-12 h-12 text-success" />
            </div>
            <p className="text-xs font-bold text-success uppercase tracking-widest mb-1">Economia Anual</p>
            <h4 className="text-2xl font-black text-foreground">{formatCurrency(result.annualSavings)}</h4>
            <div className="flex items-center gap-1 mt-2">
               <span className="text-xs font-bold bg-success text-success-foreground px-1.5 py-0.5 rounded">
                -{result.savingsPercent.toFixed(1)}%
               </span>
               <span className="text-[10px] text-muted-foreground">redução total</span>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border-primary/20 bg-primary/5">
             <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Preço Médio ACL</p>
             <h4 className="text-2xl font-black text-foreground">R$ {result.averageAclKwh.toFixed(2)}/kWh</h4>
             <p className="text-[10px] text-muted-foreground mt-2">Antigo: R$ {result.averageCaptiveKwh.toFixed(2)}/kWh</p>
          </div>

          <div className="glass-card p-6 rounded-2xl border-accent/20">
             <p className="text-xs font-bold text-accent uppercase tracking-widest mb-1">Viabilidade</p>
             <div className="flex items-center gap-2 mt-1">
               {result.viability === 'HIGHLY_VIABLE' && (
                 <>
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <h4 className="text-lg font-black text-success">Alta</h4>
                 </>
               )}
               {result.viability === 'VIABLE' && (
                 <>
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <h4 className="text-lg font-black text-primary">Viável</h4>
                 </>
               )}
               {result.viability === 'MARGINAL' && (
                 <>
                  <AlertCircle className="w-5 h-5 text-warning" />
                  <h4 className="text-lg font-black text-warning">Marginal</h4>
                 </>
               )}
             </div>
             <p className="text-[10px] text-muted-foreground mt-2">Baseado em volume de carga e economia</p>
          </div>
        </div>

        {/* Main Comparison Chart */}
        <div className="glass-card p-8 rounded-3xl border-border/40">
           <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold tracking-tight">Projeção Comparativa</h3>
              <p className="text-sm text-muted-foreground">Distribuição de custo mensal Cativo (ACR) vs Livre (ACL)</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-muted-foreground/30"></div>
                 <span className="text-muted-foreground uppercase opacity-70">Mercado Cativo</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_rgba(15,118,110,0.5)]"></div>
                 <span className="text-primary uppercase">Mercado Livre</span>
               </div>
            </div>
          </div>
          
          <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={result.monthlyComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                  tickFormatter={(val) => `R$ ${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="glass-card p-4 rounded-xl border-white/10 shadow-2xl backdrop-blur-xl">
                          <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-widest">{label}</p>
                          <div className="space-y-1">
                            <div className="flex justify-between gap-8 items-center">
                              <span className="text-xs text-muted-foreground">Cativo:</span>
                              <span className="text-sm font-mono font-bold">{formatCurrency(payload[0].value as number)}</span>
                            </div>
                            <div className="flex justify-between gap-8 items-center">
                              <span className="text-xs text-primary font-bold">Simulado ACL:</span>
                              <span className="text-sm font-mono font-black text-primary">{formatCurrency(payload[1].value as number)}</span>
                            </div>
                            <div className="mt-2 pt-2 border-t border-white/5 flex justify-between gap-8 items-center">
                              <span className="text-[10px] text-success font-bold uppercase">Economia:</span>
                              <span className="text-xs font-black text-success">
                                {formatCurrency((payload[0].value as number) - (payload[1].value as number))}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="captive" fill="rgba(255,255,255,0.1)" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="acl" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={40}>
                   {result.monthlyComparison.map((entry, index) => (
                    <Cell key={`cell-${index}`} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Breakdown Card */}
        <div className="glass-card p-8 rounded-3xl border-border/40 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8">
            <Scale className="w-16 h-16 text-muted-foreground/5 mr-[-20px] mt-[-20px]" />
          </div>
          <h3 className="text-lg font-bold mb-6">Resumo Executivo da Simulação</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <span className="text-sm text-muted-foreground">Economia Média Mensal</span>
                <span className="text-sm font-bold text-success">{formatCurrency(result.annualSavings / 12)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <span className="text-sm text-muted-foreground">Capex Estimado (Migração)</span>
                <span className="text-sm font-bold">R$ 15.000,00</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">Payback Simples</span>
                <span className="text-sm font-bold text-primary">Imediato (Opex)</span>
              </div>
            </div>
            <div className="bg-surface-elevated/50 p-6 rounded-2xl border border-border/40">
               <h4 className="text-sm font-bold mb-3 flex items-center gap-2 text-accent">
                 <Target className="w-4 h-4" /> Recomendação Estratégica
               </h4>
               <p className="text-xs text-muted-foreground leading-relaxed">
                 {result.viability === 'HIGHLY_VIABLE' 
                    ? "Devido ao alto volume de consumo e diferença tarifária, a migração para o ACL é altamente recomendada. Recomendamos o uso de energia renovável (I50) para maximizar o desconto na TUSD de ponta."
                    : "A migração apresenta viabilidade positiva, porém requer análise detalhada do perfil de carga horário para garantir que o suprimento de energia no ACL cubra as pontas de consumo sem exposição ao PLD."}
               </p>
               <button className="mt-4 w-full bg-accent hover:bg-accent/80 text-accent-foreground py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2">
                 Gerar Relatório de Viabilidade <ArrowRight className="w-3 h-3" />
               </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
