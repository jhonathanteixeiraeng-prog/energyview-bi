import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // 1. Clear existing data (optional, but good for clean environment)
  // await prisma.auditItem.deleteMany();
  // await prisma.invoice.deleteMany();
  // await prisma.consumerUnit.deleteMany();
  // await prisma.client.deleteMany();
  // await prisma.user.deleteMany();
  // await prisma.organization.deleteMany();

  // 2. Organization
  const org = await prisma.organization.upsert({
    where: { cnpj: "12345678000199" },
    update: {},
    create: {
      name: "EnergyView Consultoria",
      cnpj: "12345678000199",
      plan: "PROFESSIONAL",
    },
  });

  // 3. User
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const user = await prisma.user.upsert({
    where: { email: "admin@energyview.com.br" },
    update: {},
    create: {
      name: "Administrador EnergyView",
      email: "admin@energyview.com.br",
      password: hashedPassword,
      role: "ADMIN",
      organizationId: org.id,
    },
  });

  // 4. Clients
  const client1 = await prisma.client.create({
    data: {
      name: "Indústrias Metalúrgicas Alfa",
      cnpj: "99888777000122",
      contactName: "João Silva",
      contactEmail: "joao@metalalfa.com",
      organizationId: org.id,
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: "Rede Supermercados Delta",
      cnpj: "11222333000144",
      contactName: "Maria Santos",
      contactEmail: "maria@deltasuper.com",
      organizationId: org.id,
    },
  });

  // 5. Consumer Units
  const unit1 = await prisma.consumerUnit.create({
    data: {
      installationNumber: "8877665544",
      meterNumber: "M-12345",
      address: "Av. Industrial, 1000 - Curitiba/PR",
      city: "Curitiba",
      state: "PR",
      distributorName: "COPEL",
      supplyGroup: "GROUP_A",
      supplySubgroup: "A4",
      tariffModality: "GREEN",
      connectionType: "THREE_PHASE",
      contractedDemandPeak: 150,
      contractedDemandOffPeak: 150,
      clientId: client1.id,
    },
  });

  // 6. Invoices (12 months of data)
  const invoicesData = [];
  const baseConsumption = 25000; // kWh
  const baseTotalAmount = 18000; // R$

  for (let i = 0; i < 12; i++) {
    const date = new Date(2025, i, 1);
    const fluctuation = 0.85 + Math.random() * 0.3; // 85% to 115%
    
    // Simulate some anomalies
    const isAnomalyMonth = i === 5 || i === 9; // June and October
    const measuredDemand = 150 * fluctuation;
    const peakDemand = isAnomalyMonth ? 165 : 145 * fluctuation;

    invoicesData.push({
      consumerUnitId: unit1.id,
      referenceMonth: date,
      dueDate: new Date(2025, i, 15),
      totalAmount: baseTotalAmount * fluctuation,
      status: "VALIDATED" as any,
      parsingConfidence: 0.99,
      originalFileUrl: "seed_file.pdf",
      originalFileName: `fatura_${i+1}_2025.pdf`,
      fileType: "pdf",
      
      consumptionTotalKwh: baseConsumption * fluctuation,
      consumptionPeakKwh: (baseConsumption * fluctuation) * 0.15,
      consumptionOffPeakKwh: (baseConsumption * fluctuation) * 0.85,
      
      measuredDemandPeakKw: peakDemand,
      measuredDemandOffPeakKw: measuredDemand,
      billedDemandPeakKw: Math.max(150, peakDemand),
      billedDemandOffPeakKw: Math.max(150, measuredDemand),
      
      demandOveragePeakKw: peakDemand > 150 ? peakDemand - 150 : 0,
      
      powerFactorPeak: isAnomalyMonth ? 0.88 : 0.94,
      powerFactorOffPeak: 0.95,
      
      icmsAmount: (baseTotalAmount * fluctuation) * 0.18,
      pisAmount: (baseTotalAmount * fluctuation) * 0.0125,
      cofinsAmount: (baseTotalAmount * fluctuation) * 0.0575,
    });
  }

  for (const inv of invoicesData) {
    const createdInvoice = await prisma.invoice.create({
      data: inv,
    });

    // Populate Audit Items for anomalies
    if (inv.demandOveragePeakKw > 0) {
      await prisma.auditItem.create({
        data: {
          invoiceId: createdInvoice.id,
          category: "DEMAND_OVERAGE",
          severity: "HIGH",
          title: "Ultrapassagem de Demanda Contratada",
          description: `Identificada ultrapassagem de ${inv.demandOveragePeakKw.toFixed(1)} kW no horário de ponta.`,
          actualValue: inv.measuredDemandPeakKw,
          expectedValue: 150,
          differenceValue: inv.demandOveragePeakKw,
          potentialSavings: inv.demandOveragePeakKw * 45, // Simulação de custo de multa
          status: "OPEN",
        },
      });
    }

    if (inv.powerFactorPeak < 0.92) {
      await prisma.auditItem.create({
        data: {
          invoiceId: createdInvoice.id,
          category: "POWER_FACTOR",
          severity: "MEDIUM",
          title: "Fator de Potência abaixo do Limite",
          description: `Fator de potência de ${inv.powerFactorPeak} está abaixo do limite regulatório de 0.92.`,
          actualValue: inv.powerFactorPeak,
          expectedValue: 0.92,
          potentialSavings: 350, // Multa estimada
          status: "OPEN",
        },
      });
    }
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
