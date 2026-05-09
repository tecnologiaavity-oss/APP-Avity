import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";

export default function MapaDigital({ location, endereco }) {
  const pulse = useRef(new Animated.Value(1)).current;

  const latitude = location?.latitude || -23.5505;
  const longitude = location?.longitude || -46.6333;

  const rua =
    endereco?.street ||
    endereco?.name ||
    endereco?.district ||
    "Rua próxima";

  const bairro =
    endereco?.district ||
    endereco?.subregion ||
    "Região atual";

  const cidade =
    endereco?.city ||
    endereco?.subregion ||
    endereco?.region ||
    "Sua cidade";

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.08,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const clinicas = [
    { id: 1, top: 44, left: 42, icon: "🏥" },
    { id: 2, top: 92, right: 46, icon: "🦷" },
    { id: 3, bottom: 38, left: 105, icon: "👨‍⚕️" },
    { id: 4, bottom: 62, right: 96, icon: "💊" },
    { id: 5, top: 120, left: 160, icon: "🧪" },
  ];

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.mapFake} pointerEvents="none">
        <Text style={styles.mapTitle}>Mapa Avity</Text>

        <Text style={styles.mapSubtitle}>
          {location ? `${bairro} • ${cidade}` : "Localizando..."}
        </Text>

        <View style={[styles.road, styles.roadOne]}>
          <Text style={styles.roadLabel}>{rua}</Text>
        </View>

        <View style={[styles.road, styles.roadTwo]}>
          <Text style={styles.roadLabel}>Av. Saúde</Text>
        </View>

        <View style={[styles.road, styles.roadThree]}>
          <Text style={styles.roadLabelVertical}>Rua das Clínicas</Text>
        </View>

        <View style={[styles.roadThin, styles.roadFour]} />
        <View style={[styles.roadThin, styles.roadFive]} />

        {clinicas.map((c) => (
          <Animated.View
            key={c.id}
            style={[styles.clinicPin, { transform: [{ scale: pulse }] }, c]}
            pointerEvents="none"
          >
            <Text style={styles.pinText}>{c.icon}</Text>
          </Animated.View>
        ))}

        <Animated.View
          style={[styles.searchRadius, { transform: [{ scale: pulse }] }]}
          pointerEvents="none"
        />

        <View style={styles.userPin} pointerEvents="none">
          <Text style={styles.userPinText}>📍</Text>
        </View>

        <View style={styles.addressBadge} pointerEvents="none">
          <Text style={styles.addressTitle}>Você está perto de</Text>
          <Text style={styles.addressText} numberOfLines={1}>
            {rua}, {bairro}
          </Text>
        </View>

        <View style={styles.statusBadge} pointerEvents="none">
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Clínicas próximas</Text>
        </View>

        <View style={styles.coordsBadge} pointerEvents="none">
          <Text style={styles.coordsText}>
            {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 260,
    width: "100%",
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#EEF2F7",
  },

  mapFake: {
    flex: 1,
    backgroundColor: "#EEF2F7",
  },

  mapTitle: {
    position: "absolute",
    top: 14,
    left: 16,
    zIndex: 20,
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
    backgroundColor: "rgba(255,255,255,0.94)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },

  mapSubtitle: {
    position: "absolute",
    top: 52,
    left: 16,
    zIndex: 20,
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    maxWidth: 240,
  },

  road: {
    position: "absolute",
    height: 22,
    borderRadius: 999,
    backgroundColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },

  roadThin: {
    position: "absolute",
    height: 10,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
  },

  roadOne: {
    width: 380,
    top: 80,
    left: -48,
    transform: [{ rotate: "-18deg" }],
  },

  roadTwo: {
    width: 340,
    top: 160,
    right: -55,
    transform: [{ rotate: "23deg" }],
  },

  roadThree: {
    width: 290,
    top: 122,
    left: 45,
    transform: [{ rotate: "90deg" }],
  },

  roadFour: {
    width: 240,
    top: 40,
    right: -40,
    transform: [{ rotate: "35deg" }],
  },

  roadFive: {
    width: 220,
    bottom: 44,
    left: -30,
    transform: [{ rotate: "-35deg" }],
  },

  roadLabel: {
    fontSize: 9,
    color: "#6B7280",
    fontWeight: "800",
  },

  roadLabelVertical: {
    fontSize: 9,
    color: "#6B7280",
    fontWeight: "800",
  },

  searchRadius: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 130,
    height: 130,
    marginLeft: -65,
    marginTop: -65,
    borderRadius: 65,
    backgroundColor: "rgba(17,24,39,0.06)",
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.1)",
  },

  clinicPin: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    zIndex: 10,
  },

  pinText: {
    fontSize: 20,
  },

  userPin: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 52,
    height: 52,
    marginLeft: -26,
    marginTop: -26,
    borderRadius: 26,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#FFF",
    zIndex: 15,
  },

  userPinText: {
    fontSize: 22,
  },

  addressBadge: {
    position: "absolute",
    left: 14,
    bottom: 42,
    maxWidth: 210,
    backgroundColor: "rgba(255,255,255,0.94)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
    zIndex: 20,
  },

  addressTitle: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "800",
  },

  addressText: {
    fontSize: 11,
    color: "#111827",
    fontWeight: "900",
    marginTop: 2,
  },

  coordsBadge: {
    position: "absolute",
    left: 14,
    bottom: 14,
    backgroundColor: "rgba(17,24,39,0.88)",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },

  coordsText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700",
  },

  statusBadge: {
    position: "absolute",
    right: 14,
    bottom: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.94)",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22C55E",
    marginRight: 6,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#111827",
  },
});