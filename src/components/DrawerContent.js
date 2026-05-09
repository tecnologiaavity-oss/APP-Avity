import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useAuth } from "../context/AuthContext";
import { theme } from "../theme";

export default function DrawerContent({ navigation }) {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: "minhasConsultas", label: "Minhas Consultas", icon: "📋" },
    { id: "mensagens", label: "Mensagens", icon: "💬" },
    { id: "pagamentos", label: "Métodos de Pagamento", icon: "💳" },
    { id: "configuracoes", label: "Configurações", icon: "⚙️" },
    { id: "convidar", label: "Convidar Amigos", icon: "👥" },
    { id: "sejaClinica", label: "Seja uma Clínica Parceira", icon: "🏥" },
    { id: "cupons", label: "Cupons", icon: "🎫" },
    { id: "suporte", label: "Suporte Avity", icon: "❓" },
    { id: "sair", label: "Sair", icon: "🚪" },
  ];

  const handlePress = (id) => {
    if (id === "sair") {
      logout();
    } else {
      navigation.navigate(id);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <Text style={styles.userName}>{user?.nome || "Paciente"}</Text>
        <Text style={styles.userEmail}>{user?.email || "paciente@avity.com"}</Text>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => handlePress(item.id)}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: {
    padding: theme.spacing.lg,
    paddingTop: 48,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  avatarText: { fontSize: 36 },
  userName: { fontSize: 18, fontWeight: "bold", color: "#FFF" },
  userEmail: { fontSize: 12, color: "#FFF", opacity: 0.8, marginTop: 4 },
  menu: { paddingVertical: theme.spacing.md },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  menuIcon: { fontSize: 20, marginRight: theme.spacing.md },
  menuLabel: { fontSize: 16, color: theme.colors.textPrimary },
});