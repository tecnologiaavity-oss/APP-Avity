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
  TextInput,
  Alert,
} from "react-native";
import * as Location from "expo-location";
import { theme } from "../theme";

// Academias e estúdios fake
const estabelecimentos = [
  {
    id: "1",
    name: "Smart Fit",
    category: "Academia",
    subcategory: "CrossFit • Funcional • Combate",
    rating: 4.8,
    reviews: 1250,
    latitude: -25.532,
    longitude: -49.202,
    address: "Av. Rui Barbosa, 123 - Centro",
    cep: "83005-001",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200",
    hours: "05:00 - 23:00",
    planoMinimo: "Basic",
    precoMinimo: 69.90,
    planosPermitidos: ["starter", "basic", "silver", "gold", "premium"],
  },
  {
    id: "2",
    name: "Bluefit",
    category: "Academia",
    subcategory: "Fitness • Treinamento Funcional • Musculação",
    rating: 4.7,
    reviews: 890,
    latitude: -25.528,
    longitude: -49.208,
    address: "Rua XV de Novembro, 500 - Centro",
    cep: "83005-010",
    image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=200",
    hours: "06:00 - 23:00",
    planoMinimo: "Basic",
    precoMinimo: 69.90,
    planosPermitidos: ["starter", "basic", "silver", "gold", "premium"],
  },
  {
    id: "3",
    name: "Studio Pilates",
    category: "Pilates",
    subcategory: "Pilates Solo • Pilates Aparelho",
    rating: 4.9,
    reviews: 320,
    latitude: -25.536,
    longitude: -49.210,
    address: "Rua das Flores, 789 - Jardim",
    cep: "83005-020",
    image: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=200",
    hours: "07:00 - 21:00",
    planoMinimo: "Silver",
    precoMinimo: 99.90,
    planosPermitidos: ["silver", "gold", "premium"],
  },
  {
    id: "4",
    name: "CrossFit Box",
    category: "CrossFit",
    subcategory: "CrossFit • LPO • Mobilidade",
    rating: 4.7,
    reviews: 450,
    latitude: -25.525,
    longitude: -49.200,
    address: "Rua dos Esportes, 300",
    cep: "83005-030",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=200",
    hours: "06:00 - 21:00",
    planoMinimo: "Basic",
    precoMinimo: 69.90,
    planosPermitidos: ["starter", "basic", "silver", "gold", "premium"],
  },
  {
    id: "5",
    name: "Yoga Studio Zen",
    category: "Yoga",
    subcategory: "Hatha Yoga • Vinyasa • Meditação",
    rating: 4.9,
    reviews: 280,
    latitude: -25.540,
    longitude: -49.208,
    address: "Rua da Paz, 45 - Alto da XV",
    cep: "83005-040",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200",
    hours: "07:00 - 20:00",
    planoMinimo: "Silver",
    precoMinimo: 99.90,
    planosPermitidos: ["silver", "gold", "premium"],
  },
];

const categorias = [
  { id: "todos", nome: "Todos", icone: "🏠" },
  { id: "Academia", nome: "Academia", icone: "💪" },
  { id: "Pilates", nome: "Pilates", icone: "🧘" },
  { id: "Yoga", nome: "Yoga", icone: "🕉️" },
  { id: "CrossFit", nome: "CrossFit", icone: "🏋️" },
];

export default function AcademiasScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [searchText, setSearchText] = useState("");
  const [estabelecimentosList, setEstabelecimentosList] = useState([]);
  const [searchingByCep, setSearchingByCep] = useState(false);

  useEffect(() => {
    getLocationAndEstablishments();
  }, []);

  const getLocationAndEstablishments = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLoading(false);
        setEstabelecimentosList(estabelecimentos);
        return;
      }

      const userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation.coords);
      
      const estabelecimentosComDistancia = estabelecimentos.map(item => {
        const distance = calculateDistance(
          userLocation.coords.latitude,
          userLocation.coords.longitude,
          item.latitude,
          item.longitude
        );
        return { ...item, distance: distance.toFixed(1) };
      });
      
      estabelecimentosComDistancia.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
      setEstabelecimentosList(estabelecimentosComDistancia);
    } catch (error) {
      setEstabelecimentosList(estabelecimentos);
    } finally {
      setLoading(false);
    }
  };

  const buscarPorCep = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) {
      Alert.alert("CEP inválido", "Digite um CEP com 8 dígitos.");
      return;
    }

    setSearchingByCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        Alert.alert("CEP não encontrado", "Verifique o CEP digitado.");
        return;
      }

      // Buscar academias pelo CEP (simulação)
      const academiasFiltradas = estabelecimentos.filter(item => 
        item.cep.replace(/\D/g, "") === cepLimpo
      );
      
      if (academiasFiltradas.length > 0) {
        setEstabelecimentosList(academiasFiltradas);
      } else {
        Alert.alert("Nenhuma academia encontrada", `Não encontramos academias no CEP ${cep}`);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível buscar o CEP.");
    } finally {
      setSearchingByCep(false);
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

  const filteredEstabelecimentos = estabelecimentosList.filter((item) => {
    if (selectedCategory !== "todos" && item.category !== selectedCategory) {
      return false;
    }
    if (searchText && !item.name.toLowerCase().includes(searchText.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleSelectEstabelecimento = (estabelecimento) => {
    navigation.navigate("PlanosAvity", { academia: estabelecimento });
  };

  const renderEstabelecimentoItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleSelectEstabelecimento(item)}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardName}>{item.name}</Text>
          {item.distance && (
            <View style={styles.distanceBadge}>
              <Text style={styles.distanceText}>{item.distance} km</Text>
            </View>
          )}
        </View>
        <Text style={styles.cardHours}>🕐 {item.hours}</Text>
        <Text style={styles.cardCategory}>{item.subcategory}</Text>
        <View style={styles.cardFooter}>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingStar}>⭐</Text>
            <Text style={styles.ratingValue}>{item.rating}</Text>
          </View>
          <Text style={styles.cardPrice}>
            A partir do plano {item.planoMinimo} - R$ {item.precoMinimo}/mês
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#005C4A" />
        <Text style={styles.loadingText}>Buscando estabelecimentos próximos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Avity Life</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>💪 Explore suas opções</Text>
          <Text style={styles.bannerSub}>por atividades populares</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categorias.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryChip, selectedCategory === cat.id && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text style={styles.categoryIcon}>{cat.icone}</Text>
              <Text style={[styles.categoryText, selectedCategory === cat.id && styles.categoryTextActive]}>
                {cat.nome}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Busca por Nome ou CEP */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Procurar por nome ou CEP..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
            onSubmitEditing={() => {
              if (searchText.replace(/\D/g, "").length === 8) {
                buscarPorCep(searchText);
              }
            }}
          />
          {searchText.replace(/\D/g, "").length === 8 && (
            <TouchableOpacity onPress={() => buscarPorCep(searchText)} style={styles.searchCepButton}>
              <Text style={styles.searchCepButtonText}>Buscar CEP</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.sectionTitle}>
          Parceiros Avity Life em São José dos Pinhais, PR
        </Text>

        <FlatList
          data={filteredEstabelecimentos}
          keyExtractor={(item) => item.id}
          renderItem={renderEstabelecimentoItem}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🏋️</Text>
              <Text style={styles.emptyText}>Nenhum estabelecimento encontrado</Text>
              <Text style={styles.emptySub}>Tente outra categoria ou busca</Text>
            </View>
          }
        />

        <View style={styles.appsCard}>
          <Text style={styles.appsTitle}>📱 E você ainda conta com apps de bem-estar!</Text>
          <Text style={styles.appsSub}>
            De Strava a Headspace, descubra os melhores apps para cuidar da saúde, do corpo e da mente.
          </Text>
          <TouchableOpacity style={styles.appsButton}>
            <Text style={styles.appsButtonText}>Ver todos os apps →</Text>
          </TouchableOpacity>
        </View>

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

  banner: {
    backgroundColor: "#005C4A",
    margin: 20,
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
  },
  bannerTitle: { fontSize: 20, fontWeight: "700", color: "#FFF", marginBottom: 4 },
  bannerSub: { fontSize: 13, color: "#FFFFFFB3" },

  categoriesContainer: { marginBottom: 8 },
  categoriesContent: { paddingHorizontal: 20, gap: 12 },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 30,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E8ECF0",
    gap: 6,
  },
  categoryChipActive: { backgroundColor: "#005C4A", borderColor: "#005C4A" },
  categoryIcon: { fontSize: 14 },
  categoryText: { fontSize: 13, color: "#666" },
  categoryTextActive: { color: "#FFF", fontWeight: "600" },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#E8ECF0",
  },
  searchIcon: { fontSize: 16, marginRight: 12, color: "#888" },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: "#1A1A1A" },
  searchCepButton: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "#005C4A", borderRadius: 20 },
  searchCepButtonText: { color: "#FFF", fontSize: 12, fontWeight: "600" },

  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1A1A1A", marginHorizontal: 20, marginBottom: 16 },

  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  cardImage: { width: 100, height: 100 },
  cardContent: { flex: 1, padding: 12 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  cardName: { fontSize: 15, fontWeight: "700", color: "#1A1A1A", flex: 1 },
  distanceBadge: { backgroundColor: "#F0F0F0", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  distanceText: { fontSize: 10, color: "#666" },
  cardHours: { fontSize: 11, color: "#888", marginBottom: 4 },
  cardCategory: { fontSize: 11, color: "#888", marginBottom: 8 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" },
  ratingContainer: { flexDirection: "row", alignItems: "center" },
  ratingStar: { fontSize: 10, marginRight: 2 },
  ratingValue: { fontSize: 11, fontWeight: "600", color: "#1A1A1A" },
  cardPrice: { fontSize: 10, color: "#005C4A", fontWeight: "600" },

  emptyContainer: { alignItems: "center", paddingVertical: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: "600", color: "#1A1A1A", marginBottom: 4 },
  emptySub: { fontSize: 13, color: "#888" },

  appsCard: {
    backgroundColor: "#FFF",
    margin: 20,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8ECF0",
  },
  appsTitle: { fontSize: 15, fontWeight: "700", color: "#1A1A1A", marginBottom: 8 },
  appsSub: { fontSize: 12, color: "#888", marginBottom: 16, lineHeight: 18 },
  appsButton: { alignSelf: "flex-start" },
  appsButtonText: { fontSize: 13, color: "#005C4A", fontWeight: "600" },
});