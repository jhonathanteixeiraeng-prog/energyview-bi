import { AuditCategory, AuditSeverity, Invoice, ConsumerUnit } from "@prisma/client";

export type AuditResult = {
  category: AuditCategory;
  severity: AuditSeverity;
  title: string;
  description: string;
  expectedValue?: number;
  actualValue?: number;
  differenceValue?: number;
  potentialSavings?: number;
  recommendation?: string;
};

export class AuditEngine {
  /**
   * Performs a comprehensive energy audit on a single invoice.
   */
  static analyzeInvoice(invoice: any, unit: ConsumerUnit): AuditResult[] {
    const results: AuditResult[] = [];

    // 1. Audit Power Factor
    this.auditPowerFactor(invoice, results);

    // 2. Audit Demand Overage
    this.auditDemandOverage(invoice, unit, results);

    // 3. Audit Reactive Excess
    this.auditReactiveExcess(invoice, results);

    // 4. Audit Consumption Anomalies
    this.auditConsumptionAnomalies(invoice, results);

    return results;
  }

  private static auditPowerFactor(invoice: any, results: AuditResult[]) {
    const pfPeak = invoice.powerFactorPeak;
    const pfOffPeak = invoice.powerFactorOffPeak;
    const limit = 0.92;

    if (pfPeak && pfPeak < limit) {
      results.push({
        category: "POWER_FACTOR",
        severity: pfPeak < 0.8 ? "HIGH" : "MEDIUM",
        title: "Fator de Potência Baixo (Ponta)",
        description: `O fator de potência na ponta (${pfPeak}) está abaixo do limite regulatório de ${limit}.`,
        actualValue: pfPeak,
        expectedValue: limit,
        recommendation: "Instalação ou ajuste de banco de capacitores para correção de reativos.",
        potentialSavings: invoice.amountReactiveExcess || 250 // Estimativa se não houver valor explícito
      });
    }

    if (pfOffPeak && pfOffPeak < limit) {
      results.push({
        category: "POWER_FACTOR",
        severity: pfOffPeak < 0.8 ? "HIGH" : "MEDIUM",
        title: "Fator de Potência Baixo (Fora Ponta)",
        description: `O fator de potência fora da ponta (${pfOffPeak}) está abaixo do limite de ${limit}.`,
        actualValue: pfOffPeak,
        expectedValue: limit,
        recommendation: "Revisar cargas indutivas operando em períodos de baixa carga.",
      });
    }
  }

  private static auditDemandOverage(invoice: any, unit: ConsumerUnit, results: AuditResult[]) {
    const measuredPeak = invoice.measuredDemandPeakKw;
    const contractedPeak = unit.contractedDemandPeak || 0;
    const tolerance = 1.05; // 5% de tolerância regulatória

    if (measuredPeak && measuredPeak > contractedPeak * tolerance) {
      const overage = measuredPeak - contractedPeak;
      results.push({
        category: "DEMAND_OVERAGE",
        severity: "HIGH",
        title: "Ultrapassagem de Demanda Contratada",
        description: `A demanda medida (${measuredPeak} kW) superou a contratada (${contractedPeak} kW) em mais de 5%.`,
        actualValue: measuredPeak,
        expectedValue: contractedPeak,
        differenceValue: overage,
        potentialSavings: overage * 40, // Estimativa conservadora de multa por kW
        recommendation: "Avaliar aumento da demanda contratada ou implementar controle de demanda (peak shaving)."
      });
    }
  }

  private static auditReactiveExcess(invoice: any, results: AuditResult[]) {
    if ((invoice.amountReactiveExcess && invoice.amountReactiveExcess > 0) || 
        (invoice.reactiveExcessPeakKvarh && invoice.reactiveExcessPeakKvarh > 0)) {
      results.push({
        category: "REACTIVE_EXCESS",
        severity: "MEDIUM",
        title: "Cobrança de Energia Reativa Excedente",
        description: "Identificada cobrança por consumo de energia reativa excedente na fatura.",
        actualValue: invoice.amountReactiveExcess,
        potentialSavings: invoice.amountReactiveExcess,
        recommendation: "Análise técnica do banco de capacitores e perfil de carga."
      });
    }
  }

  private static auditConsumptionAnomalies(invoice: any, results: AuditResult[]) {
    // Exemplo: Alerta de consumo zerado ou muito baixo em unidades produtivas
    if (invoice.consumptionTotalKwh === 0) {
      results.push({
        category: "CONSUMPTION_ANOMALY",
        severity: "LOW",
        title: "Consumo Total Zerado",
        description: "A fatura apresenta consumo total zerado, o que pode indicar erro de leitura ou unidade inativa.",
        actualValue: 0
      });
    }
  }
}
