import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as Location from "expo-location";
import { theme } from "../theme";

// Academias fake (depois substituir por API)
const academiasDisponiveis = [
  {
    id: "1",
    name: "Smart Fit",
    category: "Academia",
    rating: 4.8,
    reviews: 1250,
    latitude: -25.532,
    longitude: -49.202,
    address: "Av. Rui Barbosa, 123 - Centro",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200",
    distance: null,
    modalities: ["Musculação", "Cardio", "Jump", "Spinning"],
  },
  {
    id: "2",
    name: "Bluefit",
    category: "Academia",
    rating: 4.6,
    reviews: 890,
    latitude: -25.528,
    longitude: -49.208,
    address: "Rua XV de Novembro, 500 - Centro",
    image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=200",
    distance: null,
    modalities: ["Musculação", "Cardio", "Yoga", "Pilates"],
  },
  {
    id: "3",
    name: "Studio Pilates",
    category: "Pilates",
    rating: 4.9,
    reviews: 320,
    latitude: -25.536,
    longitude: -49.210,
    address: "Rua das Flores, 789 - Jardim",
    image: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=200",
    distance: null,
    modalities: ["Pilates Solo", "Pilates Aparelho", "Pilates Dupla"],
  },
  {
    id: "4",
    name: "CrossFit Box",
    category: "CrossFit",
    rating: 4.7,
    reviews: 450,
    latitude: -25.525,
    longitude: -49.200,
    address: "Rua dos Esportes, 300 - Industrial",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=200",
    distance: null,
    modalities: ["CrossFit", "Funcional", "LPO", "Mobilidade"],
  },
  {
    id: "5",
    name: "Yoga Studio",
    category: "Yoga",
    rating: 4.9,
    reviews: 280,
    latitude: -25.540,
    longitude: -49.208,
    address: "Rua da Paz, 45 - Alto da XV",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200",
    distance: null,
    modalities: ["Hatha Yoga", "Vinyasa", "Yin Yoga", "Meditação"],
  },
  {
    id: "6",
    name: "Bodytech",
    category: "Academia Premium",
    rating: 4.9,
    reviews: 2100,
    latitude: -25.545,
    longitude: -49.215,
    address: "Av. das Torres, 1000 - Água Verde",
    image: "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=200",
    distance: null,
    modalities: ["Musculação", "Cardio", "Piscina", "Spinning", "Yoga", "Pilates"],
  },
];

export default function EscolherAcademiaScreen({ route, navigation }) {
  const { plano } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [academias, setAcademias] = useState([]);
  const [selectedAcademia, setSelectedAcademia] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    getLocationAndAcademias();
  }, []);

  const getLocationAndAcademias = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLoading(false);
        setAcademias(academiasDisponiveis);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location.coords);
      
      const academiasComDistancia = academiasDisponiveis.map(academia => {
        const distance = calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          academia.latitude,
          academia.longitude
        );
        return { ...academia, distance: distance.toFixed(1) };
      });
      
      academiasComDistancia.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
      setAcademias(academiasComDistancia);
    } catch (error) {
      setAcademias(academiasDisponiveis);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleConfirmarAcademia = () => {
    if (!selectedAcademia) {
      Alert.alert("Atenção", "Escolha uma academia para continuar.");
      return;
    }

    Alert.alert(
      "Confirmar academia",
      `Deseja escolher ${selectedAcademia.name} para usar seus créditos?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: () => {
            navigation.replace("Confirmacao", {
              plano: plano,
              academia: selectedAcademia,
            });
          },
        },
      ]
    );
  };

  const handleNenhumaAcademia = () => {
    Alert.alert(
      "Nenhuma academia encontrada",
      "Não encontramos academias próximas à sua localização. Deseja solicitar o estorno do valor pagado?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Solicitar estorno",
          style: "destructive",
          onPress: () => {
            navigation.replace("Home", {
              message: "Solicitação de estorno registrada. O valor será devolvido em até 5 dias úteis.",
            });
          },
        },
      ]
    );
  };

  const renderAcademiaItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.academiaCard,
        selectedAcademia?.id === item.id && styles.academiaCardSelected,
      ]}
      onPress={() => setSelectedAcademia(item)}
    >
      <Image source={{ uri: item.image }} style={styles.academiaImage} />
      <View style={styles.academiaInfo}>
        <Text style={styles.academiaName}>{item.name}</Text>
        <Text style={styles.academiaCategory}>{item.category}</Text>
        <View style={styles.academiaRating}>
          <Text style={styles.ratingStar}>⭐</Text>
          <Text style={styles.ratingValue}>{item.rating}</Text>
          <Text style={styles.ratingCount}>({item.reviews})</Text>
          <Text style={styles.separator}>•</Text>
          <Text style={styles.distance}>📍 {item.distance} km</Text>
        </View>
        <Text style={styles.academiaAddress}>{item.address}</Text>
        <View style={styles.modalitiesContainer}>
          {item.modalities.slice(0, 3).map((mod, idx) => (
            <View key={idx} style={styles.modalityTag}>
              <Text style={styles.modalityText}>{mod}</Text>
            </View>
          ))}
        </View>
      </View>
      {selectedAcademia?.id === item.id && (
        <View style={styles.selectedBadge}>
          <Text style={styles.selectedBadgeText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#005C4A" />
        <Text style={styles.loadingText}>Buscando academias próximas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Escolha sua academia</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Resumo do plano */}
        <View style={styles.resumoCard}>
          <Text style={styles.resumoTitle}>Plano contratado</Text>
          <Text style={styles.resumoPlano}>{plano?.nome} - R$ {plano?.preco}/mês</Text>
          <Text style={styles.resumoCreditos}>{plano?.creditos} créditos por mês</Text>
        </View>

        {/* Lista de academias */}
        {academias.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>
              🏋️ Academias próximas a você ({academias.length})
            </Text>
            <FlatList
              data={academias}
              keyExtractor={(item) => item.id}
              renderItem={renderAcademiaItem}
              scrollEnabled={false}
              contentContainerStyle={styles.listContent}
            />
            
            <TouchableOpacity style={styles.confirmarButton} onPress={handleConfirmarAcademia}>
              <Text style={styles.confirmarButtonText}>Confirmar academia</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏋️</Text>
            <Text style={styles.emptyText}>Nenhuma academia encontrada</Text>
            <Text style={styles.emptySub}>Não encontramos academias próximas à sua localização.</Text>
            <TouchableOpacity style={styles.estornarButton} onPress={handleNenhumaAcademia}>
              <Text style={styles.estornarButtonText}>Solicitar estorno do valor</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 14, color: "#888" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  backText: { fontSize: 24, color: "#005C4A" },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#1A1A1A" },

  resumoCard: {
    backgroundColor: "#005C4A",
    margin: 20,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  resumoTitle: { fontSize: 12, color: "#FFFFFFB3", marginBottom: 4 },
  resumoPlano: { fontSize: 18, fontWeight: "700", color: "#FFF", marginBottom: 4 },
  resumoCreditos: { fontSize: 13, color: "#FFFFFFB3" },

  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1A1A1A", marginHorizontal: 20, marginBottom: 16 },

  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  academiaCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#F0F0F0",
    position: "relative",
  },
  academiaCardSelected: { borderColor: "#005C4A", borderWidth: 2, backgroundColor: "#005C4A08" },
  academiaImage: { width: 110, height: 110 },
  academiaInfo: { flex: 1, padding: 12 },
  academiaName: { fontSize: 16, fontWeight: "700", color: "#1A1A1A", marginBottom: 4 },
  academiaCategory: { fontSize: 12, color: "#888", marginBottom: 6 },
  academiaRating: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  ratingStar: { fontSize: 11, marginRight: 2 },
  ratingValue: { fontSize: 12, fontWeight: "600", color: "#1A1A1A", marginRight: 4 },
  ratingCount: { fontSize: 11, color: "#888" },
  separator: { fontSize: 12, color: "#CCC", marginHorizontal: 4 },
  distance: { fontSize: 11, color: "#888" },
  academiaAddress: { fontSize: 11, color: "#888", marginBottom: 8 },
  modalitiesContainer: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  modalityTag: { backgroundColor: "#F0F0F0", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  modalityText: { fontSize: 9, color: "#666" },
  selectedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#005C4A",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedBadgeText: { color: "#FFF", fontSize: 14, fontWeight: "700" },

  confirmarButton: {
    backgroundColor: "#005C4A",
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
  },
  confirmarButtonText: { color: "#FFF", fontSize: 16, fontWeight: "600" },

  emptyContainer: { alignItems: "center", paddingVertical: 40, marginHorizontal: 20 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: "600", color: "#1A1A1A", marginBottom: 8 },
  emptySub: { fontSize: 13, color: "#888", textAlign: "center", marginBottom: 24 },
  estornarButton: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E53935",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
  },
  estornarButtonText: { color: "#E53935", fontSize: 14, fontWeight: "600" },
});