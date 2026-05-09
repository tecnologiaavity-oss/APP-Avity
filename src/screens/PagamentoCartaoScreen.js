import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { theme } from "../theme";

export default function PagamentoCartaoScreen({ route, navigation }) {
  const { valor, descricao, paciente, cartaoSalvo } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Processa o pagamento automaticamente ao entrar na tela
  useEffect(() => {
    processarPagamento();
  }, []);

  const processarPagamento = () => {
    setLoading(true);

    // Simula processamento do pagamento (2 segundos)
    setTimeout(() => {
      setLoading(false);
      setShowModal(true);
    }, 2000);
  };

  const handleFecharModal = () => {
    setShowModal(false);
    navigation.replace("ProcurandoClinica", {
      valor: valor,
      descricao: descricao,
      paciente: paciente,
    });
  };

  // Tela de loading enquanto processa
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Processando pagamento</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.cardInfo}>
          <View style={styles.cardIconContainer}>
            <Text style={styles.cardIcon}>💳</Text>
          </View>
          <Text style={styles.cardTitle}>Cartão selecionado</Text>
          {cartaoSalvo && (
            <Text style={styles.cardDetails}>
              {cartaoSalvo.bandeiraNome || "Cartão"} •••• {cartaoSalvo.final}
            </Text>
          )}
        </View>

        <View style={styles.valorCard}>
          <Text style={styles.valorTitle}>VALOR</Text>
          <Text style={styles.valorAmount}>R$ {valor}</Text>
          <View style={styles.valorDivider} />
          <Text style={styles.valorDesc}>{descricao}</Text>
          {paciente?.nome && (
            <Text style={styles.valorPaciente}>PACIENTE: {paciente.nome.toUpperCase()}</Text>
          )}
        </View>

        <View style={styles.loadingContainer}>
          <View style={styles.loadingCircle}>
            <ActivityIndicator size="large" color="#00A896" />
          </View>
          <Text style={styles.loadingText}>Processando pagamento...</Text>
          <Text style={styles.loadingSub}>Aguarde, estamos validando seu cartão</Text>
        </View>
      </View>

      {/* Modal personalizado de pagamento aprovado */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconContainer}>
              <Text style={styles.modalIcon}>✅</Text>
            </View>
            <Text style={styles.modalTitle}>Pagamento aprovado!</Text>
            <Text style={styles.modalMessage}>
              Seu pagamento de R$ {valor} foi confirmado com sucesso.
            </Text>
            <View style={styles.modalDivider} />
            <TouchableOpacity style={styles.modalButton} onPress={handleFecharModal}>
              <Text style={styles.modalButtonText}>Continuar</Text>
            </TouchableOpacity>
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
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  backText: { fontSize: 24, color: "#005C4A" },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#1A1A1A" },
  content: { flex: 1, padding: 20, alignItems: "center", justifyContent: "center" },

  cardInfo: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    width: "100%",
    borderWidth: 1,
    borderColor: "#E8ECF0",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  cardIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#005C4A10",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  cardIcon: { fontSize: 32 },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#1A1A1A", marginBottom: 4 },
  cardDetails: { fontSize: 14, color: "#005C4A", fontWeight: "500", marginTop: 4 },

  valorCard: {
    backgroundColor: "#005C4A",
    borderRadius: 24,
    padding: 28,
    marginBottom: 32,
    alignItems: "center",
    width: "100%",
    shadowColor: "#005C4A",
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  valorTitle: { 
    fontSize: 12, 
    color: "#FFFFFFB3", 
    marginBottom: 8, 
    letterSpacing: 1.5,
    fontWeight: "600",
  },
  valorAmount: { 
    fontSize: 42, 
    fontWeight: "800", 
    color: "#FFF", 
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  valorDivider: {
    width: 50,
    height: 2,
    backgroundColor: "#FFFFFF30",
    marginVertical: 12,
  },
  valorDesc: { 
    fontSize: 14, 
    color: "#FFF", 
    opacity: 0.9,
    textAlign: "center",
  },
  valorPaciente: { 
    fontSize: 12, 
    color: "#FFFFFFB3", 
    marginTop: 12,
    fontWeight: "500",
  },

  loadingContainer: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFF",
    borderRadius: 20,
    width: "100%",
    borderWidth: 1,
    borderColor: "#E8ECF0",
  },
  loadingCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#00A89610",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  loadingText: { 
    marginTop: 8, 
    fontSize: 16, 
    fontWeight: "700", 
    color: "#1A1A1A" 
  },
  loadingSub: { 
    marginTop: 8, 
    fontSize: 13, 
    color: "#888",
    textAlign: "center",
  },

  // Modal personalizado
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#FFF",
    borderRadius: 28,
    padding: 28,
    width: "85%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  modalIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#005C4A10",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalIcon: {
    fontSize: 36,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#005C4A",
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  modalDivider: {
    width: 60,
    height: 2,
    backgroundColor: "#E8ECF0",
    marginVertical: 16,
  },
  modalButton: {
    backgroundColor: "#005C4A",
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 32,
    minWidth: 160,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});