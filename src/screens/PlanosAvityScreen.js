import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { theme } from "../theme";
import { usePayment } from "../context/PaymentContext";

// Função para detectar bandeira do cartão
const detectarBandeira = (numero) => {
  const clean = numero.replace(/\s/g, "");
  
  if (clean.startsWith("4")) return { nome: "VISA", icone: "💳", cor: "#1A1F71" };
  if (/^5[1-5]/.test(clean) || /^2[2-7][0-9]{2}/.test(clean)) return { nome: "MASTERCARD", icone: "💳", cor: "#EB001B" };
  if (/^(4011|4312|4389|4514|4576|5044|5067|5090|6277|6362|6363|650[4-9])/.test(clean)) return { nome: "ELO", icone: "💳", cor: "#1E90FF" };
  if (/^3[47]/.test(clean)) return { nome: "AMEX", icone: "💳", cor: "#2E77B0" };
  if (clean.startsWith("6062")) return { nome: "HIPERCARD", icone: "💳", cor: "#B31B1B" };
  return { nome: "CARTAO", icone: "💳", cor: "#666" };
};

// Função para validar cartão (algoritmo de Luhn)
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

// Planos
const todosPlanos = [
  {
    id: "starter",
    nome: "Starter",
    preco: 39.90,
    creditos: 8,
    nivel: 1,
    destaque: false,
    cor: "#6C757D",
    beneficios: [
      "8 créditos por mês",
      "Academias selecionadas",
      "Cancelamento grátis",
      "Válido por 30 dias",
    ],
  },
  {
    id: "basic",
    nome: "Basic",
    preco: 69.90,
    creditos: 15,
    nivel: 2,
    destaque: true,
    cor: "#005C4A",
    beneficios: [
      "15 créditos por mês",
      "Todas as academias da rede",
      "Cancelamento grátis",
      "Válido por 30 dias",
      "Prioridade no agendamento",
    ],
  },
  {
    id: "silver",
    nome: "Silver",
    preco: 99.90,
    creditos: 22,
    nivel: 3,
    destaque: false,
    cor: "#00A896",
    beneficios: [
      "22 créditos por mês",
      "Todas as academias da rede",
      "Cancelamento grátis",
      "Válido por 30 dias",
      "Prioridade no agendamento",
      "Aulas especiais incluídas",
    ],
  },
  {
    id: "gold",
    nome: "Gold",
    preco: 139.90,
    creditos: 32,
    nivel: 4,
    destaque: false,
    cor: "#FFB300",
    beneficios: [
      "32 créditos por mês",
      "Todas as academias da rede",
      "Cancelamento grátis",
      "Válido por 30 dias",
      "Prioridade no agendamento",
      "Aulas especiais incluídas",
      "Acompanhamento mensal",
    ],
  },
  {
    id: "premium",
    nome: "Premium",
    preco: 189.90,
    creditos: 48,
    nivel: 5,
    destaque: false,
    cor: "#FF6B35",
    beneficios: [
      "48 créditos por mês",
      "Todas as academias da rede",
      "Cancelamento grátis",
      "Válido por 30 dias",
      "Prioridade no agendamento",
      "Aulas especiais incluídas",
      "Acompanhamento mensal",
      "Brinde exclusivo",
    ],
  },
];

const nivelPlanoMinimo = {
  "Starter": 1,
  "Basic": 2,
  "Silver": 3,
  "Gold": 4,
  "Premium": 5,
};

export default function PlanosAvityScreen({ route, navigation }) {
  const { academia } = route.params || {};
  const { cartoes, adicionarCartao, removerCartao } = usePayment();
  
  const nivelMinimo = academia?.planoMinimo ? nivelPlanoMinimo[academia.planoMinimo] || 2 : 1;
  const precoMinimo = academia?.precoMinimo || 39.90;
  
  const planosDisponiveis = todosPlanos.filter(plano => plano.nivel >= nivelMinimo);
  
  const [planoSelecionado, setPlanoSelecionado] = useState(planosDisponiveis[0]);
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState("PIX");
  const [modalEmpresa, setModalEmpresa] = useState(false);
  const [modalCoparticipacao, setModalCoparticipacao] = useState(false);
  const [empresaId, setEmpresaId] = useState("");
  const [empresaNome, setEmpresaNome] = useState("");
  const [empresaCpf, setEmpresaCpf] = useState("");
  const [modalCartao, setModalCartao] = useState(false);
  const [novoCartao, setNovoCartao] = useState({ numero: "", nome: "", validade: "", cvv: "" });
  const [bandeira, setBandeira] = useState(null);
  const [cartaoSelecionado, setCartaoSelecionado] = useState(null);

  useEffect(() => {
    if (novoCartao.numero.length >= 6) {
      setBandeira(detectarBandeira(novoCartao.numero));
    } else {
      setBandeira(null);
    }
  }, [novoCartao.numero]);

  const isPlanoCompativel = (plano) => plano.nivel >= nivelMinimo;
  const isPlanoBloqueado = (plano) => plano.nivel < nivelMinimo;

  const formatarCPF = (text) => {
    let limpo = text.replace(/\D/g, "");
    if (limpo.length <= 3) return limpo;
    if (limpo.length <= 6) return `${limpo.slice(0, 3)}.${limpo.slice(3)}`;
    if (limpo.length <= 9) return `${limpo.slice(0, 3)}.${limpo.slice(3, 6)}.${limpo.slice(6)}`;
    return `${limpo.slice(0, 3)}.${limpo.slice(3, 6)}.${limpo.slice(6, 9)}-${limpo.slice(9, 11)}`;
  };

  const validarEmpresa = () => {
    const cpfLimpo = empresaCpf.replace(/\D/g, "");
    if (empresaId.length < 4) {
      Alert.alert("ID inválido", "Verifique o ID da empresa.");
      return;
    }
    if (!empresaNome.trim()) {
      Alert.alert("Nome inválido", "Digite o nome do colaborador.");
      return;
    }
    if (cpfLimpo.length !== 11) {
      Alert.alert("CPF inválido", "Digite um CPF válido.");
      return;
    }
    
    setModalEmpresa(false);
    setModalCoparticipacao(true);
  };

  const confirmarCoparticipacao = () => {
    setModalCoparticipacao(false);
    setPagamentoSelecionado("COPARTICIPACAO");
    navigation.replace("UserPanel", {
      plano: planoSelecionado,
      academia: academia,
    });
  };

  const removerCartaoHandler = (cartaoId) => {
    Alert.alert(
      "Remover cartão",
      "Deseja realmente remover este cartão?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Remover", 
          style: "destructive",
          onPress: () => removerCartao(cartaoId)
        }
      ]
    );
  };

  const adicionarNovoCartao = () => {
    const numeroLimpo = novoCartao.numero.replace(/\s/g, "");
    
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
    
    adicionarCartao(novoCartaoObj);
    setCartaoSelecionado(novoCartaoObj);
    setPagamentoSelecionado("CARTAO");
    setModalCartao(false);
    setNovoCartao({ numero: "", nome: "", validade: "", cvv: "" });
    setBandeira(null);
    Alert.alert("Sucesso", "Cartão adicionado com sucesso!");
  };

  const handleSelecionarPagamento = (tipo, cartao = null) => {
    setPagamentoSelecionado(tipo);
    if (cartao) {
      setCartaoSelecionado(cartao);
    } else if (tipo !== "CARTAO") {
      setCartaoSelecionado(null);
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

  const handleFinalizar = () => {
    if (!isPlanoCompativel(planoSelecionado)) {
      Alert.alert("Plano não disponível", `Esta academia aceita apenas planos a partir de ${academia?.planoMinimo || "Basic"}`);
      return;
    }

    if (pagamentoSelecionado === "PIX") {
      navigation.navigate("PagamentoPixLife", {
        valor: planoSelecionado.preco,
        descricao: `Assinatura ${planoSelecionado.nome} - ${academia?.name || "Avity Life"}`,
        tipo: "assinatura",
        plano: planoSelecionado,
        academia: academia,
      });
    } else if (pagamentoSelecionado === "CARTAO" && cartaoSelecionado) {
      navigation.navigate("PagamentoCartaoLife", {
        valor: planoSelecionado.preco,
        descricao: `Assinatura ${planoSelecionado.nome} - ${academia?.name || "Avity Life"}`,
        tipo: "assinatura",
        plano: planoSelecionado,
        academia: academia,
        cartaoSalvo: cartaoSelecionado,
      });
    } else {
      Alert.alert("Atenção", "Selecione uma forma de pagamento válida.");
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Planos Avity Life</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.academiaCard}>
        <Text style={styles.academiaName}>{academia?.name || "Avity Life"}</Text>
        <View style={styles.academiaRating}>
          <Text style={styles.ratingText}>⭐ {academia?.rating || "4.9"} </Text>
          <Text style={styles.ratingCount}>({academia?.reviews || "128"} avaliações)</Text>
          <Text style={styles.separator}>•</Text>
          <Text style={styles.distance}>📍 {academia?.distance || "0.8"} km</Text>
        </View>
        <Text style={styles.academiaInfoText}>💪 {academia?.subcategory || "Musculação, Cardio, Yoga, Pilates"}</Text>
        <Text style={styles.academiaInfoText}>🕐 {academia?.hours || "Seg a Sex 6h-22h | Sáb 8h-18h"}</Text>
        <View style={styles.planoMinimoBadge}>
          <Text style={styles.planoMinimoText}>Planos a partir de {academia?.planoMinimo || "Basic"} - R$ {precoMinimo}/mês</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Escolha seu plano</Text>

      {planosDisponiveis.map((plano) => {
        const bloqueado = isPlanoBloqueado(plano);
        
        return (
          <TouchableOpacity
            key={plano.id}
            style={[
              styles.planoCard,
              planoSelecionado.id === plano.id && !bloqueado && styles.planoCardSelected,
              bloqueado && styles.planoCardBloqueado,
            ]}
            onPress={() => !bloqueado && setPlanoSelecionado(plano)}
            disabled={bloqueado}
          >
            {bloqueado && (
              <View style={styles.bloqueadoBadge}>
                <Text style={styles.bloqueadoBadgeText}>⛔ INDISPONÍVEL</Text>
              </View>
            )}
            
            <View style={styles.planoHeader}>
              <Text style={[styles.planoNome, { color: bloqueado ? "#CCC" : plano.cor }]}>{plano.nome}</Text>
              <View style={styles.planoPrecoContainer}>
                <Text style={[styles.planoPreco, { color: bloqueado ? "#CCC" : plano.cor }]}>R$ {plano.preco}</Text>
                <Text style={styles.planoPeriodo}>/mês</Text>
              </View>
            </View>

            <View style={styles.creditosContainer}>
              <Text style={[styles.creditosNumero, { color: bloqueado ? "#CCC" : plano.cor }]}>{plano.creditos}</Text>
              <Text style={styles.creditosLabel}>créditos por mês</Text>
            </View>

            <View style={styles.divider} />

            {plano.beneficios.map((beneficio, index) => (
              <View key={index} style={styles.beneficioRow}>
                <Text style={[styles.beneficioIcon, { color: bloqueado ? "#CCC" : plano.cor }]}>✓</Text>
                <Text style={[styles.beneficioText, bloqueado && styles.beneficioTextBloqueado]}>{beneficio}</Text>
              </View>
            ))}
          </TouchableOpacity>
        );
      })}

      <Text style={styles.pagamentoTitle}>Forma de pagamento</Text>

      {/* PIX */}
      <TouchableOpacity 
        style={[styles.pagamentoOption, pagamentoSelecionado === "PIX" && styles.pagamentoOptionSelected]}
        onPress={() => handleSelecionarPagamento("PIX")}
      >
        <View style={styles.pagamentoLeft}>
          <View style={styles.pagamentoIconContainer}>
            <Text style={[styles.pagamentoIcone, { color: "#32BCAD", fontSize: 24 }]}>❖</Text>
          </View>
          <View>
            <Text style={styles.pagamentoNome}>PIX</Text>
            <Text style={styles.pagamentoDesc}>Pagamento imediato via Pix</Text>
          </View>
        </View>
        <View style={[styles.pagamentoRadio, pagamentoSelecionado === "PIX" && { backgroundColor: "#32BCAD" }]}>
          {pagamentoSelecionado === "PIX" && <Text style={styles.pagamentoRadioCheck}>✓</Text>}
        </View>
      </TouchableOpacity>

      {/* Cartões salvos */}
      {cartoes.length > 0 && (
        <>
          <Text style={styles.subsectionTitle}>Cartões salvos</Text>
          {cartoes.map((cartao) => (
            <TouchableOpacity
              key={cartao.id}
              style={[styles.pagamentoOption, cartaoSelecionado?.id === cartao.id && styles.pagamentoOptionSelected]}
              onPress={() => handleSelecionarPagamento("CARTAO", cartao)}
              onLongPress={() => removerCartaoHandler(cartao.id)}
            >
              <View style={styles.pagamentoLeft}>
                <View style={styles.pagamentoIconContainer}>
                  <Text style={styles.pagamentoIcone}>{cartao.bandeira || "💳"}</Text>
                </View>
                <View>
                  <Text style={styles.pagamentoNome}>{cartao.bandeiraNome || "Cartão"} •••• {cartao.final}</Text>
                  <Text style={styles.pagamentoDesc}>{cartao.titular} | {cartao.validade}</Text>
                </View>
              </View>
              <View style={[styles.pagamentoRadio, cartaoSelecionado?.id === cartao.id && { backgroundColor: "#005C4A" }]}>
                {cartaoSelecionado?.id === cartao.id && <Text style={styles.pagamentoRadioCheck}>✓</Text>}
              </View>
            </TouchableOpacity>
          ))}
        </>
      )}

      {/* Adicionar cartão */}
      <TouchableOpacity style={styles.addCardButton} onPress={() => setModalCartao(true)}>
        <Text style={styles.addCardText}>+ Adicionar cartão de crédito/débito</Text>
      </TouchableOpacity>

      {/* Coparticipação */}
      <TouchableOpacity 
        style={[styles.pagamentoOption, pagamentoSelecionado === "COPARTICIPACAO" && styles.pagamentoOptionSelected]}
        onPress={() => setModalEmpresa(true)}
      >
        <View style={styles.pagamentoLeft}>
          <View style={styles.pagamentoIconContainer}>
            <Text style={styles.pagamentoIcone}>🏢</Text>
          </View>
          <View>
            <Text style={styles.pagamentoNome}>Coparticipação</Text>
            <Text style={styles.pagamentoDesc}>Sua empresa paga parte da assinatura</Text>
          </View>
        </View>
        <View style={[styles.pagamentoRadio, pagamentoSelecionado === "COPARTICIPACAO" && { backgroundColor: "#005C4A" }]}>
          {pagamentoSelecionado === "COPARTICIPACAO" && <Text style={styles.pagamentoRadioCheck}>✓</Text>}
        </View>
      </TouchableOpacity>

      {/* Botão Final */}
      <TouchableOpacity style={styles.finalizarButton} onPress={handleFinalizar}>
        <Text style={styles.finalizarButtonText}>
          {pagamentoSelecionado === "PIX" && `Pagar com PIX • R$ ${planoSelecionado?.preco}`}
          {pagamentoSelecionado === "CARTAO" && `Pagar com Cartão • R$ ${planoSelecionado?.preco}`}
        </Text>
      </TouchableOpacity>

      {/* MODAL ADICIONAR CARTÃO */}
      <Modal visible={modalCartao} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Adicionar cartão</Text>
            
            <View style={styles.bandeiraContainer}>
              <TextInput
                style={styles.modalInput}
                placeholder="Número do cartão"
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
              style={styles.modalInput}
              placeholder="Nome no cartão (como escrito)"
              value={novoCartao.nome}
              onChangeText={(text) => setNovoCartao({ ...novoCartao, nome: text.toUpperCase() })}
            />

            <View style={styles.modalRow}>
              <TextInput
                style={[styles.modalInput, { flex: 1, marginRight: 8 }]}
                placeholder="Validade (MM/AA)"
                value={novoCartao.validade}
                onChangeText={(text) => setNovoCartao({ ...novoCartao, validade: formatarValidade(text) })}
                maxLength={5}
              />
              <TextInput
                style={[styles.modalInput, { flex: 1, marginLeft: 8 }]}
                placeholder="CVV"
                keyboardType="numeric"
                secureTextEntry
                value={novoCartao.cvv}
                onChangeText={(text) => setNovoCartao({ ...novoCartao, cvv: text })}
                maxLength={4}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModalCartao(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={adicionarNovoCartao}>
                <Text style={styles.modalConfirmText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL COPARTICIPAÇÃO */}
      <Modal visible={modalEmpresa} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSmall}>
            <Text style={styles.modalTitle}>Coparticipação</Text>
            
            <View style={styles.avisoCard}>
              <Text style={styles.avisoTitle}>⚠️ AVISO IMPORTANTE</Text>
              <Text style={styles.avisoText}>
                Este benefício é válido APENAS para funcionários autorizados pelas empresas parceiras da Avity.
                O uso indevido poderá resultar em bloqueio da conta.
              </Text>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="ID da empresa"
              value={empresaId}
              onChangeText={setEmpresaId}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Nome completo do colaborador"
              value={empresaNome}
              onChangeText={setEmpresaNome}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="CPF do colaborador"
              keyboardType="numeric"
              value={empresaCpf}
              onChangeText={(text) => setEmpresaCpf(formatarCPF(text))}
              maxLength={14}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModalEmpresa(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={validarEmpresa}>
                <Text style={styles.modalConfirmText}>Ativar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL CONFIRMAÇÃO COPARTICIPAÇÃO PREMIUM */}
      <Modal visible={modalCoparticipacao} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCoparticipacaoContainer}>
            <View style={styles.modalCoparticipacaoIcon}>
              <View style={styles.modalCoparticipacaoIconCircle}>
                <Text style={styles.modalCoparticipacaoIconText}>🏢</Text>
              </View>
            </View>
            
            <Text style={styles.modalCoparticipacaoTitle}>Coparticipação ativada!</Text>
            <Text style={styles.modalCoparticipacaoSub}>
              Sua empresa foi identificada com sucesso
            </Text>
            
            <View style={styles.modalCoparticipacaoInfo}>
              <View style={styles.modalCoparticipacaoInfoRow}>
                <Text style={styles.modalCoparticipacaoInfoLabel}>Empresa</Text>
                <Text style={styles.modalCoparticipacaoInfoValue}>{empresaId}</Text>
              </View>
              <View style={styles.modalCoparticipacaoInfoRow}>
                <Text style={styles.modalCoparticipacaoInfoLabel}>Colaborador</Text>
                <Text style={styles.modalCoparticipacaoInfoValue}>{empresaNome}</Text>
              </View>
              <View style={styles.modalCoparticipacaoInfoRow}>
                <Text style={styles.modalCoparticipacaoInfoLabel}>CPF</Text>
                <Text style={styles.modalCoparticipacaoInfoValue}>{empresaCpf}</Text>
              </View>
            </View>
            
            <View style={styles.modalCoparticipacaoDivider} />
            
            <Text style={styles.modalCoparticipacaoDesc}>
              ✨ Você terá descontos especiais em todas as assinaturas Avity Life!
            </Text>
            
            <TouchableOpacity style={styles.modalCoparticipacaoButton} onPress={confirmarCoparticipacao}>
              <Text style={styles.modalCoparticipacaoButtonText}>Continuar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
    borderBottomColor: "#F0F0F0",
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  backText: { fontSize: 24, color: "#005C4A" },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#1A1A1A" },

  academiaCard: {
    backgroundColor: "#005C4A",
    margin: 20,
    padding: 20,
    borderRadius: 20,
  },
  academiaName: { fontSize: 20, fontWeight: "700", color: "#FFF", marginBottom: 8 },
  academiaRating: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  ratingText: { fontSize: 14, color: "#FFD700" },
  ratingCount: { fontSize: 12, color: "#FFFFFFB3" },
  separator: { fontSize: 12, color: "#FFFFFFB3", marginHorizontal: 6 },
  distance: { fontSize: 12, color: "#FFFFFFB3" },
  academiaInfoText: { fontSize: 12, color: "#FFFFFFB3", marginBottom: 6, lineHeight: 18 },
  planoMinimoBadge: { marginTop: 12, alignSelf: "flex-start", backgroundColor: "#FFFFFF20", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  planoMinimoText: { fontSize: 11, color: "#FFF", fontWeight: "600" },

  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#1A1A1A", marginHorizontal: 20, marginBottom: 16 },

  planoCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8ECF0",
    position: "relative",
  },
  planoCardSelected: { borderColor: "#005C4A", borderWidth: 2, backgroundColor: "#005C4A08" },
  planoCardBloqueado: { backgroundColor: "#F8F9FA", opacity: 0.7 },
  bloqueadoBadge: { position: "absolute", top: -10, right: 20, backgroundColor: "#EF4444", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  bloqueadoBadgeText: { fontSize: 10, fontWeight: "700", color: "#FFF" },
  planoHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  planoNome: { fontSize: 20, fontWeight: "700" },
  planoPrecoContainer: { flexDirection: "row", alignItems: "baseline" },
  planoPreco: { fontSize: 24, fontWeight: "800" },
  planoPeriodo: { fontSize: 12, color: "#888", marginLeft: 4 },
  creditosContainer: { flexDirection: "row", alignItems: "baseline", marginBottom: 16 },
  creditosNumero: { fontSize: 36, fontWeight: "800", marginRight: 8 },
  creditosLabel: { fontSize: 14, color: "#888" },
  divider: { height: 1, backgroundColor: "#F0F0F0", marginVertical: 12 },
  beneficioRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  beneficioIcon: { fontSize: 14, marginRight: 8, fontWeight: "700" },
  beneficioText: { fontSize: 13, color: "#666", flex: 1 },
  beneficioTextBloqueado: { color: "#CCC" },

  pagamentoTitle: { fontSize: 16, fontWeight: "700", color: "#1A1A1A", marginHorizontal: 20, marginTop: 8, marginBottom: 16 },
  subsectionTitle: { fontSize: 14, fontWeight: "600", color: "#666", marginHorizontal: 20, marginTop: 8, marginBottom: 12 },
  
  pagamentoOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E8ECF0",
  },
  pagamentoOptionSelected: { borderColor: "#005C4A", borderWidth: 2, backgroundColor: "#005C4A08" },
  pagamentoLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  pagamentoIconContainer: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#F5F5F5", alignItems: "center", justifyContent: "center" },
  pagamentoIcone: { fontSize: 22 },
  pagamentoNome: { fontSize: 15, fontWeight: "600", color: "#1A1A1A" },
  pagamentoDesc: { fontSize: 12, color: "#888", marginTop: 2 },
  pagamentoRadio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: "#D1D5DB", alignItems: "center", justifyContent: "center" },
  pagamentoRadioCheck: { color: "#FFF", fontSize: 12, fontWeight: "700" },

  addCardButton: { marginHorizontal: 20, marginBottom: 12, paddingVertical: 14, alignItems: "center", borderWidth: 1, borderColor: "#E8ECF0", borderRadius: 16, borderStyle: "dashed", backgroundColor: "#FFF" },
  addCardText: { fontSize: 14, color: "#005C4A", fontWeight: "600" },

  finalizarButton: { backgroundColor: "#005C4A", marginHorizontal: 20, marginBottom: 20, paddingVertical: 16, borderRadius: 30, alignItems: "center" },
  finalizarButtonText: { color: "#FFF", fontSize: 16, fontWeight: "600" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContainer: { backgroundColor: "#FFF", borderRadius: 24, padding: 24, width: "90%" },
  modalSmall: { backgroundColor: "#FFF", borderRadius: 24, padding: 24, width: "85%" },
  modalTitle: { fontSize: 20, fontWeight: "600", color: "#1A1A1A", marginBottom: 20, textAlign: "center" },
  modalInput: { backgroundColor: "#F5F5F5", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, marginBottom: 12 },
  modalRow: { flexDirection: "row", gap: 12 },
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 12 },
  modalCancel: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: "#E8ECF0", alignItems: "center" },
  modalCancelText: { fontSize: 14, color: "#666" },
  modalConfirm: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: "#005C4A", alignItems: "center" },
  modalConfirmText: { fontSize: 14, color: "#FFF", fontWeight: "600" },

  bandeiraContainer: { position: "relative", marginBottom: 12 },
  bandeiraBadge: { position: "absolute", right: 16, top: 14, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  bandeiraText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },

  avisoCard: { backgroundColor: "#FEF3F2", borderRadius: 12, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: "#FEE2E2" },
  avisoTitle: { fontSize: 11, fontWeight: "700", color: "#EF4444", marginBottom: 6, letterSpacing: 0.5 },
  avisoText: { fontSize: 11, color: "#666", lineHeight: 16 },

  // Modal Coparticipação Premium
  modalCoparticipacaoContainer: {
    backgroundColor: "#FFF",
    borderRadius: 28,
    padding: 24,
    width: "90%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  modalCoparticipacaoIcon: {
    marginBottom: 20,
  },
  modalCoparticipacaoIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#005C4A10",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCoparticipacaoIconText: { fontSize: 36 },
  modalCoparticipacaoTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#005C4A",
    marginBottom: 8,
  },
  modalCoparticipacaoSub: {
    fontSize: 14,
    color: "#888",
    marginBottom: 20,
    textAlign: "center",
  },
  modalCoparticipacaoInfo: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 16,
    width: "100%",
    marginBottom: 20,
  },
  modalCoparticipacaoInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalCoparticipacaoInfoLabel: {
    fontSize: 13,
    color: "#888",
  },
  modalCoparticipacaoInfoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  modalCoparticipacaoDivider: {
    width: 60,
    height: 2,
    backgroundColor: "#E8ECF0",
    marginBottom: 20,
  },
  modalCoparticipacaoDesc: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  modalCoparticipacaoButton: {
    backgroundColor: "#005C4A",
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
  },
  modalCoparticipacaoButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});