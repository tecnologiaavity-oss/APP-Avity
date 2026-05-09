import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Modal,
  Platform,
  Dimensions,
} from "react-native";
import { theme } from "../theme";
import { usePayment } from "../context/PaymentContext";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function PagamentoCartaoLifeScreen({ route, navigation }) {
  const { valor, descricao, plano, academia, tipo, creditos, cartaoSalvo } = route.params || {};
  const { cartoes, adicionarCartao } = usePayment();
  
  const [loading, setLoading] = useState(false);
  const [pagamentoConfirmado, setPagamentoConfirmado] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Estado para novo cartão (caso não haja cartão salvo ou queira adicionar outro)
  const [novoCartao, setNovoCartao] = useState({
    numero: "",
    nome: "",
    validade: "",
    cvv: "",
  });
  const [bandeira, setBandeira] = useState(null);
  const [usandoCartaoSalvo, setUsandoCartaoSalvo] = useState(!!cartaoSalvo);
  const [cartaoSelecionado, setCartaoSelecionado] = useState(cartaoSalvo || null);

  // Detectar bandeira
  useEffect(() => {
    if (novoCartao.numero.length >= 6) {
      const bandeiraInfo = detectarBandeira(novoCartao.numero);
      setBandeira(bandeiraInfo);
    } else {
      setBandeira(null);
    }
  }, [novoCartao.numero]);

  const detectarBandeira = (numero) => {
    const clean = numero.replace(/\s/g, "");
    if (clean.startsWith("4")) return { nome: "VISA", icone: "💳", cor: "#1A1F71" };
    if (/^5[1-5]/.test(clean) || /^2[2-7][0-9]{2}/.test(clean))
      return { nome: "MASTERCARD", icone: "💳", cor: "#EB001B" };
    if (/^(4011|4312|4389|4514|4576|5044|5067|5090|6277|6362|6363|650[4-9])/.test(clean))
      return { nome: "ELO", icone: "💳", cor: "#1E90FF" };
    if (/^3[47]/.test(clean)) return { nome: "AMEX", icone: "💳", cor: "#2E77B0" };
    return { nome: "CARTAO", icone: "💳", cor: "#666" };
  };

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

  const handleNumeroChange = (text) => {
    setNovoCartao(prev => ({ ...prev, numero: formatarNumeroCartao(text) }));
  };

  const handleValidadeChange = (text) => {
    setNovoCartao(prev => ({ ...prev, validade: formatarValidade(text) }));
  };

  const handleNomeChange = (text) => {
    setNovoCartao(prev => ({ ...prev, nome: text.toUpperCase() }));
  };

  const handleCvvChange = (text) => {
    setNovoCartao(prev => ({ ...prev, cvv: text }));
  };

  const mostrarErro = (titulo, mensagem) => {
    setErrorMessage(`${titulo}\n\n${mensagem}`);
    setShowErrorModal(true);
  };

  const validarCartao = () => {
    const numeroLimpo = novoCartao.numero.replace(/\s/g, "");
    if (numeroLimpo.length < 13 || numeroLimpo.length > 19) {
      mostrarErro("Cartão inválido", "Número de cartão inválido.");
      return false;
    }
    if (!validarLuhn(numeroLimpo)) {
      mostrarErro("Cartão inválido", "Número de cartão inválido. Verifique os dígitos.");
      return false;
    }
    if (!novoCartao.nome.trim()) {
      mostrarErro("Atenção", "Digite o nome do titular do cartão.");
      return false;
    }
    if (!novoCartao.validade || novoCartao.validade.length !== 5) {
      mostrarErro("Validade inválida", "Digite a validade no formato MM/AA.");
      return false;
    }
    if (!novoCartao.cvv || novoCartao.cvv.length < 3) {
      mostrarErro("CVV inválido", "Digite o CVV do cartão (3 ou 4 dígitos).");
      return false;
    }
    return true;
  };

  const processarPagamento = () => {
    if (!usandoCartaoSalvo && !validarCartao()) {
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPagamentoConfirmado(true);
      setTimeout(() => {
        navigation.replace("UserPanel", {
          plano: plano,
          academia: academia,
        });
      }, 1500);
    }, 2000);
  };

  const handleCancelar = () => {
    setShowCancelModal(false);
    navigation.goBack();
  };

  const handleContinuar = () => {
    setShowCancelModal(false);
  };

  const ModalErro = () => (
    <Modal visible={showErrorModal} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalErrorContainer}>
          <Ionicons name="alert-circle" size={48} color="#F44336" />
          <Text style={styles.modalErrorTitle}>Ops!</Text>
          <Text style={styles.modalErrorMessage}>{errorMessage}</Text>
          <TouchableOpacity
            style={styles.modalErrorButton}
            onPress={() => setShowErrorModal(false)}
          >
            <Text style={styles.modalErrorButtonText}>Entendi</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const ModalCancelamento = () => (
    <Modal visible={showCancelModal} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCancelContainer}>
          <Ionicons name="alert-circle" size={48} color="#FF9800" />
          <Text style={styles.modalCancelTitle}>Cancelar pagamento</Text>
          <Text style={styles.modalCancelMessage}>Deseja realmente cancelar o pagamento?</Text>
          <View style={styles.modalCancelButtons}>
            <TouchableOpacity style={styles.modalCancelButton} onPress={handleContinuar}>
              <Text style={styles.modalCancelButtonText}>Continuar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalConfirmarCancel} onPress={handleCancelar}>
              <Text style={styles.modalConfirmarCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (pagamentoConfirmado) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Pagamento confirmado!</Text>
        <Text style={styles.loadingSub}>Redirecionando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowCancelModal(true)} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#005C4A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pagamento com Cartão</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Card de informações do cartão */}
        <View style={styles.cardInfo}>
          <Ionicons name="card-outline" size={40} color="#005C4A" />
          <Text style={styles.cardTitle}>Cartão de Crédito/Débito</Text>
          {usandoCartaoSalvo && cartaoSelecionado && (
            <Text style={styles.cardDetails}>
              {cartaoSelecionado.bandeiraNome || "Cartão"} •••• {cartaoSelecionado.final}
            </Text>
          )}
        </View>

        {/* Resumo do valor */}
        <View style={styles.valorCard}>
          <Text style={styles.valorTitle}>
            {tipo === "creditos" ? "COMPRA DE CRÉDITOS" : "ASSINATURA"}
          </Text>
          <Text style={styles.valorAmount}>R$ {valor?.toFixed(2)}</Text>
          <Text style={styles.valorDesc}>{descricao}</Text>
        </View>

        {/* Formulário do cartão (se não usar cartão salvo) */}
        {!usandoCartaoSalvo && (
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Número do cartão</Text>
              <TextInput
                style={styles.input}
                placeholder="0000 0000 0000 0000"
                keyboardType="numeric"
                value={novoCartao.numero}
                onChangeText={handleNumeroChange}
                maxLength={23}
              />
              {bandeira && (
                <View style={[styles.bandeiraBadge, { backgroundColor: bandeira.cor + "20" }]}>
                  <Text style={[styles.bandeiraText, { color: bandeira.cor }]}>{bandeira.nome}</Text>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nome no cartão</Text>
              <TextInput
                style={styles.input}
                placeholder="Como está no cartão"
                value={novoCartao.nome}
                onChangeText={handleNomeChange}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>Validade (MM/AA)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/AA"
                  value={novoCartao.validade}
                  onChangeText={handleValidadeChange}
                  maxLength={5}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  keyboardType="numeric"
                  secureTextEntry
                  value={novoCartao.cvv}
                  onChangeText={handleCvvChange}
                  maxLength={4}
                />
              </View>
            </View>
          </View>
        )}

        {/* Botão de pagamento */}
        <TouchableOpacity
          style={styles.pagarButton}
          onPress={processarPagamento}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={styles.pagarButtonText}>Pagar R$ {valor?.toFixed(2)}</Text>
          )}
        </TouchableOpacity>

        {/* Área de segurança */}
        <View style={styles.segurancaCard}>
          <Ionicons name="shield-checkmark" size={24} color="#005C4A" />
          <View style={styles.segurancaTextContainer}>
            <Text style={styles.segurancaTitle}>Pagamento seguro</Text>
            <Text style={styles.segurancaText}>
              Seus dados são criptografados e protegidos
            </Text>
          </View>
        </View>
      </ScrollView>

      <ModalCancelamento />
      <ModalErro />
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
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#1A1A1A" },
  content: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 40 },

  cardInfo: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E8ECF0",
  },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#1A1A1A", marginTop: 8 },
  cardDetails: { fontSize: 14, color: "#888", marginTop: 4 },

  valorCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    alignItems: "center",
  },
  valorTitle: { fontSize: 12, color: "#FFFFFFB3", marginBottom: 4, letterSpacing: 1 },
  valorAmount: { fontSize: 36, fontWeight: "700", color: "#FFF" },
  valorDesc: { fontSize: 14, color: "#FFF", marginTop: 8, opacity: 0.9 },

  formContainer: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E8ECF0",
  },
  inputGroup: { marginBottom: 16, position: "relative" },
  inputLabel: { fontSize: 13, color: "#666", marginBottom: 6, fontWeight: "500" },
  input: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#E8ECF0",
  },
  row: { flexDirection: "row", gap: 12 },
  bandeiraBadge: {
    position: "absolute",
    right: 16,
    top: 36,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  bandeiraText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },

  pagarButton: {
    backgroundColor: "#005C4A",
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  pagarButtonText: { color: "#FFF", fontSize: 16, fontWeight: "600" },

  segurancaCard: {
    flexDirection: "row",
    backgroundColor: "#E8F5E9",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    alignItems: "center",
  },
  segurancaTextContainer: { flex: 1 },
  segurancaTitle: { fontSize: 14, fontWeight: "600", color: "#005C4A", marginBottom: 4 },
  segurancaText: { fontSize: 12, color: "#374151", lineHeight: 18 },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: { marginTop: 16, fontSize: 16, fontWeight: "600", color: "#1A1A1A" },
  loadingSub: { marginTop: 8, fontSize: 12, color: "#888" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalCancelContainer: {
    backgroundColor: "#FFF",
    borderRadius: 28,
    padding: 24,
    width: width * 0.85,
    alignItems: "center",
  },
  modalCancelTitle: { fontSize: 20, fontWeight: "700", color: "#1A1A1A", marginBottom: 12 },
  modalCancelMessage: { fontSize: 14, color: "#666", textAlign: "center", marginBottom: 24 },
  modalCancelButtons: { width: "100%", gap: 12 },
  modalCancelButton: {
    backgroundColor: "#005C4A",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
  },
  modalCancelButtonText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
  modalConfirmarCancel: {
    backgroundColor: "#FFF",
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#F44336",
    alignItems: "center",
  },
  modalConfirmarCancelText: { color: "#F44336", fontSize: 16, fontWeight: "600" },

  // Estilos para o modal de erro
  modalErrorContainer: {
    backgroundColor: "#FFF",
    borderRadius: 28,
    padding: 24,
    width: width * 0.85,
    alignItems: "center",
  },
  modalErrorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginTop: 12,
    marginBottom: 8,
  },
  modalErrorMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  modalErrorButton: {
    backgroundColor: "#F44336",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: "center",
  },
  modalErrorButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});