import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { theme } from "../theme";
import { usePayment } from "../context/PaymentContext";

export default function CarteiraScreen({ navigation, route }) {
  const { cartoes, removerCartao } = usePayment();
  const { onPagamentoSelecionado, valor, descricao, paciente } = route.params || {};

  const selecionarPagamento = (tipo, dados = null) => {
    if (onPagamentoSelecionado) {
      onPagamentoSelecionado({ tipo, dados });
      navigation.goBack();
    } else {
      // Fallback - navega direto
      navigation.navigate("PagamentoScreen", {
        pagamento: tipo,
        pagamentoNome: tipo === "CARTAO" ? `Cartão final ${dados?.final}` : tipo,
        valor,
        descricao,
        paciente,
      });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Carteira Avity</Text>
      <Text style={styles.subtitle}>Seus métodos de pagamento</Text>

      {/* SALDO */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Saldo</Text>
        <Text style={styles.balanceValue}>R$ 0,00</Text>
        <Text style={styles.balanceSub}>Reembolsos aparecerão aqui</Text>
      </View>

      {/* CARTÕES */}
      <Text style={styles.sectionTitle}>Cartões</Text>

      {cartoes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Nenhum cartão salvo ainda</Text>
        </View>
      ) : (
        cartoes.map((cartao) => (
          <TouchableOpacity 
            key={cartao.id} 
            style={styles.card}
            onPress={() => selecionarPagamento("CARTAO", cartao)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.cardName}>{cartao.nome}</Text>
              <Text style={styles.cardInfo}>
                {cartao.tipo} • Final {cartao.final}
              </Text>
              <Text style={styles.cardDate}>Validade {cartao.validade}</Text>
            </View>

            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                removerCartao(cartao.id);
              }}
              style={styles.removeButton}
            >
              <Text style={styles.removeText}>Remover</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))
      )}

      {/* BOTÃO ADICIONAR CARTÃO */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("PagamentoCartao")}
      >
        <Text style={styles.addText}>+ Adicionar cartão</Text>
      </TouchableOpacity>

      {/* PIX */}
      <Text style={styles.sectionTitle}>Pix</Text>

      <TouchableOpacity style={styles.pixBox} onPress={() => selecionarPagamento("PIX")}>
        <Text style={styles.pixTitle}>📱 Pix (pré-pago)</Text>
        <Text style={styles.pixSub}>Pagamento rápido antecipado</Text>
      </TouchableOpacity>

      {/* COPARTICIPAÇÃO */}
      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Empresa</Text>

      <TouchableOpacity style={styles.coparticipacaoBox} onPress={() => selecionarPagamento("COPARTICIPACAO")}>
        <Text style={styles.pixTitle}>🏢 Coparticipação</Text>
        <Text style={styles.pixSub}>Sua empresa paga parte da consulta</Text>
        <View style={styles.avisoMini}>
          <Text style={styles.avisoMiniText}>⚠️ Válido apenas para funcionário titular</Text>
        </View>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  content: { padding: 20, paddingBottom: 40 },

  backButton: { marginBottom: 10 },
  backText: { color: theme.colors.primary, fontWeight: "900", fontSize: 16 },

  title: { fontSize: 26, fontWeight: "900" },
  subtitle: { color: "#6B7280", marginBottom: 20 },

  balanceCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  balanceLabel: { color: "#9CA3AF" },
  balanceValue: { color: "#FFF", fontSize: 28, fontWeight: "900" },
  balanceSub: { color: "#D1D5DB", fontSize: 12 },

  sectionTitle: { fontWeight: "900", marginBottom: 10, marginTop: 10 },

  empty: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  emptyText: { color: "#6B7280" },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  cardName: { fontWeight: "900" },
  cardInfo: { color: "#6B7280", marginTop: 2 },
  cardDate: { fontSize: 12, color: "#9CA3AF" },

  removeButton: {
    backgroundColor: "#FEE2E2",
    padding: 8,
    borderRadius: 10,
  },
  removeText: { color: "#EF4444", fontWeight: "900" },

  addButton: {
    marginTop: 10,
    backgroundColor: theme.colors.primary,
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  addText: { color: "#FFF", fontWeight: "900" },

  pixBox: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
  },
  pixTitle: { fontWeight: "900", fontSize: 15 },
  pixSub: { color: "#6B7280", marginTop: 4 },

  coparticipacaoBox: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
  },
  avisoMini: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  avisoMiniText: {
    fontSize: 11,
    color: "#FF9800",
  },
});