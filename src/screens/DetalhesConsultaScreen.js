import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
  FlatList,
  Linking,
} from "react-native";
import { useActivities } from "../context/ActivityContext";
import { theme } from "../theme";

export default function DetalhesConsultaScreen({ navigation, route }) {
  const { addActivity } = useActivities();

  // Dados do usuário logado (pegue do seu AuthContext)
  const pacienteAtual = {
    nomeCompleto: "Lucas Pereira da Silva",
    cpf: "123.456.789-00",
    email: "lucas@avity.com",
  };

  const clinic = route?.params?.clinic || {
    id: "CLI-001",
    name: "Clínica Sorriso Prime",
    type: "Odontologia",
    rating: 4.9,
    distance: "1.4 km",
    eta: "8 min",
    address: "Rua XV de Novembro, 820 - Centro",
    city: "São José dos Pinhais",
    state: "PR",
    zipCode: "83005-001",
    latitude: -25.535,
    longitude: -49.206,
    phone: "(41) 1234-5678",
    whatsapp: "(41) 91234-5678",
    email: "contato@sorrisoprime.com.br",
    hours: "Segunda a Sexta, 8h às 18h",
    cnpj: "12.345.678/0001-90",
  };

  const requestData = route?.params?.requestData || {
    specialty: "Consulta Odontológica",
    paymentMethod: "Pagamento confirmado",
    price: 79.9,
  };

  const getProximosDias = () => {
    const dias = [];
    for (let i = 0; i <= 13; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const diasSemana = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];
      const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      
      dias.push({
        id: i,
        dateString: date.toISOString().split("T")[0],
        diaSemana: diasSemana[date.getDay()],
        dia: date.getDate(),
        mes: meses[date.getMonth()],
        completo: `${date.getDate()} de ${meses[date.getMonth()]}`,
        isHoje: i === 0,
      });
    }
    return dias;
  };

  const getHorarios = (dateId) => {
    return {
      manha: [
        { hora: "08:00", disponivel: true },
        { hora: "09:00", disponivel: dateId !== 0 },
        { hora: "10:00", disponivel: true },
        { hora: "11:00", disponivel: dateId !== 1 },
      ],
      tarde: [
        { hora: "14:00", disponivel: true },
        { hora: "15:00", disponivel: dateId !== 2 },
        { hora: "16:00", disponivel: true },
        { hora: "17:00", disponivel: dateId !== 0 },
      ],
      noite: [
        { hora: "18:30", disponivel: dateId !== 1 },
        { hora: "19:30", disponivel: true },
        { hora: "20:30", disponivel: dateId !== 3 },
      ],
    };
  };

  const [diasDisponiveis] = useState(getProximosDias());
  const [selectedDate, setSelectedDate] = useState(diasDisponiveis[0]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [horarios, setHorarios] = useState(getHorarios(0));
  
  // Gerar código único de consulta
  const generateUniqueCode = () => {
    const date = new Date();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const timestamp = date.getTime().toString().slice(-6);
    return `AVT-${timestamp}-${random}`;
  };

  const [consultaCode] = useState(generateUniqueCode());

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setHorarios(getHorarios(date.id));
  };

  const handleConfirm = () => {
    if (!selectedDate) {
      Alert.alert("Atenção", "Escolha uma data para agendar.");
      return;
    }
    if (!selectedTime) {
      Alert.alert("Atenção", "Escolha um horário para agendar.");
      return;
    }

    const finalDateTime = `${selectedDate.completo} às ${selectedTime}`;

    addActivity({
      clinicName: clinic.name,
      specialty: requestData.specialty,
      date: finalDateTime,
      price: requestData.price || 79.9,
      paymentMethod: requestData.paymentMethod || "Confirmado",
      rating: clinic.rating,
      distance: clinic.distance,
      eta: clinic.eta,
      address: clinic.address,
      consultaCode: consultaCode,
      status: "scheduled",
    });

    setConfirmed(true);
  };

  const openMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.name + " " + clinic.address)}`;
    Linking.openURL(url);
  };

  const openWhatsApp = () => {
    const whatsappNumber = clinic.whatsapp.replace(/\D/g, "");
    const message = `Olá! Tenho uma consulta agendada pela Avity. Código: ${consultaCode}`;
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url);
  };

  const makePhoneCall = () => {
    Linking.openURL(`tel:${clinic.phone.replace(/\D/g, "")}`);
  };

  const handleShare = async () => {
    try {
      const message = `🏥 CONSULTA AGENDADA - AVITY SAÚDE\n\n================================\n\nPACIENTE\nNome: ${pacienteAtual.nomeCompleto}\nCPF: ${pacienteAtual.cpf}\n\nCLÍNICA\n${clinic.name}\n${clinic.address}, ${clinic.city} - ${clinic.state}\nCEP: ${clinic.zipCode}\n\nCONSULTA\nData: ${selectedDate.completo}\nHorário: ${selectedTime}\nServiço: ${requestData.specialty}\nValor: R$ ${requestData.price.toFixed(2)}\n\n🔑 CÓDIGO DE SEGURANÇA: ${consultaCode}\n\n📞 Contato: ${clinic.phone}\n\n================================\nAvity Saúde - Cuidando de você!`;
      await Share.share({ title: "Comprovante Avity", message });
    } catch (error) {
      Alert.alert("Erro", "Não foi possível compartilhar.");
    }
  };

  const renderDayItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.dayCard, selectedDate?.id === item.id && styles.dayCardActive]}
      onPress={() => handleDateSelect(item)}
    >
      <Text style={[styles.dayWeek, selectedDate?.id === item.id && styles.dayWeekActive]}>
        {item.diaSemana}
      </Text>
      <Text style={[styles.dayNumber, selectedDate?.id === item.id && styles.dayNumberActive]}>
        {item.dia}
      </Text>
      <Text style={[styles.dayMonth, selectedDate?.id === item.id && styles.dayMonthActive]}>
        {item.mes}
      </Text>
      {item.isHoje && <Text style={styles.dayHoje}>HOJE</Text>}
    </TouchableOpacity>
  );

  if (confirmed) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerSuccess}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backTextLight}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitleLight}>Consulta Agendada</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Card de confirmação premium */}
        <View style={styles.confirmationCard}>
          <View style={styles.confirmationIcon}>
            <View style={styles.confirmationCircle}>
              <Text style={styles.confirmationIconText}>📋</Text>
            </View>
          </View>
          <Text style={styles.confirmationTitle}>Agendamento confirmado</Text>
          <Text style={styles.confirmationSub}>Sua consulta foi agendada com sucesso</Text>
        </View>

        {/* Código de segurança */}
        <View style={styles.securityCard}>
          <Text style={styles.securityLabel}>CÓDIGO DE SEGURANÇA</Text>
          <Text style={styles.securityCode}>{consultaCode}</Text>
          <Text style={styles.securityNote}>
            Apresente este código na clínica. Ele é único e intransferível.
          </Text>
        </View>

        {/* Informações do paciente */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>PACIENTE</Text>
          <Text style={styles.patientName}>{pacienteAtual.nomeCompleto}</Text>
          <Text style={styles.patientCpf}>CPF: {pacienteAtual.cpf}</Text>
        </View>

        {/* Informações da clínica */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>CLÍNICA</Text>
          <Text style={styles.clinicNameLarge}>{clinic.name}</Text>
          
          <View style={styles.addressContainer}>
            <Text style={styles.addressIcon}>📍</Text>
            <View style={styles.addressContent}>
              <Text style={styles.addressText}>{clinic.address}</Text>
              <Text style={styles.addressComplement}>{clinic.city} - {clinic.state} | CEP: {clinic.zipCode}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.mapButton} onPress={openMaps}>
            <Text style={styles.mapButtonText}>🗺️ Abrir no Google Maps</Text>
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <View style={styles.contactRow}>
            <Text style={styles.contactIcon}>⭐</Text>
            <Text style={styles.contactText}>{clinic.rating} · {clinic.distance} · {clinic.eta}</Text>
          </View>
          
          <View style={styles.contactRow}>
            <Text style={styles.contactIcon}>🕐</Text>
            <Text style={styles.contactText}>{clinic.hours}</Text>
          </View>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.phoneBtn} onPress={makePhoneCall}>
              <Text style={styles.phoneBtnText}>📞 Ligar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.whatsappBtn} onPress={openWhatsApp}>
              <Text style={styles.whatsappBtnText}>💬 WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Detalhes da consulta */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>CONSULTA</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Data</Text>
            <Text style={styles.detailValue}>{selectedDate.completo}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Horário</Text>
            <Text style={styles.detailValue}>{selectedTime}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Serviço</Text>
            <Text style={styles.detailValue}>{requestData.specialty}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Valor pago</Text>
            <Text style={styles.detailPrice}>R$ {requestData.price.toFixed(2)}</Text>
          </View>
        </View>

        {/* Ações */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Text style={styles.shareBtnText}>📤 Compartilhar comprovante</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.navigate("Home")}>
            <Text style={styles.homeBtnText}>Voltar ao início</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agendar consulta</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.clinicCard}>
        <Text style={styles.clinicName}>{clinic.name}</Text>
        <View style={styles.clinicInfo}>
          <Text style={styles.clinicRating}>⭐ {clinic.rating}</Text>
          <Text style={styles.clinicDistance}>📍 {clinic.distance}</Text>
          <Text style={styles.clinicTime}>⏱️ {clinic.eta}</Text>
        </View>
        <Text style={styles.clinicService}>{requestData.specialty}</Text>
        <Text style={styles.clinicPrice}>R$ {requestData.price.toFixed(2)}</Text>
      </View>

      <View style={styles.dateSection}>
        <Text style={styles.sectionTitle}>📅 Escolha a data</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={diasDisponiveis}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderDayItem}
          contentContainerStyle={styles.daysList}
        />
      </View>

      {selectedDate && (
        <View style={styles.timeSection}>
          <Text style={styles.sectionTitle}>⏰ Horários disponíveis</Text>
          
          {horarios.manha.some(h => h.disponivel) && (
            <>
              <Text style={styles.periodTitle}>Manhã</Text>
              <View style={styles.timeGrid}>
                {horarios.manha.map((item) => (
                  <TouchableOpacity
                    key={item.hora}
                    style={[
                      styles.timeBtn,
                      !item.disponivel && styles.timeBtnDisabled,
                      selectedTime === item.hora && styles.timeBtnActive,
                    ]}
                    onPress={() => item.disponivel && setSelectedTime(item.hora)}
                    disabled={!item.disponivel}
                  >
                    <Text style={[
                      styles.timeText,
                      !item.disponivel && styles.timeTextDisabled,
                      selectedTime === item.hora && styles.timeTextActive,
                    ]}>
                      {item.hora}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {horarios.tarde.some(h => h.disponivel) && (
            <>
              <Text style={styles.periodTitle}>Tarde</Text>
              <View style={styles.timeGrid}>
                {horarios.tarde.map((item) => (
                  <TouchableOpacity
                    key={item.hora}
                    style={[
                      styles.timeBtn,
                      !item.disponivel && styles.timeBtnDisabled,
                      selectedTime === item.hora && styles.timeBtnActive,
                    ]}
                    onPress={() => item.disponivel && setSelectedTime(item.hora)}
                    disabled={!item.disponivel}
                  >
                    <Text style={[
                      styles.timeText,
                      !item.disponivel && styles.timeTextDisabled,
                      selectedTime === item.hora && styles.timeTextActive,
                    ]}>
                      {item.hora}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {horarios.noite.some(h => h.disponivel) && (
            <>
              <Text style={styles.periodTitle}>Noite</Text>
              <View style={styles.timeGrid}>
                {horarios.noite.map((item) => (
                  <TouchableOpacity
                    key={item.hora}
                    style={[
                      styles.timeBtn,
                      !item.disponivel && styles.timeBtnDisabled,
                      selectedTime === item.hora && styles.timeBtnActive,
                    ]}
                    onPress={() => item.disponivel && setSelectedTime(item.hora)}
                    disabled={!item.disponivel}
                  >
                    <Text style={[
                      styles.timeText,
                      !item.disponivel && styles.timeTextDisabled,
                      selectedTime === item.hora && styles.timeTextActive,
                    ]}>
                      {item.hora}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>
      )}

      <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
        <Text style={styles.confirmBtnText}>Confirmar agendamento</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  
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

  headerSuccess: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#005C4A",
  },
  backTextLight: { fontSize: 24, color: "#FFF" },
  headerTitleLight: { fontSize: 18, fontWeight: "600", color: "#FFF" },

  clinicCard: {
    backgroundColor: "#FFF",
    margin: 20,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  clinicName: { fontSize: 18, fontWeight: "700", color: "#1A1A1A", marginBottom: 8 },
  clinicInfo: { flexDirection: "row", gap: 12, marginBottom: 12 },
  clinicRating: { fontSize: 13, color: "#666" },
  clinicDistance: { fontSize: 13, color: "#666" },
  clinicTime: { fontSize: 13, color: "#666" },
  clinicService: { fontSize: 14, color: "#888", marginBottom: 8 },
  clinicPrice: { fontSize: 20, fontWeight: "700", color: "#005C4A" },

  dateSection: { marginHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#1A1A1A", marginBottom: 16 },
  daysList: { gap: 12 },
  dayCard: {
    width: 70,
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8ECF0",
  },
  dayCardActive: { backgroundColor: "#005C4A", borderColor: "#005C4A" },
  dayWeek: { fontSize: 11, color: "#888", marginBottom: 4 },
  dayWeekActive: { color: "#FFF" },
  dayNumber: { fontSize: 22, fontWeight: "700", color: "#1A1A1A" },
  dayNumberActive: { color: "#FFF" },
  dayMonth: { fontSize: 10, color: "#888", marginTop: 2 },
  dayMonthActive: { color: "#FFF" },
  dayHoje: { fontSize: 8, color: "#005C4A", marginTop: 4, fontWeight: "600" },

  timeSection: { marginHorizontal: 20, marginBottom: 20 },
  periodTitle: { fontSize: 14, fontWeight: "600", color: "#666", marginBottom: 12, marginTop: 8 },
  timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 16 },
  timeBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E8ECF0",
  },
  timeBtnActive: { backgroundColor: "#005C4A", borderColor: "#005C4A" },
  timeBtnDisabled: { backgroundColor: "#F5F5F5", borderColor: "#F0F0F0" },
  timeText: { fontSize: 14, color: "#1A1A1A" },
  timeTextActive: { color: "#FFF" },
  timeTextDisabled: { color: "#CCC", textDecorationLine: "line-through" },

  confirmBtn: {
    backgroundColor: "#005C4A",
    marginHorizontal: 20,
    marginBottom: 40,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
  },
  confirmBtnText: { color: "#FFF", fontSize: 16, fontWeight: "600" },

  // Tela de sucesso
  confirmationCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    padding: 24,
    borderRadius: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8ECF0",
  },
  confirmationIcon: { marginBottom: 16 },
  confirmationCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#005C4A10",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmationIconText: { fontSize: 32 },
  confirmationTitle: { fontSize: 20, fontWeight: "700", color: "#1A1A1A", marginBottom: 4 },
  confirmationSub: { fontSize: 13, color: "#888", textAlign: "center" },

  securityCard: {
    backgroundColor: "#1A1A1A",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
  },
  securityLabel: { fontSize: 10, color: "#888", letterSpacing: 1, marginBottom: 8 },
  securityCode: { fontSize: 20, fontWeight: "700", color: "#FFF", letterSpacing: 2, marginBottom: 8, fontFamily: "monospace" },
  securityNote: { fontSize: 11, color: "#AAA", textAlign: "center", lineHeight: 16 },

  infoCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  cardTitle: { fontSize: 11, fontWeight: "600", color: "#888", letterSpacing: 1, marginBottom: 12 },
  patientName: { fontSize: 16, fontWeight: "700", color: "#1A1A1A", marginBottom: 4 },
  patientCpf: { fontSize: 13, color: "#888" },
  clinicNameLarge: { fontSize: 18, fontWeight: "700", color: "#1A1A1A", marginBottom: 16 },

  addressContainer: { flexDirection: "row", marginBottom: 12 },
  addressIcon: { fontSize: 18, marginRight: 12 },
  addressContent: { flex: 1 },
  addressText: { fontSize: 14, color: "#1A1A1A", marginBottom: 4 },
  addressComplement: { fontSize: 12, color: "#888" },
  mapButton: {
    backgroundColor: "#E8F0FE",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  mapButtonText: { fontSize: 13, color: "#005C4A", fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#F0F0F0", marginVertical: 16 },

  contactRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  contactIcon: { fontSize: 16, marginRight: 12 },
  contactText: { flex: 1, fontSize: 14, color: "#1A1A1A" },

  buttonRow: { flexDirection: "row", gap: 12, marginTop: 8 },
  phoneBtn: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8ECF0",
  },
  phoneBtnText: { fontSize: 14, color: "#1A1A1A", fontWeight: "500" },
  whatsappBtn: {
    flex: 1,
    backgroundColor: "#25D36610",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#25D36630",
  },
  whatsappBtnText: { fontSize: 14, color: "#25D366", fontWeight: "500" },

  detailRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  detailLabel: { fontSize: 14, color: "#888" },
  detailValue: { fontSize: 14, fontWeight: "500", color: "#1A1A1A" },
  detailPrice: { fontSize: 16, fontWeight: "700", color: "#005C4A" },

  actionContainer: { marginHorizontal: 20, marginBottom: 40, gap: 12 },
  shareBtn: {
    backgroundColor: "#00A896",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
  },
  shareBtnText: { color: "#FFF", fontSize: 14, fontWeight: "600" },
  homeBtn: {
    backgroundColor: "#FFF",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8ECF0",
  },
  homeBtnText: { color: "#1A1A1A", fontSize: 16, fontWeight: "600" },
});