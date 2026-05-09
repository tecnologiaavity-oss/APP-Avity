import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "../theme";

// Função para detectar bandeira do cartão
const detectarBandeira = (numero) => {
  const clean = numero.replace(/\s/g, "");
  
  // Visa: começa com 4
  if (clean.startsWith("4")) return { nome: "VISA", icone: "💳", cor: "#1A1F71" };
  // Mastercard: começa com 51-55 ou 2221-2720
  if (/^5[1-5]/.test(clean) || /^2[2-7][0-9]{2}/.test(clean)) return { nome: "MASTERCARD", icone: "💳", cor: "#EB001B" };
  // Elo: começa com 4011, 4312, 4389, 4514, 4576, 5044, 5067, 5090, 6277, 6362, 6363, 6504-6509
  if (/^(4011|4312|4389|4514|4576|5044|5067|5090|6277|6362|6363|650[4-9])/.test(clean)) return { nome: "ELO", icone: "💳", cor: "#1E90FF" };
  // American Express: começa com 34 ou 37
  if (/^3[47]/.test(clean)) return { nome: "AMEX", icone: "💳", cor: "#2E77B0" };
  // Hipercard: começa com 6062
  if (clean.startsWith("6062")) return { nome: "HIPERCARD", icone: "💳", cor: "#B31B1B" };
  // Desconhecido
  return { nome: "CARTAO", icone: "💳", cor: "#666" };
};

// Função para validar cartão (Luhn algorithm)
const validarLuhn = (numero) => {
  const clean = numero.replace(/\s/g, "");
  let sum = 0;
  let shouldDouble = false;
  for (let i = clean.length - 1; i >= 0; i--) {
    let digit = parseInt(clean.charAt(i));
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0 && clean.length >= 13 && clean.length <= 19;
};

export default function EscolherPagamentoScreen({ route, navigation }) {
  const { valor, descricao, paciente, podeMostrarCoparticipacao, onPagamentoSelecionado, currentPagamento } = route.params || {};
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState(currentPagamento || "PIX");
  const [modalCartao, setModalCartao] = useState(false);
  const [modalEmpresa, setModalEmpresa] = useState(false);
  const [empresaId, setEmpresaId] = useState("");
  const [funcionarioCpf, setFuncionarioCpf] = useState("");
  const [cartoes, setCartoes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [novoCartao, setNovoCartao] = useState({
    numero: "",
    nome: "",
    validade: "",
    cvv: "",
  });
  
  const [bandeira, setBandeira] = useState(null);

  useEffect(() => {
    carregarCartoes();
  }, []);

  useEffect(() => {
    if (novoCartao.numero.length >= 6) {
      setBandeira(detectarBandeira(novoCartao.numero));
    } else {
      setBandeira(null);
    }
  }, [novoCartao.numero]);

  const carregarCartoes = async () => {
    try {
      const cartoesSalvos = await AsyncStorage.getItem("@Avity:cartoes");
      if (cartoesSalvos) {
        setCartoes(JSON.parse(cartoesSalvos));
      }
    } catch (error) {
      console.log("Erro ao carregar cartões:", error);
    }
  };

  const salvarCartoes = async (novosCartoes) => {
    try {
      await AsyncStorage.setItem("@Avity:cartoes", JSON.stringify(novosCartoes));
      setCartoes(novosCartoes);
    } catch (error) {
      console.log("Erro ao salvar cartões:", error);
    }
  };

  const formatarNumeroCartao = (text) => {
    let limpo = text.replace(/\D/g, "");
    let formatado = "";
    for (let i = 0; i < limpo.length; i++) {
      if (i > 0 && i % 4 === 0) formatado += " ";
      formatado += limpo[i];
    }
    return formatado;
  };

  const formatarValidade = (text) => {
    let limpo = text.replace(/\D/g, "");
    if (limpo.length >= 2) {
      let mes = parseInt(limpo.slice(0, 2));
      if (mes > 12) mes = 12;
      limpo = (mes < 10 ? "0" + mes : mes.toString()) + limpo.slice(2);
    }
    if (limpo.length >= 3) return `${limpo.slice(0, 2)}/${limpo.slice(2, 4)}`;
    return limpo;
  };

  const validarDataValidade = (validade) => {
    if (!validade || validade.length !== 5) return false;
    const mes = parseInt(validade.slice(0, 2));
    const ano = parseInt(validade.slice(3, 5));
    const dataAtual = new Date();
    const anoAtual = dataAtual.getFullYear() % 100;
    const mesAtual = dataAtual.getMonth() + 1;
    return (ano > anoAtual) || (ano === anoAtual && mes >= mesAtual);
  };

  const adicionarCartao = () => {
    const numeroLimpo = novoCartao.numero.replace(/\s/g, "");
    
    // Validações
    if (numeroLimpo.length < 13 || numeroLimpo.length > 19) {
      Alert.alert("Cartão inválido", "Número de cartão inválido.");
      return;
    }
    
    if (!validarLuhn(numeroLimpo)) {
      Alert.alert("Cartão inválido", "Número de cartão inválido. Verifique os dígitos.");
      return;
    }
    
    if (!novoCartao.nome.trim()) {
      Alert.alert("Atenção", "Digite o nome do titular do cartão.");
      return;
    }
    
    if (!novoCartao.validade || novoCartao.validade.length !== 5) {
      Alert.alert("Validade inválida", "Digite a validade no formato MM/AA.");
      return;
    }
    
    if (!validarDataValidade(novoCartao.validade)) {
      Alert.alert("Validade inválida", "Cartão vencido ou data inválida.");
      return;
    }
    
    if (!novoCartao.cvv || novoCartao.cvv.length < 3) {
      Alert.alert("CVV inválido", "Digite o CVV do cartão (3 ou 4 dígitos).");
      return;
    }

    const ultimosDigitos = numeroLimpo.slice(-4);
    const bandeiraInfo = bandeira || { nome: "CARTAO", icone: "💳", cor: "#666" };
    
    const novoCartaoObj = {
      id: Date.now().toString(),
      nome: bandeiraInfo.nome,
      final: ultimosDigitos,
      bandeira: bandeiraInfo.icone,
      bandeiraNome: bandeiraInfo.nome,
      validade: novoCartao.validade,
      titular: novoCartao.nome.toUpperCase(),
      numeroMascarado: `•••• •••• •••• ${ultimosDigitos}`,
    };

    const novosCartoes = [...cartoes, novoCartaoObj];
    salvarCartoes(novosCartoes);
    setModalCartao(false);
    setNovoCartao({ numero: "", nome: "", validade: "", cvv: "" });
    setBandeira(null);
    Alert.alert("Sucesso", "Cartão adicionado com sucesso!");
  };

  const removerCartao = (id) => {
    Alert.alert(
      "Remover cartão",
      "Deseja realmente remover este cartão?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Remover", 
          style: "destructive",
          onPress: () => {
            const novosCartoes = cartoes.filter(c => c.id !== id);
            salvarCartoes(novosCartoes);
          }
        }
      ]
    );
  };

  const handleSelecionarPagamento = (pagamento, dados = null) => {
    setPagamentoSelecionado(pagamento);
    if (onPagamentoSelecionado) {
      onPagamentoSelecionado(pagamento, dados);
    }
    navigation.goBack();
  };

  const validarEmpresa = () => {
    const cpfLimpo = funcionarioCpf.replace(/\D/g, "");
    if (empresaId.length < 4) {
      Alert.alert("ID inválido", "Verifique o ID da empresa.");
      return;
    }
    if (cpfLimpo.length !== 11) {
      Alert.alert("CPF inválido", "Digite um CPF válido.");
      return;
    }
    
    setModalEmpresa(false);
    setPagamentoSelecionado("COPARTICIPACAO");
    if (onPagamentoSelecionado) {
      onPagamentoSelecionado("COPARTICIPACAO");
    }
    Alert.alert(
      "✅ Coparticipação ativada",
      `Empresa: ${empresaId}\n\nSomente funcionários autorizados podem utilizar este benefício.`
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PAGUE COM</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.sectionTitle}>FORMAS DE PAGAMENTO</Text>

        {/* PIX com cores oficiais (Azul Turquesa/Ciano) */}
        <TouchableOpacity 
          style={[styles.pagamentoOption, pagamentoSelecionado === "PIX" && styles.pagamentoOptionSelectedPix]}
          onPress={() => handleSelecionarPagamento("PIX")}
        >
          <View style={styles.pagamentoLeft}>
            <View style={[styles.iconContainer, { backgroundColor: "#32BCAD10" }]}>
              <Text style={[styles.pagamentoIconePix, { color: "#32BCAD" }]}>❖</Text>
            </View>
            <View>
              <Text style={styles.pagamentoNome}>PIX</Text>
              <Text style={styles.pagamentoSub}>Pagamento imediato via Pix</Text>
            </View>
          </View>
          {pagamentoSelecionado === "PIX" && (
            <View style={[styles.checkCircle, { backgroundColor: "#32BCAD" }]}>
              <Text style={styles.pagamentoCheckPix}>✓</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Cartões salvos */}
        {cartoes.length > 0 && (
          <>
            <Text style={styles.subsectionTitle}>CARTÕES SALVOS</Text>
            {cartoes.map((cartao) => (
              <TouchableOpacity 
                key={cartao.id}
                style={[styles.cartaoOption, pagamentoSelecionado === cartao.id && styles.pagamentoOptionSelected]}
                onPress={() => handleSelecionarPagamento(cartao.id, cartao)}
                onLongPress={() => removerCartao(cartao.id)}
              >
                <View style={styles.pagamentoLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: "#2A2A2A" }]}>
                    <Text style={styles.pagamentoIcone}>{cartao.bandeira}</Text>
                  </View>
                  <View>
                    <Text style={styles.pagamentoNome}>{cartao.bandeiraNome} •••• {cartao.final}</Text>
                    <Text style={styles.pagamentoSub}>{cartao.titular} | {cartao.validade}</Text>
                  </View>
                </View>
                {pagamentoSelecionado === cartao.id && (
                  <View style={styles.checkCircle}>
                    <Text style={styles.pagamentoCheck}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Adicionar cartão */}
        <TouchableOpacity style={styles.addCardBtn} onPress={() => setModalCartao(true)}>
          <Text style={styles.addCardText}>+ ADICIONAR CARTAO DE CRÉDITO/DÉBITO</Text>
        </TouchableOpacity>

        {/* COPARTICIPAÇÃO - Só aparece se podeMostrarCoparticipacao for true */}
        {podeMostrarCoparticipacao && (
          <>
            <Text style={[styles.subsectionTitle, { marginTop: 16 }]}>EMPRESA</Text>
            <TouchableOpacity 
              style={[styles.coparticipacaoCard, pagamentoSelecionado === "COPARTICIPACAO" && styles.coparticipacaoCardSelected]}
              onPress={() => setModalEmpresa(true)}
            >
              <View style={styles.coparticipacaoHeader}>
                <View style={styles.iconContainer}>
                  <Text style={styles.coparticipacaoIcone}>🏛️</Text>
                </View>
                <View>
                  <Text style={styles.coparticipacaoTitulo}>COPARTICIPAÇÃO</Text>
                  <Text style={styles.coparticipacaoSub}>Sua empresa paga parte da consulta</Text>
                </View>
                {pagamentoSelecionado === "COPARTICIPACAO" && (
                  <View style={styles.checkCircle}>
                    <Text style={styles.pagamentoCheck}>✓</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </>
        )}

      </ScrollView>

      {/* MODAL ADICIONAR CARTÃO INTELIGENTE */}
      <Modal visible={modalCartao} animationType="slide" transparent>
        <View style={styles.modalOverlayDark}>
          <View style={styles.modalContainerDark}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitleDark}>ADICIONAR CARTÃO</Text>
              <TouchableOpacity onPress={() => setModalCartao(false)}>
                <Text style={styles.modalCloseDark}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bandeiraContainer}>
              <TextInput
                style={styles.modalInputDark}
                placeholder="Número do cartão"
                placeholderTextColor="#888"
                keyboardType="numeric"
                value={novoCartao.numero}
                onChangeText={(text) => setNovoCartao({ ...novoCartao, numero: formatarNumeroCartao(text) })}
                maxLength={23}
              />
              {bandeira && (
                <View style={[styles.bandeiraBadge, { backgroundColor: bandeira.cor + "20" }]}>
                  <Text style={[styles.bandeiraText, { color: bandeira.cor }]}>{bandeira.nome}</Text>
                </View>
              )}
            </View>

            <TextInput
              style={styles.modalInputDark}
              placeholder="Nome no cartão (como escrito)"
              placeholderTextColor="#888"
              value={novoCartao.nome}
              onChangeText={(text) => setNovoCartao({ ...novoCartao, nome: text.toUpperCase() })}
            />

            <View style={styles.modalRow}>
              <TextInput
                style={[styles.modalInputDark, { flex: 1, marginRight: 8 }]}
                placeholder="Validade (MM/AA)"
                placeholderTextColor="#888"
                value={novoCartao.validade}
                onChangeText={(text) => setNovoCartao({ ...novoCartao, validade: formatarValidade(text) })}
                maxLength={5}
              />
              <TextInput
                style={[styles.modalInputDark, { flex: 1, marginLeft: 8 }]}
                placeholder="CVV"
                placeholderTextColor="#888"
                keyboardType="numeric"
                secureTextEntry
                value={novoCartao.cvv}
                onChangeText={(text) => setNovoCartao({ ...novoCartao, cvv: text })}
                maxLength={4}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelDark} onPress={() => setModalCartao(false)}>
                <Text style={styles.modalCancelTextDark}>CANCELAR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmDark} onPress={adicionarCartao}>
                <Text style={styles.modalConfirmTextDark}>ADICIONAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL COPARTICIPAÇÃO */}
      <Modal visible={modalEmpresa} animationType="fade" transparent>
        <View style={styles.modalOverlayDark}>
          <View style={styles.modalContainerDark}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitleDark}>COPARTICIPAÇÃO</Text>
              <TouchableOpacity onPress={() => setModalEmpresa(false)}>
                <Text style={styles.modalCloseDark}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.avisoCard}>
              <Text style={styles.avisoTitle}>⚠️ AVISO IMPORTANTE</Text>
              <Text style={styles.avisoText}>
                Este benefício é válido APENAS para funcionários autorizados pelas empresas parceiras da Avity.
                O uso indevido poderá resultar em bloqueio da conta.
              </Text>
            </View>

            <TextInput
              style={styles.modalInputDark}
              placeholder="ID DA EMPRESA"
              placeholderTextColor="#888"
              value={empresaId}
              onChangeText={setEmpresaId}
            />

            <TextInput
              style={styles.modalInputDark}
              placeholder="CPF DO COLABORADOR"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={funcionarioCpf}
              onChangeText={(text) => setFuncionarioCpf(text.replace(/\D/g, ""))}
              maxLength={11}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelDark} onPress={() => setModalEmpresa(false)}>
                <Text style={styles.modalCancelTextDark}>CANCELAR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmDark} onPress={validarEmpresa}>
                <Text style={styles.modalConfirmTextDark}>ATIVAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1A1A1A" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#0D0D0D",
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  backText: { fontSize: 24, color: "#00A896" },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#FFF", letterSpacing: 1 },
  content: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 12, fontWeight: "600", color: "#888", marginBottom: 16, letterSpacing: 1 },
  subsectionTitle: { fontSize: 11, fontWeight: "600", color: "#666", marginBottom: 12, marginTop: 8, letterSpacing: 1 },

  pagamentoOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  pagamentoOptionSelected: {
    backgroundColor: "#00A89610",
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  pagamentoOptionSelectedPix: {
    backgroundColor: "#32BCAD10",
    marginHorizontal: -20,
    paddingHorizontal: 20,
    borderBottomColor: "#32BCAD30",
  },
  pagamentoLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  iconContainer: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#2A2A2A", alignItems: "center", justifyContent: "center" },
  pagamentoIcone: { fontSize: 22 },
  pagamentoIconePix: { fontSize: 22, fontWeight: "600" },
  pagamentoNome: { fontSize: 15, fontWeight: "600", color: "#FFF" },
  pagamentoSub: { fontSize: 12, color: "#888", marginTop: 2 },
  pagamentoCheck: { fontSize: 16, color: "#00A896", fontWeight: "700" },
  pagamentoCheckPix: { fontSize: 16, color: "#FFF", fontWeight: "700" },

  cartaoOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  checkCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#00A896", alignItems: "center", justifyContent: "center" },

  addCardBtn: {
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  addCardText: { fontSize: 13, color: "#00A896", fontWeight: "600", letterSpacing: 1 },

  coparticipacaoCard: {
    backgroundColor: "#2A2A2A",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#3A3A3A",
  },
  coparticipacaoCardSelected: {
    borderColor: "#00A896",
    backgroundColor: "#00A89610",
  },
  coparticipacaoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  coparticipacaoIcone: { fontSize: 24 },
  coparticipacaoTitulo: { fontSize: 14, fontWeight: "700", color: "#FFF", letterSpacing: 0.5 },
  coparticipacaoSub: { fontSize: 11, color: "#888", marginTop: 2 },

  // Modais
  modalOverlayDark: { flex: 1, backgroundColor: "rgba(0,0,0,0.95)", justifyContent: "center", alignItems: "center" },
  modalContainerDark: { backgroundColor: "#1A1A1A", borderRadius: 24, padding: 24, width: "90%", borderWidth: 1, borderColor: "#2A2A2A" },
  modalTitleDark: { fontSize: 16, fontWeight: "700", color: "#FFF", letterSpacing: 1 },
  modalCloseDark: { fontSize: 22, color: "#888" },
  modalInputDark: { backgroundColor: "#2A2A2A", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, color: "#FFF", marginBottom: 12, borderWidth: 1, borderColor: "#3A3A3A" },
  modalRow: { flexDirection: "row", gap: 12 },
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 16 },
  modalCancelDark: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: "#3A3A3A", alignItems: "center" },
  modalCancelTextDark: { fontSize: 13, color: "#888", fontWeight: "600", letterSpacing: 0.5 },
  modalConfirmDark: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: "#00A896", alignItems: "center" },
  modalConfirmTextDark: { fontSize: 13, color: "#FFF", fontWeight: "600", letterSpacing: 0.5 },

  bandeiraContainer: { position: "relative", marginBottom: 12 },
  bandeiraBadge: { position: "absolute", right: 16, top: 14, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  bandeiraText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },

  avisoCard: {
    backgroundColor: "#2A1A1A",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FF444430",
  },
  avisoTitle: { fontSize: 11, fontWeight: "700", color: "#FF4444", marginBottom: 6, letterSpacing: 0.5 },
  avisoText: { fontSize: 11, color: "#AAA", lineHeight: 16 },
});