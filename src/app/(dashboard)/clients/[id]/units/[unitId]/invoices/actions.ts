"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AuditEngine } from "@/lib/audit-engine";
import { InvoiceStatus } from "@prisma/client";

export async function createInvoiceAction(
  clientId: string,
  unitId: string,
  data: any
) {
  try {
    // Fetch Unit to get contracted parameters
    const unit = await prisma.consumerUnit.findUnique({
      where: { id: unitId }
    });

    if (!unit) throw new Error("Consumer Unit not found");

    // Apenas simulação de parseDate no mês de referência (ex: "03/2026" vira 2026-03-01)
    let refMonthDate = new Date();
    if (data.referenceMonth) {
       const parts = data.referenceMonth.split('/');
       if(parts.length === 2) {
          refMonthDate = new Date(parseInt(parts[1]), parseInt(parts[0]) - 1, 1);
       }
    }

    const newInvoice = await prisma.invoice.create({
      data: {
        consumerUnitId: unitId,
        referenceMonth: refMonthDate,
        dueDate: data.dueDate ? new Date(data.dueDate.split('/').reverse().join('-')) : new Date(),
        totalAmount: data.totalAmount || 0,
        
        status: 'PARSED',
        parsingConfidence: 0.98,
        
        // Dados de arquivo
        originalFileUrl: "local_upload",
        originalFileName: data.fileName || "Fatura.pdf",
        fileType: "pdf",

        // Consumos
        consumptionPeakKwh: data.consumptionPeakKwh,
        consumptionOffPeakKwh: data.consumptionOffPeakKwh,
        consumptionTotalKwh: data.consumptionTotalKwh || ((data.consumptionPeakKwh || 0) + (data.consumptionOffPeakKwh || 0)),
        
        // Demandas
        measuredDemandPeakKw: data.measuredDemandPeakKw,
        measuredDemandOffPeakKw: data.measuredDemandOffPeakKw,
        billedDemandPeakKw: data.billedDemandPeakKw,
        billedDemandOffPeakKw: data.billedDemandOffPeakKw,
        demandOveragePeakKw: data.demandOveragePeakKw,

        // Reativos e FP
        reactiveEnergyPeakKvarh: data.reactiveEnergyPeakKvarh,
        reactiveEnergyOffPeakKvarh: data.reactiveEnergyOffPeakKvarh,
        powerFactorPeak: data.powerFactorPeak,
        powerFactorOffPeak: data.powerFactorOffPeak,
        
        // Tarifas
        tariffTePeak: data.tariffTePeak,
        tariffTeOffPeak: data.tariffTeOffPeak,
        tariffTusdPeak: data.tariffTusdPeak,
        tariffTusdOffPeak: data.tariffTusdOffPeak,

        // Valores Faturados
        amountConsumptionPeak: data.amountConsumptionPeak,
        amountConsumptionOffPeak: data.amountConsumptionOffPeak,
        amountDemandPeak: data.amountDemandPeak,
        amountDemandOffPeak: data.amountDemandOffPeak,
        amountDemandOverage: data.amountDemandOverage,
        amountReactiveExcess: data.amountReactiveExcess,

        // Tributos
        icmsRate: data.icmsRate,
        icmsAmount: data.icmsAmount,
        pisRate: data.pisRate,
        pisAmount: data.pisAmount,
        cofinsRate: data.cofinsRate,
        cofinsAmount: data.cofinsAmount,
        publicLightingAmount: data.publicLightingAmount
      }
    });

    // PREFORM AUTOMATED AUDIT
    const auditResults = AuditEngine.analyzeInvoice(newInvoice, unit);
    
    if (auditResults.length > 0) {
      await prisma.auditItem.createMany({
        data: auditResults.map(res => ({
          ...res,
          invoiceId: newInvoice.id
        }))
      });
      
      // Update invoice status if critical issues found
      const hasHighSeverity = auditResults.some(r => r.severity === 'HIGH' || r.severity === 'CRITICAL');
      await prisma.invoice.update({
        where: { id: newInvoice.id },
        data: { status: hasHighSeverity ? 'REVIEW' : 'PARSED' }
      });
    }

    revalidatePath(`/clients/${clientId}/units/${unitId}`);
    revalidatePath(`/dashboard`);
    return { success: true, invoiceId: newInvoice.id, auditsCount: auditResults.length };
  } catch (error) {
    console.error("Failed to create invoice:", error);
    return { success: false, error: "Erro interno ao salvar os dados da fatura." };
  }
}
