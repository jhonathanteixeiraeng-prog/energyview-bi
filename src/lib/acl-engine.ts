import { Invoice, ConsumerUnit, MigrationViability } from "@prisma/client";

export type SimulationParams = {
  energyPriceMwh: number; // R$/MWh
  tusdDiscountPercent: number; // % de desconto no fio (ex: 50% para energia renovável)
  chargesPercent: number; // Encargos estimados (%)
};

export type SimulationResult = {
  annualCaptiveCost: number;
  annualAclCost: number;
  annualSavings: number;
  savingsPercent: number;
  averageCaptiveKwh: number;
  averageAclKwh: number;
  viability: MigrationViability;
  paybackMonths: number;
  monthlyComparison: {
    month: string;
    captive: number;
    acl: number;
  }[];
};

export class AclEngine {
  /**
   * Simulates ACL migration based on historical ACR invoices.
   */
  static simulate(invoices: Invoice[], unit: ConsumerUnit, params: SimulationParams): SimulationResult {
    // 1. Calculate historical ACR cost
    let annualCaptiveCost = 0;
    const monthlyComparison: any[] = [];

    invoices.forEach(inv => {
      const monthStr = inv.referenceMonth.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      const captiveCost = inv.totalAmount;
      annualCaptiveCost += captiveCost;

      // Calculate ACL cost for this specific month
      const aclCost = this.calculateAclMonthly(inv, unit, params);
      
      monthlyComparison.push({
        month: monthStr,
        captive: captiveCost,
        acl: aclCost
      });
    });

    const annualAclCost = monthlyComparison.reduce((sum, m) => sum + m.acl, 0);
    const annualSavings = annualCaptiveCost - annualAclCost;
    const savingsPercent = (annualSavings / annualCaptiveCost) * 100;

    // Average unit costs (R$/kWh)
    const totalKwh = invoices.reduce((sum, inv) => sum + (inv.consumptionTotalKwh || 0), 0);
    const averageCaptiveKwh = annualCaptiveCost / totalKwh;
    const averageAclKwh = annualAclCost / totalKwh;

    return {
      annualCaptiveCost,
      annualAclCost,
      annualSavings,
      savingsPercent,
      averageCaptiveKwh,
      averageAclKwh,
      viability: this.determineViability(savingsPercent, annualSavings),
      paybackMonths: annualSavings > 0 ? 0 : 99, // Payback no ACL é imediato (operação), mas aqui simulamos se vale a pena
      monthlyComparison
    };
  }

  private static calculateAclMonthly(invoice: Invoice, unit: ConsumerUnit, params: SimulationParams): number {
    const consumptionKwh = invoice.consumptionTotalKwh || 0;
    const demandKw = invoice.billedDemandPeakKw || unit.contractedDemandPeak || 0;

    // 1. Custo de Energia (Preço MWh -> R$/kWh)
    const energyPriceKwh = params.energyPriceMwh / 1000;
    const energyCost = consumptionKwh * energyPriceKwh;

    // 2. Custo de Fio (TUSD-Demanda)
    // No ACL, o consumidor paga TUSD-Fio para a distribuidora.
    // Simulamos um desconto comum para fontes renováveis (I50 ou I100).
    const tusdTariff = invoice.tariffDemandPeak || 20.00; // Fallback para tarifa de demanda
    const tusdCost = demandKw * tusdTariff * (1 - (params.tusdDiscountPercent / 100));

    // 3. Encargos e Perdas (Estimados)
    const chargesCost = energyCost * (params.chargesPercent / 100);

    // 4. Tributos (Simplificado baseado na fatura original)
    // ICMS no ACL costuma recair sobre o fio e a energia (via nota separada).
    // Usamos a alíquota média da fatura original.
    const taxRate = (invoice.icmsRate || 18) / 100;
    const subTotal = energyCost + tusdCost + chargesCost;
    const totalWithTaxes = subTotal / (1 - taxRate); // Gross-up impostos

    // Adiciona CIP original
    return totalWithTaxes + (invoice.publicLightingAmount || 0);
  }

  private static determineViability(savingsPercent: number, annualSavings: number): MigrationViability {
    if (savingsPercent > 20 && annualSavings > 50000) return "HIGHLY_VIABLE";
    if (savingsPercent > 10) return "VIABLE";
    if (savingsPercent > 5) return "MARGINAL";
    return "NOT_VIABLE";
  }
}
