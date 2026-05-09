import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import * as Location from "expo-location";

const fakeClinics = [
  {
    id: 1,
    name: "Clínica Sorriso Prime",
    specialty: "Odontologia",
    rating: 4.9,
    distance: "1.4 km",
    eta: "8 min",
    address: "Rua XV de Novembro, Centro",
  },
  {
    id: 2,
    name: "Avity Clínica Saúde",
    specialty: "Clínico Geral",
    rating: 4.8,
    distance: "2.1 km",
    eta: "12 min",
    address: "Av. das Torres",
  },
  {
    id: 3,
    name: "Centro Médico Bem Viver",
    specialty: "Check-up",
    rating: 4.7,
    distance: "3.2 km",
    eta: "16 min",
    address: "Rua Marechal Deodoro",
  },
];

export default function SearchingClinicScreen({ navigation }) {
  const [status, setStatus] = useState("searching");
  const [matchedClinic, setMatchedClinic] = useState(null);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    const clinicTimer = setTimeout(() => {
      setMatchedClinic(fakeClinics[0]);
      setStatus("accepted");
    }, 6000);

    return () => {
      clearInterval(timer);
      clearTimeout(clinicTimer);
    };
  }, []);

  function handleSchedule() {
    alert("Clínica aceita. Próximo passo: tela de agendamento.");
  }

  function handleCancel() {
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <View style={styles.map}>
        <Text style={styles.mapText}>Mapa carregando...</Text>
      </View>

      <ScrollView style={styles.panel}>
        {status === "searching" && (
          <>
            <View style={styles.center}>
              <ActivityIndicator size="large" />
              <Text style={styles.title}>Procurando clínica...</Text>
              <Text style={styles.subtitle}>
                Tempo: {seconds}s
              </Text>
            </View>

            {fakeClinics.map((clinic) => (
              <View key={clinic.id} style={styles.card}>
                <Text style={styles.name}>{clinic.name}</Text>
                <Text>{clinic.specialty}</Text>
                <Text>{clinic.distance} • {clinic.eta}</Text>
              </View>
            ))}
          </>
        )}

        {status === "accepted" && matchedClinic && (
          <>
            <Text style={styles.title}>Clínica encontrada</Text>

            <View style={styles.card}>
              <Text style={styles.name}>{matchedClinic.name}</Text>
              <Text>{matchedClinic.specialty}</Text>
              <Text>{matchedClinic.distance} • {matchedClinic.eta}</Text>
              <Text>{matchedClinic.address}</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSchedule}>
              <Text style={styles.buttonText}>Agendar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleCancel}>
              <Text style={styles.cancel}>Cancelar</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  map: {
    height: 200,
    backgroundColor: "#DDE7F3",
    justifyContent: "center",
    alignItems: "center",
  },
  mapText: { color: "#333" },
  panel: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  center: { alignItems: "center", marginBottom: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginTop: 10 },
  subtitle: { color: "#666", marginTop: 5 },
  card: {
    backgroundColor: "#F9FAFB",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  name: { fontWeight: "bold", fontSize: 16 },
  button: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: { color: "#fff", textAlign: "center" },
  cancel: {
    textAlign: "center",
    marginTop: 15,
    color: "red",
  },
});