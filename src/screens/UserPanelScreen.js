import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Share,
  Switch,
  TextInput,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import QRCode from "react-native-qrcode-svg";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { usePayment } from "../context/PaymentContext";

const { width } = Dimensions.get("window");

export default function UserPanelScreen({ route, navigation }) {
  const { plano, academia } = route.params || {};
  const { cartoes, adicionarCartao } = usePayment();

  const [userData, setUserData] = useState({
    id: "AVT-23841",
    nome: "Pedro Henrique Souza Brito",
    cpf: "123.456.789-00",
    email: "pedro.souza@email.com",
    telefone: "(11) 98765-4321",
    plano: plano || { id: "basic", nome: "Basic", preco: 69.9, creditos: 13 },
    academia: academia || {
      id: "2",
      name: "Bluefit",
      address: "Rua XV de Novembro, 500 - Centro",
      hours: "06:00 - 23:00",
      planoMinimo: "Basic",
      precoMinimo: 69.90,
      planosPermitidos: ["starter", "basic", "silver", "gold", "premium"],
    },
    creditos: 13,
    dataInicioAssinatura: new Date("2025-05-02").toISOString(),
    dataFimAssinatura: new Date("2026-06-02").toISOString(),
    ultimoCheckin: null,
    checkinsRealizados: [],
    pagamentoAutomatico: true,
    cartaoCredito: "**** **** **** 4832",
    validadeCartao: "12/2028",
  });

  const [modalCheckin, setModalCheckin] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalComprarCreditos, setModalComprarCreditos] = useState(false);
  const [modalPagamento, setModalPagamento] = useState(false);
  const [checkinCode, setCheckinCode] = useState("");
  const [checkinData, setCheckinData] = useState(null);
  const [diasAteVencimento, setDiasAteVencimento] = useState(0);
  const [podeAlterar, setPodeAlterar] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [showQRCode, setShowQRCode] = useState(false);
  const [creditosCompra, setCreditosCompra] = useState(5);
  const [novoCartao, setNovoCartao] = useState({ numero: "", nome: "", validade: "", cvv: "" });
  const [bandeira, setBandeira] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  const precosCreditos = { 5: 29.90, 10: 49.90, 20: 89.90 };

  useEffect(() => {
    carregarDados();
    calcularDias();
  }, []);

  useEffect(() => {
    if (novoCartao.numero.length >= 6) {
      setBandeira(detectarBandeira(novoCartao.numero));
    } else {
      setBandeira(null);
    }
  }, [novoCartao.numero]);

  const detectarBandeira = (numero) => {
    const clean = numero.replace(/\s/g, "");
    if (clean.startsWith("4")) return { nome: "VISA", icone: "💳", cor: "#1A1F71" };
    if (/^5[1-5]/.test(clean) || /^2[2-7][0-9]{2}/.test(clean)) return { nome: "MASTERCARD", icone: "💳", cor: "#EB001B" };
    if (/^(4011|4312|4389|4514|4576|5044|5067|5090|6277|6362|6363|650[4-9])/.test(clean)) return { nome: "ELO", icone: "💳", cor: "#1E90FF" };
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

  // NOTIFICAÇÃO PERSONALIZADA BONITA
  const showCustomAlert = (title, message, type = "warning") => {
    const colors = {
      warning: { bg: "#FFF8E1", border: "#FFB300", icon: "⚠️" },
      error: { bg: "#FFEBEE", border: "#F44336", icon: "❌" },
      success: { bg: "#E8F5E9", border: "#4CAF50", icon: "✅" },
      info: { bg: "#E3F2FD", border: "#2196F3", icon: "ℹ️" },
    };
    
    Alert.alert(
      title,
      message,
      [{ text: "OK", style: "default" }],
      { cancelable: true }
    );
  };

  const mostrarNotificacao = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setModalSuccess(false));
  };

  const carregarDados = async () => {
    try {
      const savedData = await AsyncStorage.getItem("@AvityLife:userData");
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setUserData(prev => ({ ...prev, ...parsedData }));
      }
    } catch (error) {
      console.log("Erro ao carregar dados:", error);
    }
  };

  const salvarDados = async (novosDados) => {
    try {
      await AsyncStorage.setItem("@AvityLife:userData", JSON.stringify(novosDados));
      setUserData(novosDados);
    } catch (error) {
      console.log("Erro ao salvar dados:", error);
    }
  };

  const calcularDias = () => {
    try {
      const hoje = new Date();
      const dataFim = new Date(userData.dataFimAssinatura);
      const diffVencimentoMs = dataFim - hoje;
      const diasVencimento = Math.ceil(diffVencimentoMs / (1000 * 60 * 60 * 24));
      setDiasAteVencimento(diasVencimento > 0 ? diasVencimento : 0);
      setPodeAlterar(diasVencimento <= 0);
    } catch (error) {
      console.log("Erro ao calcular dias:", error);
    }
  };

  const gerarCheckin = () => {
    const timestamp = Date.now();
    const academiaId = userData.academia?.id || "01";
    const codigo = `AVT-${academiaId}-${timestamp}-${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`;
    
    const novoCheckinData = {
      academia: userData.academia?.name,
      data: new Date().toLocaleString('pt-BR'),
      hora: new Date().toLocaleTimeString('pt-BR'),
      codigo: codigo,
    };
    
    setCheckinCode(codigo);
    setCheckinData(novoCheckinData);
    setShowQRCode(false);
    setModalCheckin(true);
  };

  const confirmarCheckin = () => {
    if (userData.creditos <= 0) {
      showCustomAlert(
        "💳 Créditos insuficientes",
        "Você não possui créditos disponíveis.\n\nAdquira créditos para continuar usando o Avity Life!",
        "warning"
      );
      setModalCheckin(false);
      setModalComprarCreditos(true);
      return;
    }

    const novoCheckin = {
      id: Date.now(),
      academia: userData.academia?.name || "Academia",
      data: new Date().toLocaleString('pt-BR'),
      codigo: checkinCode,
    };

    const novosCreditos = userData.creditos - 1;
    const novosCheckins = [novoCheckin, ...(userData.checkinsRealizados || [])];

    const novosDados = {
      ...userData,
      creditos: novosCreditos,
      ultimoCheckin: new Date().toISOString(),
      checkinsRealizados: novosCheckins,
    };

    salvarDados(novosDados);
    setModalCheckin(false);
    setModalSuccess(true);
    mostrarNotificacao();
  };

  // FUNÇÃO DE COMPRA DE CRÉDITOS COM MODAL BONITO
  const handleComprarCreditos = (metodoPagamento, cartao = null) => {
    const valor = precosCreditos[creditosCompra];
    setModalComprarCreditos(false);
    
    if (metodoPagamento === "PIX") {
      navigation.navigate("PagamentoPixLife", {
        valor: valor,
        descricao: `Compra de ${creditosCompra} créditos Avity Life`,
        tipo: "creditos",
        creditos: creditosCompra,
        plano: userData.plano,
        academia: userData.academia,
      });
    } else if (metodoPagamento === "CARTAO" && cartao) {
      navigation.navigate("PagamentoCartaoLife", {
        valor: valor,
        descricao: `Compra de ${creditosCompra} créditos Avity Life`,
        tipo: "creditos",
        creditos: creditosCompra,
        plano: userData.plano,
        academia: userData.academia,
        cartaoSalvo: cartao,
      });
    } else if (metodoPagamento === "NOVO_CARTAO") {
      setModalPagamento(true);
    }
  };

  const adicionarNovoCartaoEComprar = () => {
    const numeroLimpo = novoCartao.numero.replace(/\s/g, "");
    
    if (numeroLimpo.length < 13 || numeroLimpo.length > 19) {
      showCustomAlert("💳 Cartão inválido", "Número de cartão inválido. Verifique os dígitos.", "error");
      return;
    }
    
    if (!validarLuhn(numeroLimpo)) {
      showCustomAlert("💳 Cartão inválido", "Número de cartão inválido. Verifique os dígitos.", "error");
      return;
    }
    
    if (!novoCartao.nome.trim()) {
      showCustomAlert("⚠️ Atenção", "Digite o nome do titular do cartão.", "warning");
      return;
    }
    
    if (!novoCartao.validade || novoCartao.validade.length !== 5) {
      showCustomAlert("⚠️ Validade inválida", "Digite a validade no formato MM/AA.", "warning");
      return;
    }
    
    if (!novoCartao.cvv || novoCartao.cvv.length < 3) {
      showCustomAlert("⚠️ CVV inválido", "Digite o CVV do cartão (3 ou 4 dígitos).", "warning");
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
    
    adicionarCartao(novoCartaoObj);
    
    const valor = precosCreditos[creditosCompra];
    
    setModalPagamento(false);
    setNovoCartao({ numero: "", nome: "", validade: "", cvv: "" });
    setBandeira(null);
    
    navigation.navigate("PagamentoCartaoLife", {
      valor: valor,
      descricao: `Compra de ${creditosCompra} créditos Avity Life`,
      tipo: "creditos",
      creditos: creditosCompra,
      plano: userData.plano,
      academia: userData.academia,
      cartaoSalvo: novoCartaoObj,
    });
  };

  const handleAlterarPlano = () => {
    if (!podeAlterar) {
      showCustomAlert(
        "⏳ Alteração não disponível",
        `Você só poderá alterar seu plano após o término do período atual.\n\n📅 Faltam ${diasAteVencimento} dias para o fim do seu plano atual.`,
        "warning"
      );
      return;
    }
    navigation.navigate("PlanosAvity", { 
      academia: userData.academia,
      alterarPlano: true,
      planoAtual: userData.plano
    });
  };

  const handleAlterarAcademia = () => {
    if (!podeAlterar) {
      showCustomAlert(
        "⏳ Alteração não disponível",
        `Você só poderá alterar sua academia após o término do período atual.\n\n📅 Faltam ${diasAteVencimento} dias para o fim do seu plano atual.`,
        "warning"
      );
      return;
    }
    navigation.navigate("Academias", { 
      alterarAcademia: true,
      academiaAtual: userData.academia
    });
  };

  const handleAlterarPagamento = () => {
    setModalPagamento(true);
  };

  const handleShareCheckin = async () => {
    try {
      await Share.share({
        message: `✅ Check-in Avity Life\n\nAcademia: ${checkinData?.academia}\nCódigo: ${checkinCode}\nData: ${checkinData?.data} às ${checkinData?.hora}`,
      });
    } catch (error) {
      console.log("Erro ao compartilhar:", error);
    }
  };

  const getFirstName = () => {
    if (!userData.nome) return "Usuário";
    return userData.nome.split(' ')[0];
  };

  const formatarData = (dataISO) => {
    try {
      const data = new Date(dataISO);
      return data.toLocaleDateString('pt-BR');
    } catch {
      return "Data inválida";
    }
  };

  const NotificacaoSucesso = () => (
    <Modal visible={modalSuccess} animationType="fade" transparent>
      <View style={styles.successOverlay}>
        <Animated.View style={[styles.successContainer, { opacity: fadeAnim }]}>
          <View style={styles.successIconCircle}>
            <Ionicons name="checkmark" size={40} color="#FFF" />
          </View>
          <Text style={styles.successTitle}>Check-in Realizado!</Text>
          <Text style={styles.successMessage}>
            Você utilizou 1 crédito
          </Text>
          <Text style={styles.successSubMessage}>
            Restam {userData.creditos - 1} créditos
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );

  // MODAL DE COMPRA DE CRÉDITOS BONITO
  const ModalComprarCreditos = () => (
    <Modal visible={modalComprarCreditos} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalComprarContainer}>
          <View style={styles.modalComprarHeader}>
            <Text style={styles.modalComprarTitle}>💎 Comprar Créditos</Text>
            <TouchableOpacity onPress={() => setModalComprarCreditos(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Opções de créditos */}
          <View style={styles.creditosOpcoes}>
            {[5, 10, 20].map((qtde) => (
              <TouchableOpacity
                key={qtde}
                style={[
                  styles.creditoOpcao,
                  creditosCompra === qtde && styles.creditoOpcaoAtivo
                ]}
                onPress={() => setCreditosCompra(qtde)}
              >
                <Text style={styles.creditoQtde}>{qtde}</Text>
                <Text style={styles.creditoPreco}>
                  R$ {qtde === 5 ? "29,90" : qtde === 10 ? "49,90" : "89,90"}
                </Text>
                <Text style={styles.creditoPorCredito}>
                  R$ {(precosCreditos[qtde] / qtde).toFixed(2)}/crédito
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.dividerLine} />

          <Text style={styles.pagamentoOptionsTitle}>💳 Escolha a forma de pagamento</Text>

          {/* Opção PIX */}
          <TouchableOpacity 
            style={styles.pagamentoOptionCard}
            onPress={() => handleComprarCreditos("PIX")}
          >
            <View style={styles.pagamentoOptionIcon}>
              <MaterialCommunityIcons name="pix" size={28} color="#32BCAD" />
            </View>
            <View style={styles.pagamentoOptionInfo}>
              <Text style={styles.pagamentoOptionName}>PIX</Text>
              <Text style={styles.pagamentoOptionDesc}>Pagamento instantâneo com código</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

          {/* Cartões salvos */}
          {cartoes && cartoes.length > 0 && (
            <>
              {cartoes.map((cartao) => (
                <TouchableOpacity 
                  key={cartao.id}
                  style={styles.pagamentoOptionCard}
                  onPress={() => handleComprarCreditos("CARTAO", cartao)}
                >
                  <View style={styles.pagamentoOptionIcon}>
                    <Text style={{ fontSize: 28 }}>{cartao.bandeira || "💳"}</Text>
                  </View>
                  <View style={styles.pagamentoOptionInfo}>
                    <Text style={styles.pagamentoOptionName}>
                      {cartao.bandeiraNome || "Cartão"} •••• {cartao.final}
                    </Text>
                    <Text style={styles.pagamentoOptionDesc}>
                      {cartao.titular} | Válido até {cartao.validade}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#CCC" />
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* Adicionar novo cartão */}
          <TouchableOpacity 
            style={[styles.pagamentoOptionCard, styles.novoCartaoCard]}
            onPress={() => handleComprarCreditos("NOVO_CARTAO")}
          >
            <View style={[styles.pagamentoOptionIcon, styles.novoCartaoIcon]}>
              <Ionicons name="add-circle" size={28} color="#005C4A" />
            </View>
            <View style={styles.pagamentoOptionInfo}>
              <Text style={[styles.pagamentoOptionName, styles.novoCartaoText]}>
                Adicionar novo cartão
              </Text>
              <Text style={styles.pagamentoOptionDesc}>
                Cadastre um cartão de crédito ou débito
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Dentro do UserPanelScreen, substitua a ModalAlterarPagamento por esta versão otimizada:

const ModalAlterarPagamento = () => {
  // Usar estado local temporário para evitar re-renderizações do pai
  const [localNovoCartao, setLocalNovoCartao] = useState({ numero: "", nome: "", validade: "", cvv: "" });

  // Atualiza o estado local e sincroniza com o estado principal apenas no submit
  const handleNumeroChange = (text) => {
    setLocalNovoCartao(prev => ({ ...prev, numero: formatarNumeroCartao(text) }));
  };
  const handleNomeChange = (text) => {
    setLocalNovoCartao(prev => ({ ...prev, nome: text.toUpperCase() }));
  };
  const handleValidadeChange = (text) => {
    setLocalNovoCartao(prev => ({ ...prev, validade: formatarValidade(text) }));
  };
  const handleCvvChange = (text) => {
    setLocalNovoCartao(prev => ({ ...prev, cvv: text }));
  };

  // Efeito para detectar bandeira localmente
  const [localBandeira, setLocalBandeira] = useState(null);
  useEffect(() => {
    if (localNovoCartao.numero.length >= 6) {
      setLocalBandeira(detectarBandeira(localNovoCartao.numero));
    } else {
      setLocalBandeira(null);
    }
  }, [localNovoCartao.numero]);

  const adicionarCartaoLocal = () => {
    const numeroLimpo = localNovoCartao.numero.replace(/\s/g, "");
    if (numeroLimpo.length < 13 || numeroLimpo.length > 19) {
      Alert.alert("Cartão inválido", "Número de cartão inválido.");
      return;
    }
    if (!validarLuhn(numeroLimpo)) {
      Alert.alert("Cartão inválido", "Número de cartão inválido. Verifique os dígitos.");
      return;
    }
    if (!localNovoCartao.nome.trim()) {
      Alert.alert("Atenção", "Digite o nome do titular do cartão.");
      return;
    }
    if (!localNovoCartao.validade || localNovoCartao.validade.length !== 5) {
      Alert.alert("Validade inválida", "Digite a validade no formato MM/AA.");
      return;
    }
    if (!localNovoCartao.cvv || localNovoCartao.cvv.length < 3) {
      Alert.alert("CVV inválido", "Digite o CVV do cartão (3 ou 4 dígitos).");
      return;
    }

    const ultimosDigitos = numeroLimpo.slice(-4);
    const bandeiraInfo = localBandeira || { nome: "CARTAO", icone: "💳", cor: "#666" };
    const novoCartaoObj = {
      id: Date.now().toString(),
      nome: bandeiraInfo.nome,
      final: ultimosDigitos,
      bandeira: bandeiraInfo.icone,
      bandeiraNome: bandeiraInfo.nome,
      validade: localNovoCartao.validade,
      titular: localNovoCartao.nome.toUpperCase(),
      numeroMascarado: `•••• •••• •••• ${ultimosDigitos}`,
    };
    adicionarCartao(novoCartaoObj);
    
    const valor = precosCreditos[creditosCompra];
    setModalPagamento(false);
    // Limpar estados
    setLocalNovoCartao({ numero: "", nome: "", validade: "", cvv: "" });
    setNovoCartao({ numero: "", nome: "", validade: "", cvv: "" }); // sincroniza se necessário
    
    navigation.navigate("PagamentoCartaoLife", {
      valor: valor,
      descricao: `Compra de ${creditosCompra} créditos Avity Life`,
      tipo: "creditos",
      creditos: creditosCompra,
      plano: userData.plano,
      academia: userData.academia,
      cartaoSalvo: novoCartaoObj,
    });
  };

  return (
    <Modal visible={modalPagamento} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Adicionar Cartão</Text>
            <TouchableOpacity onPress={() => setModalPagamento(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.bandeiraContainer}>
            <TextInput
              style={styles.modalInput}
              placeholder="Número do cartão"
              keyboardType="numeric"
              value={localNovoCartao.numero}
              onChangeText={handleNumeroChange}
              maxLength={23}
              autoFocus={false}
            />
            {localBandeira && (
              <View style={[styles.bandeiraBadge, { backgroundColor: localBandeira.cor + "20" }]}>
                <Text style={[styles.bandeiraText, { color: localBandeira.cor }]}>{localBandeira.nome}</Text>
              </View>
            )}
          </View>

          <TextInput
            style={styles.modalInput}
            placeholder="Nome no cartão (como escrito)"
            value={localNovoCartao.nome}
            onChangeText={handleNomeChange}
            autoCapitalize="characters"
          />

          <View style={styles.modalRow}>
            <TextInput
              style={[styles.modalInput, { flex: 1, marginRight: 8 }]}
              placeholder="Validade (MM/AA)"
              value={localNovoCartao.validade}
              onChangeText={handleValidadeChange}
              maxLength={5}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.modalInput, { flex: 1, marginLeft: 8 }]}
              placeholder="CVV"
              keyboardType="numeric"
              secureTextEntry
              value={localNovoCartao.cvv}
              onChangeText={handleCvvChange}
              maxLength={4}
            />
          </View>

          <TouchableOpacity style={styles.confirmarCompraBtn} onPress={adicionarCartaoLocal}>
            <Text style={styles.confirmarCompraText}>Adicionar e Pagar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

  const renderHome = () => (
    <ScrollView 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.daysCard}>
        <View style={styles.daysLeftContainer}>
          <Text style={styles.daysLeftNumber}>{diasAteVencimento}</Text>
          <Text style={styles.daysLeftLabel}>dias para seu plano terminar</Text>
        </View>
        <View style={styles.daysDivider} />
        <View style={styles.daysInfoContainer}>
          <View style={styles.daysInfoRow}>
            <Ionicons name="calendar-outline" size={14} color="#FFF" />
            <Text style={styles.daysInfoText}>Válido até: {formatarData(userData.dataFimAssinatura)}</Text>
          </View>
          <View style={styles.daysInfoRow}>
            <Ionicons name="time-outline" size={14} color="#FFF" />
            <Text style={styles.daysInfoText}>Plano ativo</Text>
          </View>
        </View>
      </View>

      <View style={styles.planoCard}>
        <Text style={styles.sectionTitle}>MEU PLANO</Text>
        <View style={styles.planoHeader}>
          <Text style={styles.planoNome}>{userData.plano?.nome || "Basic"}</Text>
          <Text style={styles.planoPreco}>R$ {userData.plano?.preco?.toFixed(2) || "69.90"}/mês</Text>
        </View>
        <View style={styles.creditosContainer}>
          <View>
            <Text style={styles.creditosLabel}>Créditos disponíveis</Text>
            <Text style={styles.creditosValue}>{userData.creditos || 0}</Text>
          </View>
          <TouchableOpacity 
            style={styles.comprarCreditosBtn} 
            onPress={() => setModalComprarCreditos(true)}
          >
            <Text style={styles.comprarCreditosText}>+ Comprar créditos</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.academiaCard}>
        <Text style={styles.sectionTitle}>ACADEMIA VINCULADA</Text>
        <Text style={styles.academiaName}>{userData.academia?.name || "Nenhuma academia"}</Text>
        <Text style={styles.academiaAddress}>{userData.academia?.address || ""}</Text>
        <View style={styles.academiaHoursRow}>
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text style={styles.academiaHours}> {userData.academia?.hours || ""}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.checkinButton} onPress={gerarCheckin}>
        <View style={styles.checkinIconContainer}>
          <Ionicons name="qr-code-outline" size={28} color="#005C4A" />
        </View>
        <View style={styles.checkinTextContainer}>
          <Text style={styles.checkinButtonText}>GERAR CHECK-IN</Text>
          <Text style={styles.checkinButtonSub}>Apresente o código na recepção</Text>
        </View>
        <Ionicons name="arrow-forward" size={18} color="#005C4A" />
      </TouchableOpacity>

      <View style={styles.actionsRow}>
        <TouchableOpacity 
          style={[styles.actionCard, !podeAlterar && styles.actionCardDisabled]} 
          onPress={handleAlterarPlano}
          activeOpacity={podeAlterar ? 0.7 : 1}
        >
          <Ionicons name="swap-horizontal" size={24} color={podeAlterar ? "#005C4A" : "#888"} />
          <Text style={[styles.actionCardTitle, !podeAlterar && styles.actionCardTextDisabled]}>
            Alterar plano
          </Text>
          {!podeAlterar && (
            <Text style={styles.actionCardWarning}>Disponível em {diasAteVencimento} dias</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionCard, !podeAlterar && styles.actionCardDisabled]} 
          onPress={handleAlterarAcademia}
          activeOpacity={podeAlterar ? 0.7 : 1}
        >
          <Ionicons name="fitness" size={24} color={podeAlterar ? "#005C4A" : "#888"} />
          <Text style={[styles.actionCardTitle, !podeAlterar && styles.actionCardTextDisabled]}>
            Alterar academia
          </Text>
          {!podeAlterar && (
            <Text style={styles.actionCardWarning}>Disponível em {diasAteVencimento} dias</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderConfiguracoes = () => (
    <ScrollView 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.configCard}>
        <Text style={styles.configSectionTitle}>CONTA</Text>
        
        <TouchableOpacity style={styles.configItem} onPress={handleAlterarPagamento}>
          <View style={styles.configItemLeft}>
            <Ionicons name="card-outline" size={22} color="#005C4A" />
            <Text style={styles.configItemText}>Forma de pagamento</Text>
          </View>
          <View style={styles.configItemRight}>
            <Text style={styles.configItemValue}>{userData.cartaoCredito}</Text>
            <Ionicons name="chevron-forward" size={18} color="#CCC" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.configItem, !podeAlterar && styles.configItemDisabled]} 
          onPress={handleAlterarPlano}
          activeOpacity={podeAlterar ? 0.7 : 1}
        >
          <View style={styles.configItemLeft}>
            <Ionicons name="swap-horizontal-outline" size={22} color={podeAlterar ? "#005C4A" : "#888"} />
            <View>
              <Text style={[styles.configItemText, !podeAlterar && styles.configItemTextDisabled]}>
                Trocar plano
              </Text>
              {!podeAlterar && (
                <Text style={styles.configItemWarning}>Disponível em {diasAteVencimento} dias</Text>
              )}
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.configItem, !podeAlterar && styles.configItemDisabled]} 
          onPress={handleAlterarAcademia}
          activeOpacity={podeAlterar ? 0.7 : 1}
        >
          <View style={styles.configItemLeft}>
            <Ionicons name="fitness-outline" size={22} color={podeAlterar ? "#005C4A" : "#888"} />
            <View>
              <Text style={[styles.configItemText, !podeAlterar && styles.configItemTextDisabled]}>
                Trocar academia
              </Text>
              {!podeAlterar && (
                <Text style={styles.configItemWarning}>Disponível em {diasAteVencimento} dias</Text>
              )}
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#CCC" />
        </TouchableOpacity>
      </View>

      <View style={styles.configCard}>
        <Text style={styles.configSectionTitle}>PAGAMENTO</Text>
        
        <View style={styles.configItem}>
          <View style={styles.configItemLeft}>
            <Ionicons name="reload-outline" size={22} color="#005C4A" />
            <Text style={styles.configItemText}>Pagamento automático</Text>
          </View>
          <Switch
            value={userData.pagamentoAutomatico}
            onValueChange={(value) => {
              const novosDados = { ...userData, pagamentoAutomatico: value };
              salvarDados(novosDados);
            }}
            trackColor={{ false: "#E8ECF0", true: "#005C4A" }}
            thumbColor="#FFF"
          />
        </View>

        <TouchableOpacity style={styles.configItem}>
          <View style={styles.configItemLeft}>
            <Ionicons name="document-text-outline" size={22} color="#005C4A" />
            <Text style={styles.configItemText}>Histórico de pagamentos</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.configItem} onPress={() => setModalComprarCreditos(true)}>
          <View style={styles.configItemLeft}>
            <Ionicons name="add-circle-outline" size={22} color="#005C4A" />
            <Text style={styles.configItemText}>Comprar créditos</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#CCC" />
        </TouchableOpacity>
      </View>

      <View style={styles.configCard}>
        <Text style={styles.configSectionTitle}>NOTIFICAÇÕES</Text>
        
        <View style={styles.configItem}>
          <View style={styles.configItemLeft}>
            <Ionicons name="notifications-outline" size={22} color="#005C4A" />
            <Text style={styles.configItemText}>Receber notificações</Text>
          </View>
          <Switch
            value={true}
            onValueChange={() => {}}
            trackColor={{ false: "#E8ECF0", true: "#005C4A" }}
            thumbColor="#FFF"
          />
        </View>
      </View>
    </ScrollView>
  );

  const renderPerfil = () => (
    <ScrollView 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {userData.nome ? userData.nome.charAt(0).toUpperCase() : "U"}
          </Text>
        </View>
        <Text style={styles.profileName}>{userData.nome || "Usuário"}</Text>
        <Text style={styles.profileId}>ID: {userData.id || "AVT-00000"}</Text>
      </View>

      <View style={styles.profileInfoCard}>
        <Text style={styles.profileInfoTitle}>INFORMAÇÕES PESSOAIS</Text>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>CPF</Text>
          <Text style={styles.infoValue}>{userData.cpf || "***.***.***-**"}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>E-mail</Text>
          <Text style={styles.infoValue}>{userData.email || "usuario@email.com"}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Telefone</Text>
          <Text style={styles.infoValue}>{userData.telefone || "(11) 99999-9999"}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Membro desde</Text>
          <Text style={styles.infoValue}>{formatarData(userData.dataInicioAssinatura)}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.replace("Home")}>
        <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "home": return renderHome();
      case "config": return renderConfiguracoes();
      case "perfil": return renderPerfil();
      default: return renderHome();
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <SafeAreaView style={styles.safeHeader}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#005C4A" />
            </TouchableOpacity>
            <View style={styles.userInfoRow}>
              <Text style={styles.saudacao}>Olá,</Text>
              <Text style={styles.userName}>{getFirstName()}</Text>
            </View>
            <TouchableOpacity style={styles.avatarButton}>
              <Text style={styles.avatarText}>👤</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <View style={styles.contentArea}>
          {renderContent()}
        </View>
      </ScrollView>

      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab("home")}>
          <Ionicons name="home" size={22} color={activeTab === "home" ? "#005C4A" : "#888"} />
          <Text style={[styles.tabLabel, activeTab === "home" && styles.activeTabLabel]}>Início</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab("config")}>
          <Ionicons name="settings-outline" size={22} color={activeTab === "config" ? "#005C4A" : "#888"} />
          <Text style={[styles.tabLabel, activeTab === "config" && styles.activeTabLabel]}>Config.</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabCenterItem} onPress={gerarCheckin}>
          <View style={styles.centerButton}>
            <Ionicons name="qr-code" size={26} color="#FFF" />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab("perfil")}>
          <Ionicons name="person-outline" size={22} color={activeTab === "perfil" ? "#005C4A" : "#888"} />
          <Text style={[styles.tabLabel, activeTab === "perfil" && styles.activeTabLabel]}>Perfil</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => Alert.alert("Ajuda", "Central de ajuda em breve.")}>
          <Ionicons name="help-circle-outline" size={22} color="#888" />
          <Text style={styles.tabLabel}>Ajuda</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalCheckin} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setModalCheckin(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            
            <View style={styles.modalIcon}>
              <Ionicons name="qr-code" size={50} color="#005C4A" />
            </View>
            
            <Text style={styles.modalTitle}>Check-in Avity Life</Text>
            <Text style={styles.modalSub}>{userData.academia?.name}</Text>

            {!showQRCode ? (
              <TouchableOpacity 
                style={styles.showQRButton} 
                onPress={() => setShowQRCode(true)}
              >
                <Text style={styles.showQRButtonText}>Mostrar QR Code</Text>
              </TouchableOpacity>
            ) : (
              <>
                <View style={styles.qrCodeContainer}>
                  <QRCode value={checkinCode} size={200} color="#005C4A" backgroundColor="#FFF" />
                </View>
                <Text style={styles.qrHint}>Aponte a câmera para o QR Code</Text>
              </>
            )}

            <View style={styles.codeContainer}>
              <Text style={styles.codeLabel}>Código manual</Text>
              <Text style={styles.codeValue} numberOfLines={1} adjustsFontSizeToFit>
                {checkinCode}
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalShare} onPress={handleShareCheckin}>
                <Ionicons name="share-outline" size={18} color="#FFF" />
                <Text style={styles.modalShareText}>Compartilhar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={confirmarCheckin}>
                <Ionicons name="checkmark-outline" size={18} color="#FFF" />
                <Text style={styles.modalConfirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <NotificacaoSucesso />
      <ModalComprarCreditos />
      <ModalAlterarPagamento />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8F9FA" },
  container: { flex: 1 },

  safeHeader: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  backButton: { padding: 4 },
  userInfoRow: { flexDirection: "row", alignItems: "baseline", gap: 6, flex: 1, justifyContent: "center" },
  saudacao: { color: "#6B7280", fontSize: 16, fontWeight: "500" },
  userName: { fontWeight: "bold", color: "#005C4A", fontSize: 18 },
  avatarButton: { backgroundColor: "#005C4A", padding: 10, borderRadius: 30, width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#FFF", fontSize: 18 },

  contentArea: { flex: 1, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 },
  scrollContent: { paddingBottom: 30 },

  daysCard: {
    backgroundColor: "#005C4A",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  daysLeftContainer: { alignItems: "center", flex: 1 },
  daysLeftNumber: { fontSize: 44, fontWeight: "800", color: "#FFF" },
  daysLeftLabel: { fontSize: 11, color: "#FFFFFFCC", marginTop: 4, textAlign: "center" },
  daysDivider: { width: 1, height: 50, backgroundColor: "#FFFFFF30", marginHorizontal: 16 },
  daysInfoContainer: { flex: 1, gap: 6 },
  daysInfoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  daysInfoText: { fontSize: 11, color: "#FFF" },
  
  sectionTitle: { fontSize: 10, color: "#888", marginBottom: 10, fontWeight: "600", letterSpacing: 1 },
  
  planoCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E8ECF0",
  },
  planoHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 },
  planoNome: { fontSize: 20, fontWeight: "700", color: "#1A1A1A" },
  planoPreco: { fontSize: 15, fontWeight: "600", color: "#005C4A" },
  creditosContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTopWidth: 1, borderTopColor: "#F0F0F0" },
  creditosLabel: { fontSize: 12, color: "#666" },
  creditosValue: { fontSize: 32, fontWeight: "700", color: "#005C4A", marginTop: 4 },
  comprarCreditosBtn: { backgroundColor: "#F0F9F6", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  comprarCreditosText: { fontSize: 12, color: "#005C4A", fontWeight: "600" },
  
  academiaCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E8ECF0",
  },
  academiaName: { fontSize: 16, fontWeight: "700", color: "#1A1A1A", marginBottom: 4 },
  academiaAddress: { fontSize: 12, color: "#666", marginBottom: 8, flexWrap: "wrap" },
  academiaHoursRow: { flexDirection: "row", alignItems: "center" },
  academiaHours: { fontSize: 12, color: "#888" },
  
  checkinButton: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8ECF0",
  },
  checkinIconContainer: { width: 45, alignItems: "center" },
  checkinTextContainer: { flex: 1, marginLeft: 12 },
  checkinButtonText: { fontSize: 15, fontWeight: "700", color: "#005C4A", marginBottom: 2 },
  checkinButtonSub: { fontSize: 10, color: "#888" },
  
  actionsRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  actionCard: { flex: 1, backgroundColor: "#FFF", borderRadius: 16, padding: 16, alignItems: "center", borderWidth: 1, borderColor: "#E8ECF0" },
  actionCardDisabled: { opacity: 0.6, backgroundColor: "#F8F9FA" },
  actionCardTitle: { fontSize: 13, fontWeight: "600", color: "#1A1A1A", marginTop: 8, marginBottom: 4 },
  actionCardTextDisabled: { color: "#888" },
  actionCardWarning: { fontSize: 10, color: "#FF8C00", textAlign: "center", marginTop: 4 },
  
  configCard: { backgroundColor: "#FFF", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#E8ECF0" },
  configSectionTitle: { fontSize: 11, color: "#888", marginBottom: 16, fontWeight: "600", letterSpacing: 1 },
  configItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  configItemDisabled: { opacity: 0.6 },
  configItemLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  configItemText: { fontSize: 14, color: "#1A1A1A" },
  configItemTextDisabled: { color: "#999" },
  configItemWarning: { fontSize: 10, color: "#FF8C00", marginTop: 2 },
  configItemRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  configItemValue: { fontSize: 12, color: "#666" },
  
  profileHeader: { alignItems: "center", marginBottom: 24, paddingTop: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#005C4A", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarText: { fontSize: 36, color: "#FFF", fontWeight: "bold" },
  profileName: { fontSize: 18, fontWeight: "bold", color: "#1A1A1A" },
  profileId: { fontSize: 12, color: "#666", marginTop: 4 },
  profileInfoCard: { backgroundColor: "#FFF", borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: "#E8ECF0" },
  profileInfoTitle: { fontSize: 11, color: "#888", marginBottom: 16, fontWeight: "600", letterSpacing: 1 },
  infoItem: { marginBottom: 16 },
  infoLabel: { fontSize: 11, color: "#888", marginBottom: 4 },
  infoValue: { fontSize: 14, color: "#1A1A1A", fontWeight: "500" },
  logoutButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 16, marginBottom: 20 },
  logoutText: { fontSize: 14, color: "#FF3B30", fontWeight: "600" },
  
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    alignItems: "center",
  },
  tabItem: { flex: 1, alignItems: "center", paddingVertical: 4 },
  tabLabel: { fontSize: 9, color: "#888", marginTop: 2 },
  activeTabLabel: { color: "#005C4A", fontWeight: "600" },
  tabCenterItem: { alignItems: "center", justifyContent: "center", marginHorizontal: 8 },
  centerButton: { backgroundColor: "#005C4A", width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center", marginTop: -18, borderWidth: 3, borderColor: "#FFF" },
  
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContainer: { backgroundColor: "#FFF", borderRadius: 24, padding: 24, width: "90%", alignItems: "center", position: "relative" },
  modalClose: { position: "absolute", top: 16, right: 16, zIndex: 1 },
  modalIcon: { width: 70, height: 70, borderRadius: 35, backgroundColor: "#005C4A10", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#1A1A1A", marginBottom: 4 },
  modalSub: { fontSize: 13, color: "#666", marginBottom: 20, textAlign: "center" },
  showQRButton: { backgroundColor: "#005C4A", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, marginBottom: 20 },
  showQRButtonText: { color: "#FFF", fontWeight: "600" },
  qrCodeContainer: { backgroundColor: "#FFF", padding: 12, borderRadius: 16, marginBottom: 12 },
  qrHint: { fontSize: 10, color: "#888", marginBottom: 16, textAlign: "center" },
  codeContainer: { backgroundColor: "#F8F9FA", borderRadius: 12, padding: 12, width: "100%", marginBottom: 20 },
  codeLabel: { fontSize: 10, color: "#888", marginBottom: 4, textAlign: "center" },
  codeValue: { fontSize: 12, color: "#1A1A1A", textAlign: "center", fontFamily: "monospace" },
  modalButtons: { flexDirection: "row", gap: 12, width: "100%" },
  modalShare: { flex: 1, flexDirection: "row", paddingVertical: 12, borderRadius: 12, backgroundColor: "#00A896", alignItems: "center", justifyContent: "center", gap: 6 },
  modalShareText: { fontSize: 13, color: "#FFF", fontWeight: "600" },
  modalConfirm: { flex: 1, flexDirection: "row", paddingVertical: 12, borderRadius: 12, backgroundColor: "#005C4A", alignItems: "center", justifyContent: "center", gap: 6 },
  modalConfirmText: { fontSize: 13, color: "#FFF", fontWeight: "600" },
  
  // Modal Comprar Créditos Estiloso
  modalComprarContainer: {
    backgroundColor: "#FFF",
    borderRadius: 28,
    padding: 24,
    width: "90%",
    maxHeight: "80%",
  },
  modalComprarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalComprarTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  creditosOpcoes: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  creditoOpcao: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E8ECF0",
    backgroundColor: "#FFF",
  },
  creditoOpcaoAtivo: {
    borderColor: "#005C4A",
    backgroundColor: "#F0F9F6",
  },
  creditoQtde: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1A1A1A",
  },
  creditoPreco: {
    fontSize: 14,
    fontWeight: "600",
    color: "#005C4A",
    marginTop: 4,
  },
  creditoPorCredito: {
    fontSize: 10,
    color: "#888",
    marginTop: 2,
  },
  dividerLine: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 16,
  },
  pagamentoOptionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 16,
  },
  pagamentoOptionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    marginBottom: 12,
  },
  pagamentoOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  pagamentoOptionInfo: {
    flex: 1,
  },
  pagamentoOptionName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  pagamentoOptionDesc: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },
  novoCartaoCard: {
    borderWidth: 1,
    borderColor: "#005C4A20",
    borderStyle: "dashed",
    backgroundColor: "#FFF",
  },
  novoCartaoIcon: {
    backgroundColor: "#F0F9F6",
  },
  novoCartaoText: {
    color: "#005C4A",
  },
  
  // Modal Cartão
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: 20 },
  bandeiraContainer: { position: "relative", marginBottom: 12, width: "100%" },
  bandeiraBadge: { position: "absolute", right: 16, top: 14, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  bandeiraText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },
  modalInput: { backgroundColor: "#F5F5F5", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, marginBottom: 12, width: "100%" },
  modalRow: { flexDirection: "row", gap: 12, width: "100%" },
  confirmarCompraBtn: { backgroundColor: "#005C4A", paddingVertical: 14, borderRadius: 12, width: "100%", alignItems: "center", marginTop: 8 },
  confirmarCompraText: { color: "#FFF", fontWeight: "600", fontSize: 15 },
  
  successOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  successContainer: { backgroundColor: "#FFF", borderRadius: 32, padding: 24, alignItems: "center", width: "75%" },
  successIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#00A896", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  successTitle: { fontSize: 18, fontWeight: "bold", color: "#1A1A1A", marginBottom: 8 },
  successMessage: { fontSize: 14, color: "#666", textAlign: "center" },
  successSubMessage: { fontSize: 13, color: "#005C4A", fontWeight: "600", marginTop: 8 },
});