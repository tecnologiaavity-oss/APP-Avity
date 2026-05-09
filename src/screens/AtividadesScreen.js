import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useActivities } from "../context/ActivityContext";

export default function AtividadesScreen({ navigation }) {
  const { activities } = useActivities();

  const proximas = activities.filter((item) => item.status === "scheduled");
  const historico = activities.filter((item) => item.status !== "scheduled");

  function getStatusLabel(status) {
    if (status === "scheduled") return "Agendada";
    if (status === "completed") return "Concluída";
    if (status === "canceled") return "Cancelada";
    return "Atividade";
  }

  function renderActivity(item) {
    return (
      <View key={item.id} style={styles.activityCard}>
        <View style={styles.cardTop}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>🏥</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.clinicName}>{item.clinicName}</Text>
            <Text style={styles.specialty}>{item.specialty}</Text>
          </View>

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <View style={styles.row}>
            <Text style={styles.muted}>Data e horário</Text>
            <Text style={styles.strong}>{item.date}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.muted}>Pagamento</Text>
            <Text style={styles.strong}>{item.paymentMethod || "Confirmado"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.muted}>Valor</Text>
            <Text style={styles.price}>
              R$ {Number(item.price || 0).toFixed(2).replace(".", ",")}
            </Text>
          </View>

          {!!item.address && (
            <View style={styles.addressBox}>
              <Text style={styles.addressLabel}>Endereço</Text>
              <Text style={styles.address}>{item.address}</Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <View>
          <Text style={styles.title}>Atividades</Text>
          <Text style={styles.subtitle}>Acompanhe seus agendamentos e histórico.</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {activities.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Nenhuma atividade ainda</Text>
            <Text style={styles.emptyText}>
              Quando você confirmar uma consulta, ela aparecerá aqui.
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate("Home")}
            >
              <Text style={styles.primaryButtonText}>Solicitar atendimento</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Resumo</Text>
              <Text style={styles.summaryTitle}>
                {activities.length} atividade{activities.length > 1 ? "s" : ""} na sua conta
              </Text>
              <Text style={styles.summarySub}>
                Consultas, agendamentos e atendimentos ficam organizados aqui.
              </Text>
            </View>

            {proximas.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Próximas</Text>
                {proximas.map(renderActivity)}
              </View>
            )}

            {historico.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Histórico</Text>
                {historico.map(renderActivity)}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 20,
  },
  header: {
    marginTop: 28,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    fontSize: 34,
    color: "#111827",
    marginTop: -3,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#111827",
  },
  subtitle: {
    color: "#667085",
    fontSize: 14,
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    padding: 28,
    alignItems: "center",
    marginTop: 40,
  },
  emptyIcon: {
    fontSize: 42,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#111827",
    textAlign: "center",
  },
  emptyText: {
    color: "#667085",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: "#111827",
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 22,
    width: "100%",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 15,
  },
  summaryCard: {
    backgroundColor: "#111827",
    borderRadius: 30,
    padding: 22,
    marginBottom: 22,
  },
  summaryLabel: {
    color: "#A7F3D0",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 6,
  },
  summaryTitle: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "900",
  },
  summarySub: {
    color: "#D1D5DB",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 12,
  },
  activityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 18,
    marginBottom: 14,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F2F4F7",
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 22,
  },
  clinicName: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111827",
  },
  specialty: {
    color: "#667085",
    fontSize: 13,
    marginTop: 3,
  },
  statusBadge: {
    backgroundColor: "#EEF4FF",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  statusText: {
    color: "#3538CD",
    fontSize: 12,
    fontWeight: "900",
  },
  infoBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 22,
    padding: 14,
    marginTop: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 9,
  },
  muted: {
    color: "#667085",
    fontSize: 13,
  },
  strong: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "800",
    flex: 1,
    textAlign: "right",
  },
  price: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "900",
  },
  addressBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 12,
    marginTop: 14,
  },
  addressLabel: {
    color: "#667085",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 4,
  },
  address: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
  },
});