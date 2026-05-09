import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { theme } from "../theme";
import { useAuth } from "../context/AuthContext";
import LocalizacaoAtual from "../components/LocalizacaoAtual";

const especialidades = [
  { id: "clinico", nome: "Clínico Geral", icone: "👨‍⚕️", preco: 35 },
  { id: "cardio", nome: "Cardiologia", icone: "❤️", preco: 60 },
  { id: "dermato", nome: "Dermatologia", icone: "🧴", preco: 55 },
  { id: "pediatra", nome: "Pediatria", icone: "👶", preco: 50 },
  { id: "oftalmo", nome: "Oftalmologia", icone: "👁️", preco: 65 },
  { id: "dentista", nome: "Dentista Geral", icone: "🦷", preco: 40 },
];

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();

  const getSaudacao = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Bom dia";
    if (hora < 18) return "Boa tarde";
    return "Boa noite";
  };

  const capitalizarNome = (nome) => {
    if (!nome) return "Paciente";
    return nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase();
  };

  const handleLogout = () => {
    Alert.alert("Sair", "Deseja realmente sair?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", onPress: logout },
    ]);
  };

  const handleSelecionarEspecialidade = (esp) => {
    navigation.navigate("Selecao", { especialidade: esp });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.saudacao}>{getSaudacao()},</Text>
          <Text style={styles.userName}>{capitalizarNome(user?.nome)}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Componente de Localização */}
      <LocalizacaoAtual onLocationChange={(loc) => console.log(loc)} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔥 Especialidades</Text>
        <View style={styles.grid}>
          {especialidades.map((esp) => (
            <TouchableOpacity
              key={esp.id}
              style={styles.card}
              onPress={() => handleSelecionarEspecialidade(esp)}
            >
              <Text style={styles.cardIcon}>{esp.icone}</Text>
              <Text style={styles.cardNome}>{esp.nome}</Text>
              <Text style={styles.cardPreco}>R$ {esp.preco}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.negociaCard}
        onPress={() => navigation.navigate("Negocia")}
      >
        <Text style={styles.negociaIcon}>💰</Text>
        <View style={styles.negociaTextContainer}>
          <Text style={styles.negociaTitle}>Avity Negocia</Text>
          <Text style={styles.negociaDesc}>Você define o valor que pode pagar</Text>
        </View>
        <Text style={styles.negociaArrow}>→</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botaoSolicitar}
        onPress={() => navigation.navigate("Selecao")}
      >
        <Text style={styles.botaoSolicitarText}>+ Solicitar atendimento</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 48,
    paddingBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  saudacao: { fontSize: theme.typography.sizes.body, color: "#FFF", opacity: 0.9 },
  userName: { fontSize: theme.typography.sizes.h2, fontWeight: theme.typography.weights.bold, color: "#FFF", marginTop: 4 },
  logoutButton: { backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.xs, borderRadius: theme.borderRadius.pill },
  logoutText: { color: "#FFF", fontSize: theme.typography.sizes.small },
  section: { padding: theme.spacing.lg },
  sectionTitle: { fontSize: theme.typography.sizes.h3, fontWeight: theme.typography.weights.bold, color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: theme.spacing.md },
  card: { width: "30%", backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.medium, padding: theme.spacing.md, alignItems: "center", ...theme.shadow.small },
  cardIcon: { fontSize: 32, marginBottom: theme.spacing.xs },
  cardNome: { fontSize: theme.typography.sizes.small, fontWeight: theme.typography.weights.medium, textAlign: "center" },
  cardPreco: { fontSize: theme.typography.sizes.small, color: theme.colors.primary, marginTop: 4 },
  negociaCard: { flexDirection: "row", backgroundColor: "#FFF9E6", marginHorizontal: theme.spacing.lg, marginVertical: theme.spacing.sm, padding: theme.spacing.md, borderRadius: theme.borderRadius.medium, alignItems: "center", borderWidth: 1, borderColor: "#FFE5B4" },
  negociaIcon: { fontSize: 32, marginRight: theme.spacing.md },
  negociaTextContainer: { flex: 1 },
  negociaTitle: { fontSize: theme.typography.sizes.body, fontWeight: theme.typography.weights.bold, color: "#FF9500" },
  negociaDesc: { fontSize: theme.typography.sizes.small, color: theme.colors.textSecondary },
  negociaArrow: { fontSize: 20, color: "#FF9500" },
  botaoSolicitar: { backgroundColor: theme.colors.primary, marginHorizontal: theme.spacing.lg, marginVertical: theme.spacing.lg, padding: theme.spacing.md, borderRadius: theme.borderRadius.medium, alignItems: "center" },
  botaoSolicitarText: { color: "#FFF", fontSize: theme.typography.sizes.body, fontWeight: theme.typography.weights.bold },
});