import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { theme } from "../theme";

export default function MenuPlaceholderScreen({ navigation, route }) {
  const { titulo = "Avity", descricao = "Tela em construção." } = route.params || {};

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>← Voltar</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.title}>{titulo}</Text>
        <Text style={styles.description}>{descricao}</Text>
        <Text style={styles.status}>Em breve</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 20,
  },
  backButton: {
    marginBottom: 20,
    paddingVertical: 8,
  },
  backText: {
    color: theme.colors.primary,
    fontWeight: "900",
    fontSize: 15,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#111827",
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    lineHeight: 20,
  },
  status: {
    marginTop: 20,
    alignSelf: "flex-start",
    backgroundColor: "#EEF2FF",
    color: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    fontWeight: "900",
  },
});