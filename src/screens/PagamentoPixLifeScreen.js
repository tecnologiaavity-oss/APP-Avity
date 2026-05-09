import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  BackHandler,
  Modal,
  Platform,
  Dimensions,
  Image,
} from "react-native";
import { theme } from "../theme";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get("window");

export default function PagamentoPixLifeScreen({ route, navigation }) {
  const { valor, descricao, plano, academia, tipo, creditos } = route.params || {};
  const [copiado, setCopiado] = useState(false);
  const [pagamentoConfirmado, setPagamentoConfirmado] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(600);
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  const verificacaoRef = useRef(null);
  const timerRef = useRef(null);
  const contadorRef = useRef(0);
  const cancelModalShownRef = useRef(false);
  const isCancellingRef = useRef(false);
  const redirectingRef = useRef(false);

  const codigoPix = "00020126360014br.gov.bcb.pix0114avity@pagamento.com5204000053039865485802BR5925Avity6009SA0PAULO2626177777528121186304E2C3";

  const formatarTempo = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };

  const finalizarPagamento = useCallback(() => {
    if (redirectingRef.current) return;
    redirectingRef.current = true;
    navigation.replace("UserPanel", { plano, academia });
  }, [navigation, plano, academia]);

  // Timer regressivo
  useEffect(() => {
    if (!pagamentoConfirmado && tempoRestante > 0) {
      timerRef.current = setInterval(() => {
        setTempoRestante(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            clearInterval(verificacaoRef.current);
            if (!cancelModalShownRef.current && !pagamentoConfirmado) {
              cancelModalShownRef.current = true;
              setShowCancelModal(true);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pagamentoConfirmado]);

  // Verificação simulada de pagamento
  useEffect(() => {
    if (!pagamentoConfirmado && tempoRestante > 0) {
      verificacaoRef.current = setInterval(() => {
        if (pagamentoConfirmado || tempoRestante <= 0) return;
        
        setVerificando(true);
        contadorRef.current++;
        
        if (contadorRef.current >= 3) {
          clearInterval(verificacaoRef.current);
          clearInterval(timerRef.current);
          setPagamentoConfirmado(true);
          setVerificando(false);
          setShowCancelModal(false);
          cancelModalShownRef.current = false;
        } else {
          setVerificando(false);
        }
      }, 5000);
    }
    return () => {
      if (verificacaoRef.current) clearInterval(verificacaoRef.current);
    };
  }, [pagamentoConfirmado, tempoRestante]);

  // Controle do botão voltar do Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isCancellingRef.current || showCancelModal || pagamentoConfirmado) {
        return true;
      }
      cancelModalShownRef.current = true;
      setShowCancelModal(true);
      return true;
    });
    return () => backHandler.remove();
  }, [showCancelModal, pagamentoConfirmado]);

  const handleCopiarCodigo = async () => {
    try {
      await Clipboard.setStringAsync(codigoPix);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível copiar o código");
    }
  };

  const handleCancelar = useCallback(() => {
    if (isCancellingRef.current) return;
    isCancellingRef.current = true;
    
    if (verificacaoRef.current) clearInterval(verificacaoRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    
    setShowCancelModal(false);
    cancelModalShownRef.current = false;
    
    navigation.goBack();
  }, [navigation]);

  const handleContinuar = useCallback(() => {
    setShowCancelModal(false);
    cancelModalShownRef.current = false;
  }, []);

  const percentualTempo = (tempoRestante / 600) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (!showCancelModal && !pagamentoConfirmado && !isCancellingRef.current) {
            cancelModalShownRef.current = true;
            setShowCancelModal(true);
          }
        }} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#005C4A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pagamento PIX</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.timerCard}>
          <Text style={styles.timerLabel}>⏱️ Tempo restante para pagamento</Text>
          <Text style={[styles.timerValue, tempoRestante <= 60 && styles.timerUrgente]}>
            {formatarTempo(tempoRestante)}
          </Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${percentualTempo}%` }]} />
          </View>
        </View>

        {pagamentoConfirmado ? (
          <View style={styles.statusConfirmado}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.statusText}>Pagamento confirmado!</Text>
          </View>
        ) : (
          <View style={styles.statusAguardando}>
            <View style={styles.pulseDot} />
            <Text style={styles.statusText}>Aguardando pagamento</Text>
            {verificando && <ActivityIndicator style={styles.loader} color={theme.colors.primary} />}
          </View>
        )}

        <View style={styles.resumoCard}>
          <Text style={styles.resumoTitle}>
            {tipo === "creditos" ? "COMPRA DE CRÉDITOS" : "ASSINATURA"}
          </Text>
          <Text style={styles.resumoValor}>R$ {valor?.toFixed(2)}</Text>
          <Text style={styles.resumoDesc}>{descricao}</Text>
        </View>

        <View style={styles.pixCard}>
          <View style={styles.pixHeader}>
            <Image 
              source={{ uri: "https://blog.caviarcriativo.com/wp-content/uploads/2025/03/Download-Logo-Pix-1024x1024.png" }} 
              style={styles.pixLogo}
              resizeMode="contain"
            />
            <Text style={styles.pixTitle}>PIX Copia e Cola</Text>
          </View>
          <Text style={styles.pixSub}>Aprovação rápida e segura</Text>

          <View style={styles.qrPlaceholder}>
            <Ionicons name="qr-code" size={60} color="#CCC" />
            <Text style={styles.qrPlaceholderText}>QR Code disponível em breve</Text>
          </View>

          <View style={styles.codigoContainer}>
            <Text style={styles.codigoLabel}>Código PIX</Text>
            <Text style={styles.codigoValue} numberOfLines={2}>
              {codigoPix}
            </Text>
          </View>

          <TouchableOpacity style={styles.copiarBtn} onPress={handleCopiarCodigo}>
            <Ionicons name="copy-outline" size={20} color="#FFF" />
            <Text style={styles.copiarBtnText}>
              {copiado ? "Código copiado!" : "Copiar código PIX"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.instrucoesCard}>
          <Text style={styles.instrucoesTitle}>📋 Como pagar</Text>
          <View style={styles.instrucaoItem}>
            <View style={styles.instrucaoNumero}>
              <Text style={styles.instrucaoNumeroText}>1</Text>
            </View>
            <Text style={styles.instrucaoText}>Abra o app do seu banco</Text>
          </View>
          <View style={styles.instrucaoItem}>
            <View style={styles.instrucaoNumero}>
              <Text style={styles.instrucaoNumeroText}>2</Text>
            </View>
            <Text style={styles.instrucaoText}>Escolha a opção PIX</Text>
          </View>
          <View style={styles.instrucaoItem}>
            <View style={styles.instrucaoNumero}>
              <Text style={styles.instrucaoNumeroText}>3</Text>
            </View>
            <Text style={styles.instrucaoText}>Cole o código ou leia o QR Code</Text>
          </View>
          <View style={styles.instrucaoItem}>
            <View style={styles.instrucaoNumero}>
              <Text style={styles.instrucaoNumeroText}>4</Text>
            </View>
            <Text style={styles.instrucaoText}>Confirme o pagamento no seu banco</Text>
          </View>
        </View>

        <View style={styles.segurancaCard}>
          <Ionicons name="shield-checkmark" size={24} color="#005C4A" />
          <View style={styles.segurancaTextContainer}>
            <Text style={styles.segurancaTitle}>Transação segura</Text>
            <Text style={styles.segurancaText}>
              Pagamento processado com criptografia de ponta a ponta.
            </Text>
          </View>
        </View>

        <View style={styles.avisoCard}>
          <Ionicons name="time-outline" size={20} color="#1D4ED8" />
          <Text style={styles.avisoText}>
            Após o pagamento, aguarde alguns segundos. O app confirmará automaticamente.
          </Text>
        </View>
      </ScrollView>

      {/* Modal de Cancelamento */}
      <Modal visible={showCancelModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCancelContainer}>
            <Ionicons name="alert-circle" size={48} color="#FF9800" />
            <Text style={styles.modalCancelTitle}>Cancelar solicitação</Text>
            <Text style={styles.modalCancelMessage}>
              Tem certeza que deseja cancelar? O pagamento não será processado.
            </Text>
            <View style={styles.modalCancelButtons}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={handleContinuar}>
                <Text style={styles.modalCancelButtonText}>Continuar pagamento</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmarCancel} onPress={handleCancelar}>
                <Text style={styles.modalConfirmarCancelText}>Cancelar solicitação</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Sucesso */}
      <Modal visible={pagamentoConfirmado} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSucessoContainer}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark" size={40} color="#FFF" />
            </View>
            <Text style={styles.modalSucessoTitulo}>✅ Pagamento confirmado!</Text>
            <Text style={styles.modalSucessoDesc}>
              Seu pagamento de R$ {valor} foi aprovado.
            </Text>
            <Text style={styles.modalSucessoSub}>
              Redirecionando para seu painel...
            </Text>
            <ActivityIndicator style={{ marginTop: 16 }} color={theme.colors.primary} />
          </View>
        </View>
      </Modal>
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
    borderBottomColor: "#F0F0F0",
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#1A1A1A" },
  content: { flex: 1, padding: 20 },

  timerCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  timerLabel: { fontSize: 13, color: "#888", marginBottom: 8, fontWeight: "500" },
  timerValue: { fontSize: 42, fontWeight: "700", color: "#1A1A1A", fontFamily: "monospace" },
  timerUrgente: { color: "#FF4444" },
  progressBarContainer: { width: "100%", height: 4, backgroundColor: "#EEEEEE", borderRadius: 2, marginTop: 12, overflow: "hidden" },
  progressBar: { height: "100%", backgroundColor: theme.colors.primary, borderRadius: 2 },

  statusAguardando: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF8E1",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 12,
  },
  statusConfirmado: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 8,
  },
  pulseDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#FF9800" },
  statusText: { fontSize: 14, fontWeight: "500", color: "#1A1A1A" },
  loader: { marginLeft: 8 },

  resumoCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  resumoTitle: { fontSize: 11, color: "#FFFFFFB3", marginBottom: 4, letterSpacing: 1 },
  resumoValor: { fontSize: 36, fontWeight: "700", color: "#FFF" },
  resumoDesc: { fontSize: 13, color: "#FFF", marginTop: 8, opacity: 0.9 },

  pixCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    alignItems: "center",
  },
  pixHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  pixLogo: { width: 56, height: 56 },
  pixTitle: { fontSize: 18, fontWeight: "600", color: "#1A1A1A" },
  pixSub: { fontSize: 13, color: "#888", marginBottom: 20 },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
  },
  qrPlaceholderText: { fontSize: 12, color: "#999", marginTop: 12, textAlign: "center" },
  codigoContainer: { backgroundColor: "#F8F9FA", borderRadius: 12, padding: 14, marginBottom: 16, width: "100%" },
  codigoLabel: { fontSize: 11, color: "#888", marginBottom: 6 },
  codigoValue: { fontSize: 12, color: "#1A1A1A", fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" },
  copiarBtn: {
    flexDirection: "row",
    backgroundColor: "#32BCAD",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
  },
  copiarBtnText: { color: "#FFF", fontSize: 14, fontWeight: "600" },

  instrucoesCard: { backgroundColor: "#FFF", borderRadius: 20, padding: 20, marginBottom: 16 },
  instrucoesTitle: { fontSize: 16, fontWeight: "600", color: "#1A1A1A", marginBottom: 16 },
  instrucaoItem: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 12 },
  instrucaoNumero: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  instrucaoNumeroText: { color: "#FFF", fontSize: 12, fontWeight: "600" },
  instrucaoText: { fontSize: 14, color: "#666", flex: 1 },

  segurancaCard: {
    flexDirection: "row",
    backgroundColor: "#E8F5E9",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 12,
    alignItems: "center",
  },
  segurancaTextContainer: { flex: 1 },
  segurancaTitle: { fontSize: 14, fontWeight: "600", color: "#005C4A", marginBottom: 4 },
  segurancaText: { fontSize: 12, color: "#374151", lineHeight: 18 },

  avisoCard: {
    flexDirection: "row",
    backgroundColor: "#F0F7FF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 30,
    gap: 12,
    alignItems: "center",
  },
  avisoText: { fontSize: 12, color: "#1D4ED8", flex: 1, lineHeight: 18 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalCancelContainer: {
    backgroundColor: "#FFF",
    borderRadius: 28,
    padding: 24,
    width: width * 0.85,
    alignItems: "center",
  },
  modalCancelTitle: { fontSize: 20, fontWeight: "700", color: "#1A1A1A", marginBottom: 8 },
  modalCancelMessage: { fontSize: 14, color: "#666", textAlign: "center", marginBottom: 24, lineHeight: 20 },
  modalCancelButtons: { width: "100%", gap: 12 },
  modalCancelButton: { backgroundColor: "#005C4A", paddingVertical: 14, borderRadius: 30, alignItems: "center" },
  modalCancelButtonText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
  modalConfirmarCancel: { backgroundColor: "#FFF", paddingVertical: 14, borderRadius: 30, alignItems: "center", borderWidth: 1, borderColor: "#F44336" },
  modalConfirmarCancelText: { color: "#F44336", fontSize: 16, fontWeight: "600" },

  modalSucessoContainer: {
    backgroundColor: "#FFF",
    borderRadius: 28,
    padding: 24,
    width: width * 0.8,
    alignItems: "center",
  },
  successIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#4CAF50", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  modalSucessoTitulo: { fontSize: 20, fontWeight: "700", color: "#1A1A1A", marginBottom: 8 },
  modalSucessoDesc: { fontSize: 14, color: "#666", textAlign: "center", marginBottom: 4 },
  modalSucessoSub: { fontSize: 13, color: "#005C4A", fontWeight: "500", marginBottom: 16 },
});