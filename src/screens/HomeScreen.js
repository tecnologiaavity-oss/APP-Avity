import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  Image,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import MapaDigital from "../components/MapaDigital";
import * as Location from "expo-location";

const { width } = Dimensions.get("window");
const bannerWidth = width - 32;

const especialidades = [
  { id: "clinico", nome: "Clínico Geral", icone: "👨‍⚕️", preco: 35 },
  { id: "cardio", nome: "Cardiologia", icone: "❤️", preco: 60 },
  { id: "dermato", nome: "Dermatologia", icone: "🧴", preco: 55 },
  { id: "pediatra", nome: "Pediatria", icone: "👶", preco: 50 },
  { id: "oftalmo", nome: "Oftalmologia", icone: "👁️", preco: 65 },
  { id: "dentista", nome: "Dentista Geral", icone: "🦷", preco: 40 },
  { id: "psicologia", nome: "Psicologia", icone: "🧠", preco: 50 },
  { id: "nutricao", nome: "Nutrição", icone: "🥗", preco: 45 },
  { id: "exames", nome: "Exames", icone: "🧪", preco: 40 },
  { id: "pilates", nome: "Pilates", icone: "🧘", preco: 35 },
  { id: "academia", nome: "Academia", icone: "🏋️", preco: 30 },
  { id: "massagem", nome: "Massoterapia", icone: "💆", preco: 45 },
];

const banners = [
  {
    id: "1",
    titulo: "🔥 Atendimento imediato",
    descricao: "Sem fila",
    imagem: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500",
  },
  {
    id: "2",
    titulo: "💸 Economize até 70%",
    descricao: "Planos a partir de R$30",
    imagem: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500",
  },
  {
    id: "3",
    titulo: "🧘 Saúde e bem-estar",
    descricao: "Consultas, exames, pilates e academia",
    imagem: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500",
  },
];

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const flatListRef = useRef(null);

  const [bannerAtivo, setBannerAtivo] = useState(0);
  const [menuAberto, setMenuAberto] = useState(false);
  const [localizacao, setLocalizacao] = useState(null);
  const [enderecoAtual, setEnderecoAtual] = useState(null);
  const [busca, setBusca] = useState("");
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);

  // Auto-scroll dos banners usando FlatList
  useEffect(() => {
    const interval = setInterval(() => {
      const proximo = bannerAtivo === banners.length - 1 ? 0 : bannerAtivo + 1;
      flatListRef.current?.scrollToIndex({
        index: proximo,
        animated: true,
      });
      setBannerAtivo(proximo);
    }, 4000);
    return () => clearInterval(interval);
  }, [bannerAtivo]);

  useEffect(() => {
    async function pegarLocalizacao() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const location = await Location.getCurrentPositionAsync({});
      setLocalizacao({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      const endereco = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      if (endereco?.length > 0) setEnderecoAtual(endereco[0]);
    }
    pegarLocalizacao();
  }, []);

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

  const abrirMenuPlaceholder = (titulo, descricao) => {
    setMenuAberto(false);
    navigation.navigate("MenuPlaceholder", { titulo, descricao });
  };

  const abrirCarteira = () => {
    setMenuAberto(false);
    navigation.navigate("Carteira");
  };

  const irParaSelecao = (esp = null) => {
    if (esp) {
      navigation.navigate("Selecao", { especialidade: esp });
      return;
    }
    navigation.navigate("Selecao", { especialidade: busca });
  };

  const irParaAvityLife = () => {
    navigation.navigate("Academias");
  };

  const especialidadesFiltradas = especialidades.filter((esp) =>
    esp.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const renderBannerItem = ({ item }) => (
    <TouchableOpacity style={styles.bannerCard} activeOpacity={0.9}>
      <Image source={{ uri: item.imagem }} style={styles.bannerImage} />
      <View style={styles.bannerOverlay}>
        <Text style={styles.bannerTitle}>{item.titulo}</Text>
        <Text style={styles.bannerDesc}>{item.descricao}</Text>
        <View style={styles.saibaMaisBtn}>
          <Text style={styles.saibaMaisText}>Ver ofertas →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <SafeAreaView style={styles.safeHeader}>
          <View style={styles.header}>
            <Text style={styles.saudacao}>
              {getSaudacao()}, <Text style={styles.userName}>{capitalizarNome(user?.nome)}</Text>
            </Text>
            <TouchableOpacity onPress={() => setMenuAberto(true)} style={styles.avatarButton}>
              <Text style={styles.avatarText}>👤</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <View style={styles.searchArea}>
          <Text style={styles.searchTitle}>O que você precisa hoje?</Text>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              value={busca}
              onChangeText={(text) => {
                setBusca(text);
                setMostrarSugestoes(true);
              }}
              onFocus={() => setMostrarSugestoes(true)}
              placeholder="Buscar especialidade, exame, pilates..."
              placeholderTextColor="#9CA3AF"
              style={styles.searchInput}
              returnKeyType="search"
              onSubmitEditing={() => irParaSelecao()}
            />
          </View>
          {mostrarSugestoes && busca.length > 0 && (
            <View style={styles.searchDropdown}>
              {especialidadesFiltradas.slice(0, 5).map((esp) => (
                <TouchableOpacity
                  key={esp.id}
                  style={styles.searchItem}
                  onPress={() => irParaSelecao(esp)}
                >
                  <Text style={styles.searchItemIcon}>{esp.icone}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.searchItemName}>{esp.nome}</Text>
                    <Text style={styles.searchItemSub}>A partir de R$ {esp.preco}</Text>
                  </View>
                  <Text style={styles.searchItemArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.mapWrapper}>
          <MapaDigital location={localizacao} endereco={enderecoAtual} />
        </View>

        {/* Card Avity Life Premium */}
        <TouchableOpacity style={styles.avityLifeCard} onPress={irParaAvityLife}>
          <View style={styles.avityLifeCardLeft}>
            <View style={styles.avityLifeCardIcon}>
              <Text style={styles.avityLifeCardIconText}>💪</Text>
            </View>
            <View>
              <Text style={styles.avityLifeCardTitle}>Avity Life</Text>
              <Text style={styles.avityLifeCardSub}>Academias, Pilates, Yoga, Massagem e muito mais</Text>
            </View>
          </View>
          <Text style={styles.avityLifeCardArrow}>→</Text>
        </TouchableOpacity>

        <View style={styles.bannerHeader}>
          <Text style={styles.bannerHeaderTitle}>💰 Economize todos os dias</Text>
        </View>

        {/* Banners usando FlatList para scroll correto */}
        <View style={styles.carouselContainer}>
          <FlatList
            ref={flatListRef}
            data={banners}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={renderBannerItem}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / bannerWidth);
              setBannerAtivo(index);
            }}
            contentContainerStyle={{ gap: 0 }}
          />
          <View style={styles.dotsContainer}>
            {banners.map((_, index) => (
              <View key={index} style={[styles.dot, bannerAtivo === index && styles.dotActive]} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Especialidades</Text>
          <View style={styles.grid}>
            {especialidades.map((esp) => (
              <TouchableOpacity key={esp.id} style={styles.card} onPress={() => irParaSelecao(esp)}>
                <Text style={styles.cardIcon}>{esp.icone}</Text>
                <Text style={styles.cardNome}>{esp.nome}</Text>
                <Text style={styles.cardPreco}>R$ {esp.preco}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* MENU LATERAL */}
      <Modal visible={menuAberto} animationType="slide" transparent>
        <View style={styles.menuOverlay}>
          <View style={styles.menuContainer}>
            <View style={styles.menuTop}>
              <View style={styles.menuAvatarArea}>
                <Text style={styles.menuAvatarText}>👤</Text>
              </View>
              <View style={styles.menuUserInfo}>
                <Text style={styles.menuNome}>{capitalizarNome(user?.nome)}</Text>
                <Text style={styles.menuSub}>Conta Avity</Text>
                <TouchableOpacity
                  style={styles.editProfileButton}
                  onPress={() => {
                    setMenuAberto(false);
                    navigation.navigate("EditarInformacoes");
                  }}
                >
                  <Text style={styles.editProfileText}>Editar perfil</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => setMenuAberto(false)} style={styles.closeButton}>
                <Text style={styles.menuClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.walletPreview}>
              <View>
                <Text style={styles.walletLabel}>Carteira Avity</Text>
                <Text style={styles.walletValue}>R$ 0,00</Text>
                <Text style={styles.walletSub}>Saldo, cartões e reembolsos</Text>
              </View>
              <TouchableOpacity style={styles.walletButton} onPress={abrirCarteira}>
                <Text style={styles.walletButtonText}>Abrir</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.menuGroup}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuAberto(false);
                    navigation.navigate("EditarInformacoes");
                  }}
                >
                  <Text style={styles.menuItemText}>👤 Perfil</Text>
                  <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuAberto(false);
                    navigation.navigate("Atividades");
                  }}
                >
                  <Text style={styles.menuItemText}>📋 Atividades</Text>
                  <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => abrirMenuPlaceholder("Mensagens", "Converse com clínicas e suporte.")}
                >
                  <Text style={styles.menuItemText}>💬 Mensagens</Text>
                  <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => abrirMenuPlaceholder("Suporte", "Ajuda, atendimento e dúvidas frequentes.")}
                >
                  <Text style={styles.menuItemText}>🎧 Suporte</Text>
                  <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={abrirCarteira}>
                  <Text style={styles.menuItemText}>💳 Pagamentos</Text>
                  <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => abrirMenuPlaceholder("Configurações", "Preferências, notificações e segurança.")}
                >
                  <Text style={styles.menuItemText}>⚙️ Configurações</Text>
                  <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.menuGroup}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => abrirMenuPlaceholder("Convide amigos", "Indique amigos e ganhe benefícios.")}
                >
                  <Text style={styles.menuItemText}>🎁 Indicar amigos</Text>
                  <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => abrirMenuPlaceholder("Descontos", "Cupons e promoções disponíveis.")}
                >
                  <Text style={styles.menuItemText}>🏷️ Cupons</Text>
                  <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => abrirMenuPlaceholder("Convide clínicas", "Traga clínicas para a Avity.")}
                >
                  <Text style={styles.menuItemText}>🏥 Para clínicas</Text>
                  <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.logoutButton}
                onPress={async () => {
                  setMenuAberto(false);
                  await logout();
                }}
              >
                <Text style={styles.logoutText}>Sair da conta</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8F9FA" },
  container: { flex: 1 },

  safeHeader: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  saudacao: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "500",
  },

  userName: {
    fontWeight: "bold",
    color: "#005C4A",
    fontSize: 18,
  },

  avatarButton: {
    backgroundColor: "#005C4A",
    padding: 10,
    borderRadius: 30,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#FFF",
    fontSize: 18,
  },

  searchArea: {
    marginHorizontal: 16,
    marginTop: -20,
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },

  searchTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#005C4A",
    marginBottom: 8,
  },

  searchBox: {
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    paddingHorizontal: 14,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
  },

  searchIcon: { fontSize: 18, marginRight: 10, color: "#9CA3AF" },
  searchInput: { flex: 1, color: "#111827", fontSize: 15 },
  searchDropdown: { marginTop: 12, borderTopWidth: 1, borderTopColor: "#F3F4F6" },
  searchItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  searchItemIcon: { fontSize: 24, marginRight: 12 },
  searchItemName: { fontSize: 14, fontWeight: "600", color: "#111827" },
  searchItemSub: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  searchItemArrow: { fontSize: 22, color: "#9CA3AF" },

  mapWrapper: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    overflow: "hidden",
    height: 200,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  // Card Avity Life Premium
  avityLifeCard: {
    backgroundColor: "#005C4A",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avityLifeCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  avityLifeCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF20",
    alignItems: "center",
    justifyContent: "center",
  },
  avityLifeCardIconText: { fontSize: 24 },
  avityLifeCardTitle: { fontSize: 18, fontWeight: "700", color: "#FFF" },
  avityLifeCardSub: { fontSize: 12, color: "#FFFFFFB3", marginTop: 2 },
  avityLifeCardArrow: { fontSize: 24, color: "#FFF", opacity: 0.8 },

  bannerHeader: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },

  bannerHeaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },

  carouselContainer: {
    marginHorizontal: 16,
  },
  
  bannerCard: {
    width: bannerWidth,
    height: 140,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 0,
  },
  
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#000000AA",
  },
  
  bannerTitle: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  
  bannerDesc: {
    color: "#FFF",
    fontSize: 12,
  },
  
  saibaMaisBtn: {
    marginTop: 8,
  },
  
  saibaMaisText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 11,
  },
  
  dotsContainer: { flexDirection: "row", justifyContent: "center", marginTop: 12, marginBottom: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#CCC", marginHorizontal: 4 },
  dotActive: { width: 20, backgroundColor: "#005C4A" },

  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12, color: "#1F2937" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  card: {
    width: "30%",
    padding: 12,
    backgroundColor: "#FFF",
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardIcon: { fontSize: 28, marginBottom: 6 },
  cardNome: { fontSize: 11, textAlign: "center", fontWeight: "600", color: "#374151", marginTop: 4 },
  cardPreco: { color: "#005C4A", fontWeight: "bold", marginTop: 6, fontSize: 12 },

  menuOverlay: { flex: 1, backgroundColor: "#00000080" },
  menuContainer: {
    width: "86%",
    height: "100%",
    backgroundColor: "#FFF",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 18,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
  },
  menuTop: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  menuAvatarArea: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#005C4A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  menuAvatarText: { fontSize: 28, color: "#FFF" },
  menuUserInfo: { flex: 1 },
  menuNome: { fontSize: 20, fontWeight: "bold", color: "#111827" },
  menuSub: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  editProfileButton: { marginTop: 6 },
  editProfileText: { color: "#005C4A", fontWeight: "600", fontSize: 12 },
  closeButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F3F4F6", justifyContent: "center", alignItems: "center" },
  menuClose: { fontSize: 24, color: "#111827", marginTop: -2 },
  walletPreview: {
    backgroundColor: "#005C4A",
    borderRadius: 24,
    padding: 18,
    marginBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  walletLabel: { color: "#FFF", fontSize: 11, fontWeight: "500", opacity: 0.9 },
  walletValue: { color: "#FFF", fontSize: 28, fontWeight: "bold", marginTop: 4 },
  walletSub: { color: "#FFF", fontSize: 11, marginTop: 4, opacity: 0.8 },
  walletButton: { backgroundColor: "#FFF", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 40 },
  walletButtonText: { fontWeight: "600", color: "#005C4A", fontSize: 13 },
  menuGroup: { marginBottom: 8 },
  menuItem: { paddingVertical: 14, paddingHorizontal: 0, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  menuItemText: { fontSize: 15, fontWeight: "500", color: "#111827" },
  menuArrow: { fontSize: 20, color: "#CCC" },
  logoutButton: { marginTop: 20, paddingVertical: 14, alignItems: "center" },
  logoutText: { color: "#EF4444", fontWeight: "600" },
});