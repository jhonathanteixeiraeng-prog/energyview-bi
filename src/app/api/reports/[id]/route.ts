import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderToStream } from "@react-pdf/renderer";
import { DiagnosticReport } from "@/components/reports/diagnostic-report";
import React from "react";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: unitId } = await params;

    // 1. Fetch all necessary data
    const unit = await prisma.consumerUnit.findUnique({
      where: { id: unitId },
      include: {
        client: true,
        invoices: {
          orderBy: { referenceMonth: 'desc' },
          take: 12,
          include: { auditItems: true }
        }
      }
    });

    if (!unit) {
      return NextResponse.json({ error: "Unidade não encontrada" }, { status: 404 });
    }

    // Accumulate all audit items from these invoices
    const allAudits = unit.invoices.flatMap(inv => inv.auditItems);

    // Fetch ACL simulation if exists for this unit's client
    // (Simplified: and pick the most recent analysis)
    const simulation = await prisma.aclSimulation.findFirst({
      where: { analysis: { invoices: { some: { consumerUnitId: unitId } } } }
    });

    // 2. Generate PDF instance
    const reportElement = React.createElement(DiagnosticReport, {
      client: unit.client,
      unit: unit,
      auditItems: allAudits,
      simulation: simulation,
      date: new Date()
    });

    const stream = await renderToStream(reportElement as any);

    // 3. Return as PDF stream
    return new NextResponse(stream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Diagnostico_${unit.installationNumber}.pdf"`,
      },
    });

  } catch (error) {
    console.error("Erro ao gerar relatório PDF:", error);
    return NextResponse.json({ error: "Falha na geração do documento." }, { status: 500 });
  }
}
