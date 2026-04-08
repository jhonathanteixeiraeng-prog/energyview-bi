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

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let parsedText = "";
    try {
      const pdfData = await pdfParse(buffer);
      parsedText = pdfData.text;
    } catch (e) {
      console.error("Erro na leitura bruta do PDF:", e);
      return NextResponse.json({ error: "Falha ao ler dados binários do PDF." }, { status: 400 });
    }

    if (!parsedText || parsedText.trim().length < 50) {
      return NextResponse.json({ error: "PDF vazio ou escaneado sem OCR." }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const prompt = `
      Você é um agente analisador de faturas de energia do Brasil.
      Vou te fornecer o texto extraído de um PDF.
      Seu objetivo é encontrar os dados de faturamento do mês e retornar EXATAMENTE este objeto JSON preenchido:
      
      {
        "referenceMonth": "string (ex: 03/2026)",
        "dueDate": "string formato DD/MM/YYYY",
        "totalAmount": "number (Valor Total a Pagar / Faturado, usar ponto como decimal)",
        "fileName": "string",
        
        "consumptionPeakKwh": "number (Consumo Ponta, se houver)",
        "consumptionOffPeakKwh": "number (Consumo Fora de Ponta, se houver)",
        "consumptionTotalKwh": "number (Soma de todos consumos ativos kWh)",
        
        "measuredDemandPeakKw": "number (Demanda Medida Ponta, se aplicável)",
        "measuredDemandOffPeakKw": "number (Demanda Medida Fora Ponta)",
        "billedDemandPeakKw": "number (Demanda Faturada Ponta)",
        "billedDemandOffPeakKw": "number (Demanda Faturada Fora Ponta)",
        "demandOveragePeakKw": "number (Ultrapassagem de Demanda kW, se houver, ou null)",
        
        "reactiveEnergyPeakKvarh": "number (Energia Reativa KVArh consumida ou excedente na ponta, ou null)",
        "reactiveEnergyOffPeakKvarh": "number",
        "powerFactorPeak": "number (ex: 0.92, fator de potencia, ou null)",
        "powerFactorOffPeak": "number",
        
        "tariffTePeak": "number (Tarifa de Energia TE em R$/kWh aplicável, ex: 0.354)",
        "tariffTeOffPeak": "number",
        "tariffTusdPeak": "number (Tarifa de Distribuição TUSD em R$/kWh, ou kW para demanda)",
        "tariffTusdOffPeak": "number",
        
        "amountConsumptionPeak": "number (R$ faturado no consumo ponta)",
        "amountConsumptionOffPeak": "number (R$ faturado consumo fora ponta)",
        "amountDemandPeak": "number (R$ faturado demanda ponta)",
        "amountDemandOffPeak": "number (R$ faturado demanda fora ponta)",
        "amountDemandOverage": "number (R$ multa ultrapassagem)",
        "amountReactiveExcess": "number (R$ multa energia reativa FER)",

        "icmsRate": "number (Alíquota ICMS %, ex: 18.0 ou 22.0)",
        "icmsAmount": "number (Valor Reais retido ICMS Base)",
        "pisRate": "number (Alíquota PIS %)",
        "pisAmount": "number",
        "cofinsRate": "number (Alíquota COFINS %)",
        "cofinsAmount": "number",
        "publicLightingAmount": "number (Contribuição Iluminação Pública CIP / COSIP, R$)"
      }

      Atenção: Procure sempre converter R$ formatados com vírgula (3.245,30) e % (18,00) para float limpo do JSON (3245.30). Se uma variável for absolutamente não existente no layout atual (ex: Conta do Grupo B não tem demanda), mande null nela.


      Texto da Fatura:
      """
      ${parsedText.substring(0, 10000)}
      """
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const responseText = completion.choices[0].message.content;
    const extractedData = JSON.parse(responseText || "{}");

    return NextResponse.json({ data: extractedData });
    
  } catch (error: any) {
    console.error("Erro no processamento da Extração de Fatura:", error);

    if (error?.status === 429 || error?.code === 'insufficient_quota') {
       console.error("Cota da OpenAI esgotada na extração da fatura.");
       return NextResponse.json(
         { error: "Limite da cota da Inteligência Artificial atingido. Por favor, adicione créditos na OpenAI para processar faturas completas (Rendimento)." }, 
         { status: 429 }
       );
    }

    return NextResponse.json({ error: "Erro interno ao processar a fatura." }, { status: 500 });
  }
}
