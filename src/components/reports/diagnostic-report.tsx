import { 
  Document, Page, Text, View, StyleSheet, Font, Image 
} from "@react-pdf/renderer";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#334155',
    backgroundColor: '#ffffff',
  },
  // Cover Page
  cover: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  accentBar: {
    width: 60,
    height: 6,
    backgroundColor: '#0ea5e9',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 10,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 60,
  },
  clientBox: {
    borderTop: 1,
    borderBottom: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 20,
    width: '100%',
    textAlign: 'center',
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  // Body Sections
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottom: 1,
    borderColor: '#e2e8f0',
    paddingBottom: 10,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 20,
    borderLeft: 4,
    borderColor: '#0ea5e9',
    paddingLeft: 10,
  },
  // Summary Cards
  cardContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 30,
  },
  card: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    border: 1,
    borderColor: '#e2e8f0',
  },
  cardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0ea5e9',
    marginTop: 5,
  },
  // Table
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 0,
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 10,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    fontWeight: 'bold',
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
  },
  tableCellDescription: {
    flex: 3,
    paddingRight: 10,
  },
  tableCellSeverity: {
    flex: 1,
    textAlign: 'center',
  },
  tableCellSaving: {
    flex: 1,
    textAlign: 'right',
    fontWeight: 'bold',
    color: '#10b981',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    borderTop: 1,
    borderColor: '#f1f5f9',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    color: '#94a3b8',
    fontSize: 8,
  }
});

type Props = {
  client: any;
  unit: any;
  auditItems: any[];
  simulation?: any;
  date: Date;
};

export const DiagnosticReport = ({ client, unit, auditItems, simulation, date }: Props) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const totalPotentialSavings = auditItems.reduce((sum, item) => sum + (item.potentialSavings || 0), 0);

  return (
    <Document title={`Diagnóstico Energético - ${client.name}`}>
      
      {/* Page 1: Cover */}
      <Page size="A4" style={styles.page}>
        <View style={styles.cover}>
          <View style={styles.accentBar} />
          <Text style={styles.title}>Diagnóstico de Eficiência Energética</Text>
          <Text style={styles.subtitle}>Relatório de Auditoria e Proposta ACL</Text>
          
          <View style={styles.clientBox}>
            <Text style={{ fontSize: 10, color: '#94a3b8', marginBottom: 5 }}>CLIENTE</Text>
            <Text style={styles.clientName}>{client.name}</Text>
            <Text style={{ fontSize: 9, color: '#64748b', marginTop: 10 }}>Identificação: {unit.installationNumber}</Text>
            <Text style={{ fontSize: 9, color: '#64748b' }}>Concessionária: {unit.distributorName}</Text>
          </View>

          <Text style={{ marginTop: 100, fontSize: 10, color: '#94a3b8' }}>
            Data de Referência: {format(date, "MMMM 'de' yyyy", { locale: ptBR })}
          </Text>
        </View>
        <View style={styles.footer}>
          <Text>EnergyView Intelligence</Text>
          <Text>Documento confidencial e proprietário</Text>
        </View>
      </Page>

      {/* Page 2: Executive Summary */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={{ fontWeight: 700, color: '#0ea5e9' }}>EnergyView BI</Text>
          <Text>{client.name}</Text>
        </View>

        <Text style={styles.sectionTitle}>1. Sumário Executivo</Text>
        <Text style={{ marginBottom: 20, lineHeight: 1.5 }}>
          Este relatório apresenta os resultados da auditoria automatizada realizada nas faturas de energia elétrica da unidade acima identificada. 
          Foram analisados consumos técnicos, enquadramento tarifário e conformidade regulatória conforme resolução ANEEL.
        </Text>

        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={{ fontSize: 8, fontWeight: 700, color: '#64748b' }}>ECONOMIA POTENCIAL ANUAL</Text>
            <Text style={styles.cardValue}>{formatCurrency(totalPotentialSavings)}</Text>
          </View>
          <View style={styles.card}>
             <Text style={{ fontSize: 8, fontWeight: 700, color: '#64748b' }}>ALERTAS IDENTIFICADOS</Text>
             <Text style={[styles.cardValue, { color: '#f59e0b' }]}>{auditItems.length}</Text>
          </View>
          <View style={styles.card}>
             <Text style={{ fontSize: 8, fontWeight: 700, color: '#64748b' }}>VIABILIDADE ACL</Text>
             <Text style={[styles.cardValue, { color: '#6366f1' }]}>
               {simulation?.viability === 'HIGHLY_VIABLE' ? 'Alta' : 'Em Análise'}
             </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>2. Detalhamento de Oportunidades</Text>
        
        {/* Table of Audit Items */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCellHeader, styles.tableCellDescription]}>Oportunidade / Anomalia</Text>
            <Text style={[styles.tableCellHeader, styles.tableCellSeverity]}>Severidade</Text>
            <Text style={[styles.tableCellHeader, styles.tableCellSaving]}>Impacto (Est.)</Text>
          </View>

          {auditItems.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.tableCellDescription}>
                <Text style={{ fontWeight: 600, fontSize: 10, color: '#0f172a' }}>{item.title}</Text>
                <Text style={{ fontSize: 8, color: '#64748b', marginTop: 3 }}>{item.description}</Text>
              </View>
              <Text style={[styles.tableCellSeverity, { fontSize: 8, fontWeight: 600, color: item.severity === 'CRITICAL' ? '#ef4444' : '#64748b' }]}>
                {item.severity}
              </Text>
              <Text style={styles.tableCellSaving}>{formatCurrency(item.potentialSavings || 0)}</Text>
            </View>
          ))}
        </View>

        <Text style={{ fontSize: 8, color: '#94a3b8', marginTop: 20, fontStyle: 'italic' }}>
          * Os valores de economia potencial são estimativos baseados no histórico analisado e podem variar conforme a implementação técnica das recomendações.
        </Text>

        <View style={styles.footer}>
          <Text>Página 2 </Text>
          <Text>Relatório gerado em {format(new Date(), "dd/MM/yyyy HH:mm")}</Text>
        </View>
      </Page>

    </Document>
  );
};
