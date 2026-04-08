import { NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import OpenAI from "openai";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    // Lendo o buffer do PDF
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extrair texto usando pdf-parse
    let parsedText = "";
    try {
      const pdfData = await pdfParse(buffer);
      parsedText = pdfData.text;
    } catch (e) {
      console.error("Erro na leitura bruta do PDF:", e);
      return NextResponse.json({ error: "Falha ao ler dados binários do PDF. Formato suportado: PDF padrão de texto." }, { status: 400 });
    }

    if (!parsedText || parsedText.trim().length < 50) {
      return NextResponse.json({ error: "O PDF parece estar vazio ou é uma imagem escaneada sem texto (OCR de imagem ainda não habilitado)." }, { status: 400 });
    }

    // Verificar Chave de API da OpenAI
    if (!process.env.OPENAI_API_KEY) {
      console.warn("OPENAI_API_KEY não encontrada. Simulando extração real para ambiente de teste.");
      // MOCK FALLBACK (sem chave API)
      await new Promise(r => setTimeout(r, 2000));
      return NextResponse.json({
        data: {
          installation: "74092183", 
          meter: "LA-992120",
          distributor: "Enel (Fallback Local)",
          address: "Endereço extraído via OCR Simulado, São Paulo - SP",
          group: "GROUP_A",
          modality: "GREEN",
          connection: "THREE_PHASE",
          referenceMonth: "04/2026",
          dueDate: "15/05/2026",
          totalAmount: 1250.45,
          consumptionPeakKwh: 450,
          consumptionOffPeakKwh: 1200,
          measuredDemandPeakKw: 165, // Causará alerta de ultrapassagem se contratada < 165
          billedDemandPeakKw: 165,
          powerFactorPeak: 0.88, // Causará alerta de fator de potência
          icmsAmount: 220.40,
          pisAmount: 15.20,
          cofinsAmount: 70.30
        }
      });
    }

    // CHAMADA REAL PARA O LLM (OpenAI)
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const prompt = `
      Você é um agente especializado em faturas de energia elétrica brasileiras.
      Vou te fornecer o texto bruto extraído de um PDF de fatura de energia.
      Extraia as seguintes informações e retorne EXATAMENTE este objeto JSON:
      
      {
        "installation": "string",
        "meter": "string",
        "distributor": "string",
        "address": "string",
        "group": "GROUP_A | GROUP_B",
        "modality": "GREEN | BLUE | CONVENTIONAL | WHITE",
        "connection": "SINGLE_PHASE | TWO_PHASE | THREE_PHASE",
        "referenceMonth": "string (MM/YYYY)",
        "dueDate": "string (DD/MM/YYYY)",
        "totalAmount": "number",
        "consumptionPeakKwh": "number",
        "consumptionOffPeakKwh": "number",
        "consumptionTotalKwh": "number",
        "measuredDemandPeakKw": "number",
        "measuredDemandOffPeakKw": "number",
        "billedDemandPeakKw": "number",
        "billedDemandOffPeakKw": "number",
        "demandOveragePeakKw": "number",
        "demandOverageOffPeakKw": "number",
        "reactiveEnergyPeakKvarh": "number",
        "reactiveEnergyOffPeakKvarh": "number",
        "reactiveExcessPeakKvarh": "number",
        "reactiveExcessOffPeakKvarh": "number",
        "powerFactorPeak": "number",
        "powerFactorOffPeak": "number",
        "tariffTePeak": "number",
        "tariffTeOffPeak": "number",
        "tariffTusdPeak": "number",
        "tariffTusdOffPeak": "number",
        "tariffDemandPeak": "number",
        "tariffDemandOffPeak": "number",
        "amountConsumptionPeak": "number",
        "amountConsumptionOffPeak": "number",
        "amountDemandPeak": "number",
        "amountDemandOffPeak": "number",
        "amountDemandOverage": "number",
        "amountReactiveExcess": "number",
        "icmsRate": "number",
        "icmsAmount": "number",
        "pisRate": "number",
        "pisAmount": "number",
        "cofinsRate": "number",
        "cofinsAmount": "number",
        "publicLightingAmount": "number"
      }

      Atenção às regras de negócio:
      - O grupo tarifário A geralmente contém tarifas Verde ou Azul e lida com "Demanda kW".
      - Identifique se é trifásica (THREE_PHASE), bifásica (TWO_PHASE) ou monofásica (SINGLE_PHASE).
      - Se algum valor não for encontrado, retorne null (exceto strings obrigatórias).

      Texto da Fatura:
      """
      ${parsedText}
      """
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o-mini", // rápido, barato e excelente pra JSON
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const responseText = completion.choices[0].message.content;
    const extractedData = JSON.parse(responseText || "{}");

    return NextResponse.json({ data: extractedData });
    
  } catch (error: any) {
    console.error("Erro no processamento da Fatura:", error);

    // Se o erro for de Quota (429) ou erro genérico de API, não retornamos mock, notificamos o erro real.
    if (error?.status === 429 || error?.code === 'insufficient_quota') {
       console.error("Cota da OpenAI esgotada na extração da fatura.");
       return NextResponse.json(
         { error: "Limite da cota da Inteligência Artificial atingido. Por favor, adicione créditos ou atualize o seu plano na plataforma da OpenAI para realizar novas extrações em tempo real." }, 
         { status: 429 }
       );
    }

    return NextResponse.json({ error: "Erro interno ao processar inteligência artificial da fatura." }, { status: 500 });
  }
}
