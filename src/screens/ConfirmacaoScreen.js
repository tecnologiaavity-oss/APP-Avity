import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function ConfirmacaoScreen({ route, navigation }) {
  const { plano, academia } = route.params || {};

  return (
    <View style={styles.container}>
      <View style={styles.successIcon}>
        <Text style={styles.successIconText}>🎉</Text>
      </View>
      <Text style={styles.title}>Assinatura ativada!</Text>
      <Text style={styles.subtitle}>
        Seu plano {plano?.nome} foi ativado com sucesso na {academia?.name}
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Resumo</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Plano</Text>
          <Text style={styles.value}>{plano?.nome}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Valor mensal</Text>
          <Text style={styles.value}>R$ {plano?.preco}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Créditos</Text>
          <Text style={styles.value}>{plano?.creditos} por mês</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Academia</Text>
          <Text style={styles.value}>{academia?.name}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Home")}>
        <Text style={styles.buttonText}>Voltar para Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA", padding: 20, alignItems: "center", justifyContent: "center" },
  successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#005C4A", alignItems: "center", justifyContent: "center", marginBottom: 24 },
  successIconText: { fontSize: 40 },
  title: { fontSize: 24, fontWeight: "700", color: "#1A1A1A", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#888", textAlign: "center", marginBottom: 32, lineHeight: 20 },
  card: { backgroundColor: "#FFF", borderRadius: 20, padding: 20, width: "100%", marginBottom: 32, borderWidth: 1, borderColor: "#E8ECF0" },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#1A1A1A", marginBottom: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  label: { fontSize: 14, color: "#888" },
  value: { fontSize: 14, fontWeight: "600", color: "#1A1A1A" },
  button: { backgroundColor: "#005C4A", borderRadius: 30, paddingVertical: 16, width: "100%", alignItems: "center" },
  buttonText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
});