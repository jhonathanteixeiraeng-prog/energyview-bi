import { Activity, FileText, Zap, BarChart3, ShieldAlert, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8">
      <div className="absolute inset-0 max-w-full overflow-hidden pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      <div className="max-w-4xl w-full space-y-12 text-center animate-fade-in relative z-10">
        
        {/* Header */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm animate-slide-up">
            <Zap className="w-4 h-4 fill-primary/50 text-primary" />
            <span className="text-sm font-medium tracking-tight">O futuro da gestão energética</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight animate-slide-up" style={{ animationDelay: '100ms' }}>
            Auditoria avançada de
            <span className="block mt-2 gradient-text">Faturas de Energia</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-slide-up leading-relaxed" style={{ animationDelay: '200ms' }}>
            A plataforma B2B premium para consultorias otimizarem custos, detectarem anomalias de cobrança e simularem a migração para o Mercado Livre de forma eficiente.
          </p>
        </div>

        {/* Mock Setup Instructions */}
        <div className="glass-card max-w-3xl mx-auto p-8 rounded-2xl text-left animate-slide-up mt-12 gradient-border relative overflow-hidden" style={{ animationDelay: '300ms' }}>
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
           <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
             <Activity className="w-5 h-5 text-primary" /> 
             Status do Projeto (Ambiente Local)
           </h2>
           <p className="text-muted-foreground mb-4">
             Como o `npm` estava restrito no seu ambiente via terminal, geramos 
             a fundação do projeto de forma manual na pasta atual.
           </p>
           <div className="bg-surface-elevated border border-border p-5 rounded-lg space-y-3 font-mono text-sm shadow-inner">
             <p className="flex items-center gap-2"><span className="text-primary font-bold">1.</span> Abra o terminal do seu Mac.</p>
             <p className="flex items-center gap-2"><span className="text-primary font-bold">2.</span> Navegue até a pasta do projeto:</p>
             <p className="pl-6 text-muted-foreground">cd "/Users/jhonathanteixeira/Documents/DEV /Antigravity/Analise de faturas"</p>
             <p className="flex items-center gap-2"><span className="text-primary font-bold">3.</span> Instale as dependências:</p>
             <p className="pl-6 text-muted-foreground">npm install</p>
             <p className="pl-6 text-muted-foreground">npm run dev</p>
           </div>
           
           <div className="mt-8 pt-6 border-t border-border/50 flex justify-center">
             <Link 
               href="/dashboard"
               className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-primary-foreground px-6 py-3 rounded-full font-medium transition-all shadow-[0_0_20px_rgba(15,118,110,0.3)] hover:shadow-[0_0_30px_rgba(20,184,166,0.5)] hover:-translate-y-1"
             >
               Entrar no Dashboard <ArrowRight className="w-4 h-4" />
             </Link>
           </div>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 animate-slide-up" style={{ animationDelay: '400ms' }}>
          
          <div className="glass-card p-6 rounded-xl text-left glass-card-hover group">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <ShieldAlert className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Auditoria Automática</h3>
            <p className="text-sm text-muted-foreground">Detecte erros em TUSD, TE, ultrapassagem de demanda e excedente reativo.</p>
          </div>

          <div className="glass-card p-6 rounded-xl text-left glass-card-hover group">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <BarChart3 className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Análise ACL</h3>
            <p className="text-sm text-muted-foreground">Simule viabilidade de migração para o Mercado Livre com precisão e clareza.</p>
          </div>

          <div className="glass-card p-6 rounded-xl text-left glass-card-hover group">
            <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <FileText className="w-6 h-6 text-info" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Geração de Relatórios</h3>
            <p className="text-sm text-muted-foreground">Exporte laudos e diagnósticos técnicos padronizados em PDF instantaneamente.</p>
          </div>

        </div>
      </div>
    </main>
  );
}
