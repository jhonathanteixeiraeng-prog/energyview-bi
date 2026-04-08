import { Bell, Search, Menu } from "lucide-react";

export function Topbar() {
  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40">
      
      {/* Esquerda: Search e Hamburguer (mobile) */}
      <div className="flex items-center gap-4">
        <button className="md:hidden text-muted-foreground hover:text-foreground">
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="hidden md:flex relative group">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar clientes, faturas..." 
            className="w-80 bg-surface border border-border rounded-full pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Direita: Notificações e Perfil */}
      <div className="flex items-center gap-4">
        <button className="relative w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-surface hover:text-foreground transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent animate-pulse" />
        </button>
        
        <div className="flex items-center gap-3 border-l border-border pl-4">
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm border border-primary/30">
            A
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium leading-none">Analista Demo</p>
            <p className="text-xs text-muted-foreground mt-1">Consultoria de Energia</p>
          </div>
        </div>
      </div>
      
    </header>
  );
}
