import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { theme } from "../theme";

// Categorias
const categorias = [
  {
    id: "NEGOCIA",
    nome: "Avity Negocia",
    subtitulo: "Você escolhe o valor",
    precoMinimo: 20,
    precoMaximo: 150,
    valorSugerido: 50,
    descricaoCurta: "Defina o valor que cabe no seu bolso",
    icone: "💰",
    cor: "#AF52DE",
    negociar: true,
  },
  {
    id: "ESSENCIAL",
    nome: "Avity Essencial",
    subtitulo: "Mais econômico",
    preco: 30,
    precoOriginal: 45,
    descricaoCurta: "Consulta rápida com clínicas próximas",
    icone: "🩺",
    cor: "#34C759",
  },
  {
    id: "PREMIUM",
    nome: "Avity Premium",
    subtitulo: "Melhor experiência",
    preco: 48,
    precoOriginal: 70,
    descricaoCurta: "Maior disponibilidade e conforto",
    icone: "⭐",
    cor: "#007AFF",
  },
  {
    id: "ESPECIALISTA",
    nome: "Especialista",
    subtitulo: "Profissional especializado",
    preco: 72,
    precoOriginal: 100,
    descricaoCurta: "Atendimento com especialistas da área",
    icone: "👨‍⚕️",
    cor: "#5856D6",
  },
  {
    id: "URGENCIA",
    nome: "Urgência",
    subtitulo: "Atendimento prioritário",
    preco: 60,
    precoOriginal: 85,
    descricaoCurta: "Atendimento rápido",
    icone: "🚨",
    cor: "#FF4444",
  },
];

export default function SelecaoScreen({ route, navigation }) {
  const { especialidade } = route.params || {};
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("ESSENCIAL");
  const [paraOutro, setParaOutro] = useState(false);
  const [pacienteNome, setPacienteNome] = useState("");
  const [pacienteCpf, setPacienteCpf] = useState("");
  const [pacienteData, setPacienteData] = useState("");
  const [valorNegociado, setValorNegociado] = useState(50);
  const [pagamentoInfo, setPagamentoInfo] = useState({ 
    tipo: "PIX", 
    nome: "PIX", 
    logo: "❖",
    detalhes: null 
  });
  
  const categoriaAtual = categorias.find(c => c.id === categoriaSelecionada);
  const isNegocia = categoriaSelecionada === "NEGOCIA";

  const aumentarValor = () => {
    if (valorNegociado < 150) {
      setValorNegociado(valorNegociado + 10);
    }
  };

  const diminuirValor = () => {
    if (valorNegociado > 20) {
      setValorNegociado(valorNegociado - 10);
    }
  };

  const handleNegociar = () => {
    navigation.navigate("NegociaScreen", {
      especialidade: especialidade?.nome,
      onValorNegociado: (valor) => {
        setValorNegociado(valor);
      }
    });
  };

  // BOTÃO FINAL INTELIGENTE - Processa direto o pagamento
  const handleFinalizar = () => {
    if (paraOutro && (!pacienteNome || !pacienteCpf || !pacienteData)) {
      Alert.alert("Atenção", "Preencha os dados do paciente.");
      return;
    }

    let valorFinal = isNegocia ? valorNegociado : categoriaAtual?.preco;
    
    if (pagamentoInfo.tipo === "PIX") {
      navigation.navigate("PagamentoPix", {
        valor: valorFinal,
        descricao: `CONSULTA ${especialidade?.nome?.split(' - ')[0]?.toUpperCase() || "MÉDICA"}`,
        paciente: paraOutro ? { nome: pacienteNome, cpf: pacienteCpf, data: pacienteData } : null,
      });
    } 
    else if (pagamentoInfo.tipo === "COPARTICIPACAO") {
      Alert.alert(
        "✅ Coparticipação",
        `Pagamento via Coparticipação processado!\n\nValor: R$ ${valorFinal}\nConsulta: ${categoriaAtual?.nome}\n\nA empresa pagará parte deste valor.`
      );
    } 
    else {
      // Navega para a tela de pagamento com cartão, passando os dados do cartão salvo
      navigation.navigate("PagamentoCartao", {
        valor: valorFinal,
        descricao: `CONSULTA ${especialidade?.nome?.split(' - ')[0]?.toUpperCase() || "MÉDICA"}`,
        paciente: paraOutro ? { nome: pacienteNome, cpf: pacienteCpf, data: pacienteData } : null,
        cartaoSalvo: pagamentoInfo.detalhes, // Passa o cartão que foi selecionado
      });
    }
  };

  const abrirFormasPagamento = () => {
    let valorFinal = isNegocia ? valorNegociado : categoriaAtual?.preco;
    
    navigation.navigate("EscolherPagamento", {
      valor: valorFinal,
      descricao: `CONSULTA ${especialidade?.nome?.split(' - ')[0]?.toUpperCase() || "MÉDICA"}`,
      paciente: paraOutro ? { nome: pacienteNome, cpf: pacienteCpf, data: pacienteData } : null,
      podeMostrarCoparticipacao: !paraOutro,
      onPagamentoSelecionado: (pagamento, dados) => {
        if (pagamento === "PIX") {
          setPagamentoInfo({ 
            tipo: "PIX", 
            nome: "PIX", 
            logo: "❖",
            detalhes: null 
          });
        } else if (pagamento === "COPARTICIPACAO") {
          setPagamentoInfo({ 
            tipo: "COPARTICIPACAO", 
            nome: "COPARTICIPAÇÃO", 
            logo: "🏛️",
            detalhes: null 
          });
        } else {
          setPagamentoInfo({ 
            tipo: "CARTAO", 
            nome: `${dados?.bandeiraNome || "CARTAO"} ${dados?.final ? `•••• ${dados.final}` : ""}`,
            logo: dados?.bandeira || "💳",
            detalhes: dados
          });
        }
      },
      currentPagamento: pagamentoInfo.tipo,
    });
  };

  const getPagamentoDisplay = () => {
    if (pagamentoInfo.tipo === "PIX") {
      return "PIX";
    } else if (pagamentoInfo.tipo === "COPARTICIPACAO") {
      return "Coparticipação";
    } else {
      return `${pagamentoInfo.nome}`;
    }
  };

  const valorExibido = () => {
    if (isNegocia) return `R$ ${valorNegociado}`;
    return `R$ ${categoriaAtual?.preco}`;
  };

  const podeMostrarCoparticipacao = !paraOutro;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerEspecialidade}>{especialidade?.nome || "Consulta médica"}</Text>
          <Text style={styles.headerSubtitulo}>Escolha a melhor opção</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        
        <View style={styles.atendimentoCard}>
          <Text style={styles.atendimentoLabel}>Atendimento para</Text>
          <View style={styles.atendimentoRow}>
            <TouchableOpacity 
              style={[styles.atendimentoOpcao, !paraOutro && styles.atendimentoOpcaoAtivo]}
              onPress={() => setParaOutro(false)}
            >
              <Text style={[styles.atendimentoTexto, !paraOutro && styles.atendimentoTextoAtivo]}>Para mim</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.atendimentoOpcao, paraOutro && styles.atendimentoOpcaoAtivo]}
              onPress={() => setParaOutro(true)}
            >
              <Text style={[styles.atendimentoTexto, paraOutro && styles.atendimentoTextoAtivo]}>Outra pessoa</Text>
            </TouchableOpacity>
          </View>
        </View>

        {paraOutro && (
          <View style={styles.pacienteCard}>
            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              value={pacienteNome}
              onChangeText={setPacienteNome}
            />
            <TextInput
              style={styles.input}
              placeholder="CPF"
              value={pacienteCpf}
              onChangeText={setPacienteCpf}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Data de nascimento"
              value={pacienteData}
              onChangeText={setPacienteData}
            />
          </View>
        )}

        <Text style={styles.sectionTitle}>Opções de consulta</Text>
        
        {categorias.map((cat) => {
          const selecionada = categoriaSelecionada === cat.id;
          const precoDisplay = cat.id === "NEGOCIA" ? `R$ ${valorNegociado}` : `R$ ${cat.preco}`;
          
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoriaCard,
                selecionada && { 
                  borderColor: cat.cor, 
                  borderWidth: 2,
                  backgroundColor: cat.cor + "08",
                }
              ]}
              onPress={() => setCategoriaSelecionada(cat.id)}
              activeOpacity={0.8}
            >
              <View style={styles.categoriaLeft}>
                <View style={[styles.categoriaIconeBox, { backgroundColor: cat.cor + "15" }]}>
                  <Text style={styles.categoriaIcone}>{cat.icone}</Text>
                </View>
                <View style={styles.categoriaInfo}>
                  <View style={styles.categoriaHeader}>
                    <Text style={styles.categoriaNome}>{cat.nome}</Text>
                    {cat.id === "URGENCIA" && (
                      <View style={styles.urgenciaBadge}>
                        <Text style={styles.urgenciaBadgeText}>🚨 Prioritário</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.categoriaDesc}>{cat.descricaoCurta}</Text>
                </View>
              </View>
              
              <View style={styles.categoriaRight}>
                <View style={styles.precosContainer}>
                  {cat.precoOriginal && (
                    <Text style={styles.precoOriginal}>R$ {cat.precoOriginal}</Text>
                  )}
                  
                  {cat.id === "NEGOCIA" ? (
                    <View style={styles.negociaPreview}>
                      <TouchableOpacity onPress={diminuirValor} style={styles.negociaPreviewBtn}>
                        <Text style={styles.negociaPreviewBtnText}>−</Text>
                      </TouchableOpacity>
                      <Text style={[styles.categoriaPreco, { color: cat.cor }]}>{precoDisplay}</Text>
                      <TouchableOpacity onPress={aumentarValor} style={styles.negociaPreviewBtn}>
                        <Text style={styles.negociaPreviewBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Text style={[styles.categoriaPreco, { color: cat.cor }]}>{precoDisplay}</Text>
                  )}
                </View>
                
                {cat.id === "NEGOCIA" && (
                  <TouchableOpacity 
                    style={styles.negociarBtn}
                    onPress={handleNegociar}
                  >
                    <Text style={styles.negociarBtnText}>Negociar valor →</Text>
                  </TouchableOpacity>
                )}
                
                <View style={styles.selecaoContainer}>
                  <View style={[
                    styles.selecaoBolinha,
                    selecionada && { 
                      borderColor: cat.cor,
                      backgroundColor: cat.cor,
                    }
                  ]}>
                    {selecionada && (
                      <View style={styles.selecaoInterno}>
                        <View style={styles.selecaoPonto} />
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={styles.pagamentoResumoCard}>
          <View style={styles.pagamentoResumoLeft}>
            <Text style={styles.pagamentoResumoLabel}>Pagamento</Text>
            <TouchableOpacity 
              style={styles.pagamentoResumoButton} 
              onPress={abrirFormasPagamento}
              activeOpacity={0.7}
            >
              <View style={styles.pagamentoResumoValorContainer}>
                {pagamentoInfo.tipo === "PIX" ? (
                  <Text style={[styles.pagamentoResumoEmoji, styles.pixLogo]}>❖</Text>
                ) : (
                  <Text style={styles.pagamentoResumoEmoji}>{pagamentoInfo.logo}</Text>
                )}
                {pagamentoInfo.tipo === "PIX" ? (
                  <Text style={[styles.pagamentoResumoTexto, styles.pixTexto]}> {getPagamentoDisplay()}</Text>
                ) : (
                  <Text style={styles.pagamentoResumoTexto}> {getPagamentoDisplay()}</Text>
                )}
              </View>
              <View style={styles.pagamentoResumoRight}>
                <Text style={styles.pagamentoResumoTrocar}>Trocar</Text>
                <Text style={styles.pagamentoResumoSeta}>›</Text>
              </View>
            </TouchableOpacity>
          </View>
          <Text style={styles.pagamentoResumoTotal}>{valorExibido()}</Text>
        </View>

        {(!(pagamentoInfo.tipo === "COPARTICIPACAO") || podeMostrarCoparticipacao) && (
          <TouchableOpacity style={styles.finalizarBtn} onPress={handleFinalizar}>
            <Text style={styles.finalizarBtnText}>
              {pagamentoInfo.tipo === "PIX" && `Pagar com PIX • ${valorExibido()}`}
              {pagamentoInfo.tipo === "COPARTICIPACAO" && podeMostrarCoparticipacao && `Confirmar Coparticipação • ${valorExibido()}`}
              {pagamentoInfo.tipo === "CARTAO" && `Pagar com Cartão • ${valorExibido()}`}
            </Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E8ECF0",
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  backText: { fontSize: 24, color: theme.colors.primary },
  headerCenter: { alignItems: "center" },
  headerEspecialidade: { fontSize: 18, fontWeight: "700", color: "#1A1A1A" },
  headerSubtitulo: { fontSize: 12, color: "#888", marginTop: 2 },
  scrollView: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },

  atendimentoCard: { 
    backgroundColor: "#1A1A1A", 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  atendimentoLabel: { fontSize: 12, fontWeight: "600", color: "#888", marginBottom: 12, letterSpacing: 0.5 },
  atendimentoRow: { flexDirection: "row", gap: 12 },
  atendimentoOpcao: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 12, backgroundColor: "#2A2A2A" },
  atendimentoOpcaoAtivo: { backgroundColor: theme.colors.primary },
  atendimentoTexto: { fontSize: 14, fontWeight: "500", color: "#AAA" },
  atendimentoTextoAtivo: { color: "#FFF" },

  pacienteCard: { backgroundColor: "#FFF", borderRadius: 16, padding: 16, marginBottom: 16, gap: 12 },
  input: { backgroundColor: "#F5F5F5", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, color: "#1A1A1A" },

  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#1A1A1A", marginBottom: 12, marginTop: 8 },

  categoriaCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  categoriaLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  categoriaIconeBox: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  categoriaIcone: { fontSize: 22 },
  categoriaInfo: { flex: 1 },
  categoriaHeader: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  categoriaNome: { fontSize: 15, fontWeight: "600", color: "#1A1A1A" },
  urgenciaBadge: { backgroundColor: "#FF444415", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  urgenciaBadgeText: { fontSize: 9, fontWeight: "600", color: "#FF4444" },
  categoriaDesc: { fontSize: 11, color: "#888", marginTop: 2 },
  categoriaRight: { alignItems: "flex-end", gap: 4 },
  precosContainer: { alignItems: "flex-end" },
  precoOriginal: { fontSize: 10, color: "#AAA", textDecorationLine: "line-through" },
  categoriaPreco: { fontSize: 16, fontWeight: "700" },

  negociaPreview: { flexDirection: "row", alignItems: "center", gap: 8 },
  negociaPreviewBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#F0F0F0", alignItems: "center", justifyContent: "center" },
  negociaPreviewBtnText: { fontSize: 16, fontWeight: "600", color: theme.colors.primary },
  
  negociarBtn: { marginTop: 6 },
  negociarBtnText: { fontSize: 11, color: "#AF52DE", fontWeight: "600" },
  
  selecaoContainer: { marginTop: 4 },
  selecaoBolinha: { 
    width: 22, 
    height: 22, 
    borderRadius: 11, 
    borderWidth: 2, 
    borderColor: "#D1D5DB", 
    backgroundColor: "#FFF", 
    alignItems: "center", 
    justifyContent: "center" 
  },
  selecaoInterno: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#FFF", alignItems: "center", justifyContent: "center" },
  selecaoPonto: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#FFF" },

  pagamentoResumoCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E8ECF0",
  },
  pagamentoResumoLeft: { flex: 1 },
  pagamentoResumoLabel: { fontSize: 12, color: "#888", marginBottom: 4 },
  pagamentoResumoButton: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between",
    width: "100%",
  },
  pagamentoResumoValorContainer: { flexDirection: "row", alignItems: "center" },
  pagamentoResumoEmoji: { fontSize: 22, fontWeight: "600", color: "#1A1A1A" },
  pagamentoResumoTexto: { fontSize: 16, fontWeight: "600", color: "#1A1A1A" },
  pagamentoResumoRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  pagamentoResumoTrocar: {
    fontSize: 12,
    color: "#888",
    fontWeight: "500",
  },
  pagamentoResumoSeta: { fontSize: 20, color: "#CCC", marginLeft: 8 },
  pagamentoResumoTotal: { fontSize: 18, fontWeight: "700", color: theme.colors.primary },

  pixLogo: {
    fontSize: 24,
    color: "#32BCAD",
    fontWeight: "700",
  },
  pixTexto: {
    fontSize: 17,
    color: "#32BCAD",
    fontWeight: "700",
  },

  finalizarBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  finalizarBtnText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
});