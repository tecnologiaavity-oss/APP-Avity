import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { theme } from "../theme";

export default function CustomDrawer({ navigation }) {
  const { user } = useAuth();

  const nome = user?.nome || "Paciente";

  const MenuItem = ({ label }) => (
    <TouchableOpacity style={styles.item}>
      <Text style={styles.itemText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      
      {/* PERFIL */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>

        <Text style={styles.nome}>{nome}</Text>
        <Text style={styles.email}>Conta Avity</Text>
      </View>

      {/* PRINCIPAL */}
      <View style={styles.section}>
        <MenuItem label="📋 Atividades" />
        <MenuItem label="💬 Mensagens" />
        <MenuItem label="🛟 Suporte Avity" />
        <MenuItem label="💳 Métodos de pagamento" />
        <MenuItem label="⚙️ Configurações" />
      </View>

      {/* PARCERIAS */}
      <View style={styles.section}>
        <MenuItem label="🎁 Convide amigos" />
        <MenuItem label="🤝 Seja parceiro da Avity" />
        <MenuItem label="🏥 Convide clínicas" />
        <MenuItem label="🏷️ Descontos" />
      </View>

      {/* PRODUTOS */}
      <View style={styles.section}>
        <MenuItem label="👨‍👩‍👧 Avity Família" />
        <MenuItem label="🏢 Avity para empresas" />
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },

  header: {
    backgroundColor: theme.colors.primary,
    padding: 24,
    alignItems: "center",
  },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  avatarText: {
    fontSize: 32,
    color: "#FFF",
  },

  nome: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },

  email: {
    fontSize: 13,
    color: "#E5E7EB",
  },

  section: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#EEE",
  },

  item: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },

  itemText: {
    fontSize: 15,
    color: "#111827",
  },
});