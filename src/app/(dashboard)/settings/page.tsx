import { Database, KeyRound, Rocket } from "lucide-react";

export default function SettingsPage() {
  const checks = [
    {
      icon: Database,
      title: "Banco Neon",
      description: "Confirme a variável DATABASE_URL no ambiente do Vercel antes do deploy de produção.",
    },
    {
      icon: KeyRound,
      title: "Autenticação",
      description: "Garanta NEXTAUTH_SECRET e NEXTAUTH_URL configurados para o domínio publicado.",
    },
    {
      icon: Rocket,
      title: "Deploy",
      description: "Use esta área como checklist operacional enquanto o módulo completo de configurações não chega.",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Painel operacional temporário para publicação e validação do ambiente.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {checks.map((item) => (
          <div key={item.title} className="glass-card rounded-2xl border border-border/50 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <item.icon className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
