import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  BackHandler,
  Platform,
} from "react-native";
import { theme } from "../theme";
import * as Clipboard from "expo-clipboard";

export default function PagamentoPixScreen({ route, navigation }) {
  const { valor, paciente } = route.params || {};
  const [copiado, setCopiado] = useState(false);
  const [pagamentoConfirmado, setPagamentoConfirmado] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(600);
  const verificacaoRef = useRef(null);
  const timerRef = useRef(null);
  const contadorRef = useRef(0);

  const codigoPix = "00020126360014br.gov.bcb.pix0114avity@pagamento.com5204000053039865485802BR5925Avity6009SA0PAULO2626177777528121186304E2C3";

  const formatarTempo = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!pagamentoConfirmado && tempoRestante > 0) {
      timerRef.current = setInterval(() => {
        setTempoRestante(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            clearInterval(verificacaoRef.current);
            Alert.alert(
              "⏰ Tempo esgotado!",
              "O prazo para pagamento expirou. O pedido será cancelado.",
              [{ text: "OK", onPress: () => navigation.goBack() }]
            );
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

  useEffect(() => {
    if (!pagamentoConfirmado && tempoRestante > 0) {
      verificacaoRef.current = setInterval(() => {
        simularVerificacaoPagamento();
      }, 5000);
    }
    return () => {
      if (verificacaoRef.current) clearInterval(verificacaoRef.current);
    };
  }, [pagamentoConfirmado, tempoRestante]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      Alert.alert(
        "Cancelar solicitação",
        "Tem certeza que deseja cancelar? O pagamento não será processado.",
        [
          { text: "Continuar pagamento", style: "cancel" },
          { 
            text: "Cancelar solicitação", 
            style: "destructive",
            onPress: () => {
              if (verificacaoRef.current) clearInterval(verificacaoRef.current);
              if (timerRef.current) clearInterval(timerRef.current);
              navigation.goBack();
            }
          }
        ]
      );
      return true;
    });
    return () => backHandler.remove();
  }, [navigation]);

  const simularVerificacaoPagamento = () => {
    if (pagamentoConfirmado || tempoRestante <= 0) return;
    
    setVerificando(true);
    contadorRef.current++;
    
    if (contadorRef.current >= 3) {
      clearInterval(verificacaoRef.current);
      clearInterval(timerRef.current);
      setPagamentoConfirmado(true);
      setVerificando(false);
      
      Alert.alert(
        "✅ Pagamento confirmado!",
        `Seu pagamento de R$ ${valor} foi aprovado.\n\nRedirecionando...`,
        [{ text: "OK", onPress: () => navigation.replace("ProcurandoClinica", { valor, paciente }) }]
      );
    }
    setVerificando(false);
  };

  const handleCopiarCodigo = async () => {
    try {
      await Clipboard.setStringAsync(codigoPix);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível copiar o código");
    }
  };

  const handleVoltar = () => {
    Alert.alert(
      "Cancelar solicitação",
      "Tem certeza que deseja cancelar? O pagamento não será processado.",
      [
        { text: "Continuar pagamento", style: "cancel" },
        { 
          text: "Cancelar solicitação", 
          style: "destructive",
          onPress: () => {
            if (verificacaoRef.current) clearInterval(verificacaoRef.current);
            if (timerRef.current) clearInterval(timerRef.current);
            navigation.goBack();
          }
        }
      ]
    );
  };

  const percentualTempo = (tempoRestante / 600) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleVoltar} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PIX</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.timerCard}>
          <Text style={styles.timerLabel}>Tempo restante para pagamento</Text>
          <Text style={[styles.timerValue, tempoRestante <= 60 && styles.timerUrgente]}>
            {formatarTempo(tempoRestante)}
          </Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${percentualTempo}%` }]} />
          </View>
        </View>

        {pagamentoConfirmado ? (
          <View style={styles.statusConfirmado}>
            <Text style={styles.statusIcon}>✓</Text>
            <Text style={styles.statusText}>Pagamento confirmado</Text>
          </View>
        ) : (
          <View style={styles.statusAguardando}>
            <View style={styles.pulseDot} />
            <Text style={styles.statusText}>Aguardando pagamento</Text>
            {verificando && <ActivityIndicator style={styles.loader} color={theme.colors.primary} />}
          </View>
        )}

        {/* APENAS O VALOR - SEM DESCRIÇÃO */}
        <View style={styles.resumoCard}>
          <Text style={styles.resumoTitle}>TOTAL</Text>
          <Text style={styles.resumoValor}>R$ {valor}</Text>
          {paciente?.nome && (
            <Text style={styles.resumoPaciente}>PACIENTE: {paciente.nome.toUpperCase()}</Text>
          )}
        </View>

        <View style={styles.qrCodeCard}>
          <View style={styles.qrCodeHeader}>
            <Text style={styles.qrCodeIcon}>📱</Text>
            <Text style={styles.qrCodeTitle}>QR Code</Text>
          </View>
          <Text style={styles.qrCodeText}>
            Escaneie o código pelo app do seu banco
          </Text>
          <View style={styles.qrCodePlaceholder}>
            <Text style={styles.qrCodePlaceholderText}>QR Code</Text>
            <Text style={styles.qrCodePlaceholderSub}>Disponível em breve</Text>
          </View>
        </View>

        <View style={styles.pixCard}>
          <View style={styles.pixHeader}>
            <Text style={styles.pixIcon}>❖</Text>
            <Text style={styles.pixTitle}>PIX Copia e Cola</Text>
          </View>
          <Text style={styles.pixSub}>Pagamento rápido e seguro</Text>

          <View style={styles.codigoContainer}>
            <Text style={styles.codigoLabel}>Código PIX</Text>
            <Text style={styles.codigoValue} numberOfLines={2}>
              {codigoPix}
            </Text>
          </View>

          <TouchableOpacity style={styles.copiarBtn} onPress={handleCopiarCodigo}>
            <Text style={styles.copiarBtnText}>
              {copiado ? "✓ Código copiado" : "Copiar código"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.instrucoesCard}>
          <Text style={styles.instrucoesTitle}>Como pagar</Text>
          {[
            "Abra o app do seu banco",
            "Escolha a opção PIX",
            "Cole o código ou escaneie o QR Code",
            "Confirme o pagamento"
          ].map((text, index) => (
            <View key={index} style={styles.instrucaoItem}>
              <View style={styles.instrucaoNumero}>
                <Text style={styles.instrucaoNumeroText}>{index + 1}</Text>
              </View>
              <Text style={styles.instrucaoText}>{text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.avisoCard}>
          <Text style={styles.avisoTitle}>⏱️ Confirmação automática</Text>
          <Text style={styles.avisoText}>
            Após o pagamento, aguarde alguns segundos. A confirmação será automática.
          </Text>
        </View>

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
    borderBottomColor: "#EEEEEE",
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  backText: { fontSize: 24, color: theme.colors.primary },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#1A1A1A" },
  content: { flex: 1, padding: 20 },

  timerCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  timerLabel: { fontSize: 13, color: "#888", marginBottom: 8, fontWeight: "500" },
  timerValue: { fontSize: 38, fontWeight: "700", color: "#1A1A1A", fontFamily: "monospace" },
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
  statusIcon: { fontSize: 16, color: "#4CAF50", fontWeight: "600" },
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
  resumoTitle: { fontSize: 12, color: "#FFFFFFB3", marginBottom: 4, letterSpacing: 1 },
  resumoValor: { fontSize: 36, fontWeight: "700", color: "#FFF" },
  resumoPaciente: { fontSize: 12, color: "#FFFFFFB3", marginTop: 8 },

  qrCodeCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  qrCodeHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  qrCodeIcon: { fontSize: 24 },
  qrCodeTitle: { fontSize: 16, fontWeight: "600", color: "#1A1A1A" },
  qrCodeText: { fontSize: 13, color: "#888", marginBottom: 20, lineHeight: 18 },
  qrCodePlaceholder: {
    width: "100%",
    height: 180,
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E8ECF0",
    borderStyle: "dashed",
  },
  qrCodePlaceholderText: { fontSize: 14, color: "#AAA", fontWeight: "500" },
  qrCodePlaceholderSub: { fontSize: 12, color: "#CCC", marginTop: 8 },

  pixCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  pixHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  pixIcon: { fontSize: 26, color: "#32BCAD", fontWeight: "600" },
  pixTitle: { fontSize: 16, fontWeight: "600", color: "#1A1A1A" },
  pixSub: { fontSize: 13, color: "#888", marginBottom: 20 },
  codigoContainer: { backgroundColor: "#F8F9FA", borderRadius: 12, padding: 14, marginBottom: 16 },
  codigoLabel: { fontSize: 11, color: "#888", marginBottom: 6 },
  codigoValue: { fontSize: 12, color: "#1A1A1A", fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" },
  copiarBtn: { backgroundColor: "#32BCAD", borderRadius: 12, paddingVertical: 14, alignItems: "center" },
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

  avisoCard: { backgroundColor: "#F0F7FF", borderRadius: 16, padding: 16, marginBottom: 30 },
  avisoTitle: { fontSize: 13, fontWeight: "600", color: "#1D4ED8", marginBottom: 4 },
  avisoText: { fontSize: 12, color: "#374151", lineHeight: 18 },
});