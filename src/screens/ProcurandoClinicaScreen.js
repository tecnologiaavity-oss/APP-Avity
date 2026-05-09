import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
} from "react-native";
import { theme } from "../theme";

const { width, height } = Dimensions.get("window");

export default function ProcurandoClinicaScreen({ route, navigation }) {
  const { valor, descricao, paciente } = route.params || {};
  const [tempoBusca, setTempoBusca] = useState(0);
  const [mostrarSugestao, setMostrarSugestao] = useState(false);
  const [clinicasVisualizando, setClinicasVisualizando] = useState(0);
  const [propostas, setPropostas] = useState([]);
  const [modalCancelar, setModalCancelar] = useState(false);
  const [status, setStatus] = useState("buscando");
  
  // Animações
  const pulseAnim = useRef(new Animated.Value(0.6)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Simular clínicas visualizando
  useEffect(() => {
    const interval = setInterval(() => {
      setClinicasVisualizando(prev => {
        const incremento = Math.floor(Math.random() * 2) + 1;
        const novoValor = Math.min(prev + incremento, 8);
        
        if (novoValor >= 3 && propostas.length === 0) {
          setTimeout(() => adicionarProposta(), 1000);
        }
        if (novoValor >= 5 && propostas.length === 1) {
          setTimeout(() => adicionarProposta(), 1000);
        }
        
        return novoValor;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [propostas.length]);

  // Timer de busca
  useEffect(() => {
    const timer = setInterval(() => {
      setTempoBusca(prev => {
        const novoTempo = prev + 1;
        if (novoTempo >= 300 && !mostrarSugestao) {
          setMostrarSugestao(true);
          setStatus("sugerindo");
        }
        return novoTempo;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Animações
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.6, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ])
    ).start();

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const waveScale = waveAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.8, 1.5, 0.8] });
  const waveOpacity = waveAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.6, 0.1, 0.6] });

  const adicionarProposta = () => {
    const novosValores = [valor - 5, valor - 3, valor + 2, valor + 5];
    const valorAleatorio = novosValores[Math.floor(Math.random() * novosValores.length)];
    const clinicasNomes = [
      "Clínica Sorriso Prime",
      "Hospital São Lucas",
      "Centro Médico Vida",
      "Clínica Bem Estar",
      "Instituto de Saúde Avançada"
    ];
    const nomeAleatorio = clinicasNomes[Math.floor(Math.random() * clinicasNomes.length)];
    
    setPropostas(prev => [...prev, { 
      id: Date.now(), 
      clinica: nomeAleatorio, 
      valor: valorAleatorio, 
      tempo: Math.floor(Math.random() * 10) + 5 
    }]);
  };

  const aceitarProposta = (proposta) => {
    // Navega diretamente para a tela de detalhes da consulta, sem alerta
    navigation.replace("DetalhesConsulta", {
      clinic: {
        name: proposta.clinica,
        type: descricao || "Consulta médica",
        rating: 4.9,
        distance: `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 9)} km`,
        eta: `${proposta.tempo} min`,
      },
      requestData: {
        specialty: descricao || "Consulta médica",
        paymentMethod: "Confirmado",
        price: proposta.valor,
      },
    });
  };

  const recusarProposta = (propostaId) => {
    setPropostas(prev => prev.filter(p => p.id !== propostaId));
  };

  const formatarTempo = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    if (minutos > 0) return `${minutos}:${segs.toString().padStart(2, '0')}`;
    return `${segs}s`;
  };

  const handleCancelar = () => setModalCancelar(true);
  const confirmarCancelar = () => {
    setModalCancelar(false);
    navigation.goBack();
  };

  const handleAumentarProposta = () => {
    setModalCancelar(false);
    Alert.alert("Aumentar proposta", "Deseja aumentar o valor da sua oferta para atrair mais clínicas?", [
      { text: "Manter valor", style: "cancel" },
      { text: "Aumentar proposta", onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancelar} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Avity Saúde</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          
          {/* MAPA COM ONDAS PULSANTES */}
          <View style={styles.mapContainer}>
            <View style={styles.mapBackground}>
              <View style={styles.mapDot1} />
              <View style={styles.mapDot2} />
              <View style={styles.mapDot3} />
              <View style={styles.mapDot4} />
              
              <Animated.View style={[styles.mapWave, { transform: [{ scale: waveScale }], opacity: waveOpacity }]} />
              <Animated.View style={[styles.mapWave2, { transform: [{ scale: waveScale }], opacity: waveOpacity }]} />
              <Animated.View style={[styles.mapWave3, { transform: [{ scale: waveScale }], opacity: waveOpacity }]} />
              
              <View style={styles.mapPin}>
                <View style={styles.mapPinInner}>
                  <Animated.View style={[styles.mapPinPulse, { transform: [{ scale: pulseAnim }] }]} />
                </View>
              </View>
              
              <View style={styles.mapRadarLine1} />
              <View style={styles.mapRadarLine2} />
            </View>
            <Text style={styles.mapSubtitle}>Buscando clínicas próximas a você</Text>
          </View>

          {/* Status principal */}
          <View style={styles.statusCard}>
            <View style={styles.statusLeft}>
              <Text style={styles.statusTitle}>{status === "buscando" ? "Buscando atendimento" : "Aguardando propostas"}</Text>
              <Text style={styles.statusSub}>{status === "buscando" ? "Estamos encontrando as melhores opções" : "Aumente sua proposta para agilizar"}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Animated.View style={[styles.statusDot, { transform: [{ scale: pulseAnim }] }]} />
              <Text style={styles.statusBadgeText}>AO VIVO</Text>
            </View>
          </View>

          {/* Clínicas visualizando */}
          <View style={styles.visualizandoCard}>
            <View style={styles.visualizandoHeader}>
              <Text style={styles.visualizandoTitle}>Clínicas analisando</Text>
              <Text style={styles.visualizandoCount}>{clinicasVisualizando}</Text>
            </View>
            <View style={styles.visualizandoBar}>
              <View style={[styles.visualizandoProgress, { width: `${(clinicasVisualizando / 8) * 100}%` }]} />
            </View>
            <Text style={styles.visualizandoText}>
              {clinicasVisualizando === 0 ? "Aguardando clínicas na região..." : `${clinicasVisualizando} clínica${clinicasVisualizando > 1 ? 's' : ''} ${clinicasVisualizando === 1 ? 'está' : 'estão'} analisando sua solicitação`}
            </Text>
          </View>

          {/* Contra-propostas */}
          {propostas.length > 0 && (
            <View style={styles.propostasSection}>
              <Text style={styles.propostasTitle}>Propostas recebidas</Text>
              {propostas.map((proposta) => (
                <View key={proposta.id} style={styles.propostaCard}>
                  <View style={styles.propostaHeader}>
                    <View>
                      <Text style={styles.propostaClinica}>{proposta.clinica}</Text>
                      <Text style={styles.propostaTempo}>~{proposta.tempo} min de distância</Text>
                    </View>
                    <View style={styles.propostaValorContainer}>
                      <Text style={styles.propostaValorLabel}>Valor</Text>
                      <Text style={styles.propostaValor}>R$ {proposta.valor}</Text>
                      {proposta.valor < valor && (
                        <Text style={styles.propostaDesconto}>Economia de R$ {valor - proposta.valor}</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.propostaButtons}>
                    <TouchableOpacity 
                      style={styles.propostaRecusar} 
                      onPress={() => recusarProposta(proposta.id)}
                    >
                      <Text style={styles.propostaRecusarText}>Recusar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.propostaAceitar} 
                      onPress={() => aceitarProposta(proposta)}
                    >
                      <Text style={styles.propostaAceitarText}>Aceitar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Resumo */}
          <View style={styles.resumoCard}>
            <View style={styles.resumoRow}>
              <Text style={styles.resumoLabel}>Serviço</Text>
              <Text style={styles.resumoValue}>{descricao || "Consulta médica"}</Text>
            </View>
            <View style={styles.resumoRow}>
              <Text style={styles.resumoLabel}>Pagamento</Text>
              <Text style={[styles.resumoValue, styles.pagamentoConfirmado]}>Confirmado</Text>
            </View>
            <View style={styles.resumoRow}>
              <Text style={styles.resumoLabel}>Valor inicial</Text>
              <Text style={styles.resumoValor}>R$ {valor}</Text>
            </View>
            <View style={styles.resumoRow}>
              <Text style={styles.resumoLabel}>Tempo de busca</Text>
              <Text style={styles.resumoTempo}>{formatarTempo(tempoBusca)}</Text>
            </View>
          </View>

          {/* Sugestão */}
          {mostrarSugestao && (
            <Animated.View style={[styles.sugestaoCard, { opacity: fadeAnim }]}>
              <Text style={styles.sugestaoIcon}>⏱️</Text>
              <Text style={styles.sugestaoTitle}>Aguardando clínicas?</Text>
              <Text style={styles.sugestaoText}>Aumente o valor da sua proposta para atrair mais clínicas e agilizar seu atendimento.</Text>
              <TouchableOpacity style={styles.sugestaoBtn} onPress={handleAumentarProposta}>
                <Text style={styles.sugestaoBtnText}>Aumentar proposta →</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          <View style={{ height: 30 }} />
        </Animated.View>
      </ScrollView>

      {/* MODAL CANCELAR */}
      <Modal visible={modalCancelar} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconContainer}><Text style={styles.modalIcon}>⚠️</Text></View>
            <Text style={styles.modalTitle}>Cancelar busca</Text>
            <Text style={styles.modalMessage}>Tem certeza que deseja cancelar a busca por clínicas? O pagamento será estornado.</Text>
            <View style={styles.modalDivider} />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModalCancelar(false)}>
                <Text style={styles.modalCancelText}>Continuar buscando</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={confirmarCancelar}>
                <Text style={styles.modalConfirmText}>Cancelar busca</Text>
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
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#FFF", letterSpacing: 0.5 },
  scrollView: { flex: 1 },
  content: { padding: 20 },

  // MAPA
  mapContainer: { backgroundColor: "#2A2A2A", borderRadius: 24, overflow: "hidden", marginBottom: 24, height: 200 },
  mapBackground: { flex: 1, backgroundColor: "#1A3A2A", alignItems: "center", justifyContent: "center", position: "relative" },
  mapDot1: { position: "absolute", top: 40, left: 30, width: 10, height: 10, borderRadius: 5, backgroundColor: "#00A896", opacity: 0.5 },
  mapDot2: { position: "absolute", bottom: 50, right: 35, width: 14, height: 14, borderRadius: 7, backgroundColor: "#00A896", opacity: 0.3 },
  mapDot3: { position: "absolute", top: 120, right: 55, width: 8, height: 8, borderRadius: 4, backgroundColor: "#FFF", opacity: 0.4 },
  mapDot4: { position: "absolute", bottom: 80, left: 50, width: 6, height: 6, borderRadius: 3, backgroundColor: "#00A896", opacity: 0.6 },
  mapWave: { position: "absolute", width: 100, height: 100, borderRadius: 50, backgroundColor: "#00A896", opacity: 0.4 },
  mapWave2: { position: "absolute", width: 160, height: 160, borderRadius: 80, backgroundColor: "#00A896", opacity: 0.3 },
  mapWave3: { position: "absolute", width: 220, height: 220, borderRadius: 110, backgroundColor: "#00A896", opacity: 0.2 },
  mapPin: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#00A896", alignItems: "center", justifyContent: "center", shadowColor: "#00A896", shadowOpacity: 0.5, shadowRadius: 12, elevation: 6 },
  mapPinInner: { width: 16, height: 16, borderRadius: 8, backgroundColor: "#FFF", alignItems: "center", justifyContent: "center" },
  mapPinPulse: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#00A896" },
  mapRadarLine1: { position: "absolute", top: 0, left: "50%", width: 1, height: "100%", backgroundColor: "#00A89630" },
  mapRadarLine2: { position: "absolute", top: "50%", left: 0, width: "100%", height: 1, backgroundColor: "#00A89630" },
  mapSubtitle: { position: "absolute", bottom: 16, left: 16, color: "#00A896", fontSize: 12, fontWeight: "500" },

  statusCard: { backgroundColor: "#2A2A2A", borderRadius: 20, padding: 20, marginBottom: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statusLeft: { flex: 1 },
  statusTitle: { fontSize: 18, fontWeight: "700", color: "#FFF", marginBottom: 4 },
  statusSub: { fontSize: 13, color: "#888" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#34C759" },
  statusBadgeText: { fontSize: 10, fontWeight: "600", color: "#34C759", letterSpacing: 0.5 },

  visualizandoCard: { backgroundColor: "#2A2A2A", borderRadius: 20, padding: 20, marginBottom: 20 },
  visualizandoHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  visualizandoTitle: { fontSize: 14, fontWeight: "600", color: "#FFF" },
  visualizandoCount: { fontSize: 28, fontWeight: "700", color: "#00A896" },
  visualizandoBar: { height: 4, backgroundColor: "#444", borderRadius: 2, overflow: "hidden", marginBottom: 12 },
  visualizandoProgress: { height: "100%", backgroundColor: "#00A896", borderRadius: 2 },
  visualizandoText: { fontSize: 12, color: "#888", lineHeight: 18 },

  propostasSection: { marginBottom: 20 },
  propostasTitle: { fontSize: 15, fontWeight: "600", color: "#FFF", marginBottom: 12 },
  propostaCard: { backgroundColor: "#2A2A2A", borderRadius: 16, padding: 16, marginBottom: 12 },
  propostaHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  propostaClinica: { fontSize: 16, fontWeight: "700", color: "#FFF", marginBottom: 4 },
  propostaTempo: { fontSize: 12, color: "#888" },
  propostaValorContainer: { alignItems: "flex-end" },
  propostaValorLabel: { fontSize: 10, color: "#888", marginBottom: 2 },
  propostaValor: { fontSize: 20, fontWeight: "700", color: "#00A896" },
  propostaDesconto: { fontSize: 10, color: "#34C759", marginTop: 4 },
  propostaButtons: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  propostaRecusar: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: "#444", alignItems: "center" },
  propostaRecusarText: { fontSize: 14, color: "#FFF", fontWeight: "600" },
  propostaAceitar: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: "#00A896", alignItems: "center" },
  propostaAceitarText: { fontSize: 14, color: "#FFF", fontWeight: "600" },

  resumoCard: { backgroundColor: "#2A2A2A", borderRadius: 20, padding: 20, marginBottom: 16 },
  resumoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#3A3A3A" },
  resumoLabel: { fontSize: 13, color: "#888" },
  resumoValue: { fontSize: 14, fontWeight: "500", color: "#FFF" },
  pagamentoConfirmado: { color: "#34C759" },
  resumoValor: { fontSize: 16, fontWeight: "700", color: "#00A896" },
  resumoTempo: { fontSize: 14, fontWeight: "600", color: "#FF9800" },

  sugestaoCard: { backgroundColor: "#2A1A00", borderRadius: 20, padding: 20, marginBottom: 30, alignItems: "center", borderWidth: 1, borderColor: "#FFB30030" },
  sugestaoIcon: { fontSize: 32, marginBottom: 12 },
  sugestaoTitle: { fontSize: 16, fontWeight: "700", color: "#FFB300", marginBottom: 8, textAlign: "center" },
  sugestaoText: { fontSize: 13, color: "#AAA", textAlign: "center", marginBottom: 16, lineHeight: 20 },
  sugestaoBtn: { backgroundColor: "#FFB300", borderRadius: 30, paddingVertical: 12, paddingHorizontal: 24 },
  sugestaoBtnText: { color: "#1A1A1A", fontSize: 14, fontWeight: "600" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center" },
  modalContainer: { backgroundColor: "#2A2A2A", borderRadius: 28, padding: 24, width: "85%", alignItems: "center" },
  modalIconContainer: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#444", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  modalIcon: { fontSize: 32 },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#FFF", marginBottom: 8 },
  modalMessage: { fontSize: 14, color: "#AAA", textAlign: "center", marginBottom: 20, lineHeight: 20 },
  modalDivider: { width: 60, height: 1, backgroundColor: "#444", marginBottom: 20 },
  modalButtons: { flexDirection: "row", gap: 12, width: "100%" },
  modalCancel: { flex: 1, paddingVertical: 14, borderRadius: 30, borderWidth: 1, borderColor: "#444", alignItems: "center" },
  modalCancelText: { fontSize: 14, color: "#AAA", fontWeight: "500" },
  modalConfirm: { flex: 1, paddingVertical: 14, borderRadius: 30, backgroundColor: "#FF4444", alignItems: "center" },
  modalConfirmText: { fontSize: 14, color: "#FFF", fontWeight: "600" },
});