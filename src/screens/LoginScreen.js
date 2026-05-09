// screens/LoginScreen.js
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Animated,
  Modal,
  ScrollView,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";

// Lista de países
const paises = [
  { codigo: "+55", bandeira: "🇧🇷", nome: "Brasil", ddd: "55" },
  { codigo: "+1", bandeira: "🇺🇸", nome: "Estados Unidos", ddd: "1" },
  { codigo: "+44", bandeira: "🇬🇧", nome: "Reino Unido", ddd: "44" },
  { codigo: "+351", bandeira: "🇵🇹", nome: "Portugal", ddd: "351" },
  { codigo: "+33", bandeira: "🇫🇷", nome: "França", ddd: "33" },
  { codigo: "+49", bandeira: "🇩🇪", nome: "Alemanha", ddd: "49" },
  { codigo: "+34", bandeira: "🇪🇸", nome: "Espanha", ddd: "34" },
  { codigo: "+39", bandeira: "🇮🇹", nome: "Itália", ddd: "39" },
];

export default function LoginScreen({ navigation }) {
  const { sendCode, verifyCode, loginWithCPF } = useAuth();
  const [fase, setFase] = useState("telefone");
  const [telefone, setTelefone] = useState("");
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [tempoReenvio, setTempoReenvio] = useState(0);
  const [paisSelecionado, setPaisSelecionado] = useState(paises[0]);
  const [mostrarPaises, setMostrarPaises] = useState(false);
  
  // Modais
  const [modalGoogle, setModalGoogle] = useState(false);
  const [modalCPF, setModalCPF] = useState(false);
  const [modalAjuda, setModalAjuda] = useState(false);
  
  // CPF
  const [cpf, setCpf] = useState("");
  const [cpfSenha, setCpfSenha] = useState("");
  const [cpfLoading, setCpfLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  
  // Animações
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formatarTelefone = (text) => {
    let limpo = text.replace(/\D/g, "");
    if (limpo.length <= 2) return `(${limpo}`;
    if (limpo.length <= 7) return `(${limpo.slice(0, 2)}) ${limpo.slice(2)}`;
    if (limpo.length <= 11) return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 7)}-${limpo.slice(7, 11)}`;
    return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 7)}-${limpo.slice(7, 11)}`;
  };

  const formatarCPF = (text) => {
    let limpo = text.replace(/\D/g, "");
    if (limpo.length <= 3) return limpo;
    if (limpo.length <= 6) return `${limpo.slice(0, 3)}.${limpo.slice(3)}`;
    if (limpo.length <= 9) return `${limpo.slice(0, 3)}.${limpo.slice(3, 6)}.${limpo.slice(6)}`;
    return `${limpo.slice(0, 3)}.${limpo.slice(3, 6)}.${limpo.slice(6, 9)}-${limpo.slice(9, 11)}`;
  };

  const handleEnviarCodigo = async () => {
    const telefoneLimpo = telefone.replace(/\D/g, "");
    if (telefoneLimpo.length < 10) {
      Alert.alert("Atenção", "Digite um número de telefone válido");
      return;
    }

    setLoading(true);
    try {
      const numeroCompleto = paisSelecionado.ddd + telefoneLimpo;
      await sendCode(numeroCompleto);
      setFase("codigo");
      setTempoReenvio(30);
      
      const timer = setInterval(() => {
        setTempoReenvio((prev) => {
          if (prev <= 1) clearInterval(timer);
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível enviar o código.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerificarCodigo = async () => {
    if (codigo.length < 6) {
      Alert.alert("Atenção", "Digite o código de 6 dígitos");
      return;
    }

    setLoading(true);
    try {
      const telefoneLimpo = telefone.replace(/\D/g, "");
      const numeroCompleto = paisSelecionado.ddd + telefoneLimpo;
      await verifyCode(numeroCompleto, codigo);
    } catch (error) {
      Alert.alert("Erro", "Código inválido.");
    } finally {
      setLoading(false);
    }
  };

  const handleReenviarCodigo = async () => {
    if (tempoReenvio > 0) return;
    setLoading(true);
    try {
      const telefoneLimpo = telefone.replace(/\D/g, "");
      const numeroCompleto = paisSelecionado.ddd + telefoneLimpo;
      await sendCode(numeroCompleto);
      setTempoReenvio(30);
      const timer = setInterval(() => {
        setTempoReenvio((prev) => {
          if (prev <= 1) clearInterval(timer);
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível reenviar.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginGoogle = async () => {
    setModalGoogle(false);
    Alert.alert("Google", "Funcionalidade em desenvolvimento.\nEm breve você poderá acessar com sua conta Google.");
  };

  const handleLoginCPF = async () => {
    const cpfLimpo = cpf.replace(/\D/g, "");
    if (cpfLimpo.length !== 11) {
      Alert.alert("Atenção", "Digite um CPF válido (11 dígitos)");
      return;
    }
    
    if (!cpfSenha) {
      Alert.alert("Atenção", "Digite sua senha");
      return;
    }

    setCpfLoading(true);
    try {
      await loginWithCPF(cpfLimpo, cpfSenha);
      setModalCPF(false);
      setCpf("");
      setCpfSenha("");
    } catch (error) {
      Alert.alert("Erro", "CPF ou senha inválidos. Tente novamente.");
    } finally {
      setCpfLoading(false);
    }
  };

  // Estrutura completa de ajuda
  const handleAjudaOption = (tipo) => {
    setModalAjuda(false);
    switch(tipo) {
      case 'suporte':
        Alert.alert(
          "Central de Suporte",
          "Nossa equipe está disponível 24/7 para te ajudar!\n\n📞 Telefone: 0800 123 4567\n💬 WhatsApp: (11) 91234-5678\n📧 E-mail: suporte@avity.com.br",
          [{ text: "OK" }]
        );
        break;
      case 'faq':
        Alert.alert(
          "Perguntas Frequentes",
          "🔹 Como faço para agendar uma consulta?\n   -> Acesse a tela inicial e escolha a especialidade.\n\n🔹 Como funciona o pagamento?\n   -> Você pode pagar com cartão, PIX ou créditos Avity.\n\n🔹 Como cancelar uma consulta?\n   -> Vá em Atividades e selecione a consulta.",
          [{ text: "OK" }]
        );
        break;
      case 'senha':
        Alert.alert(
          "Recuperar Senha",
          "Digite seu CPF ou telefone cadastrado para receber um link de recuperação.",
          [
            { text: "Cancelar", style: "cancel" },
            { text: "Recuperar", onPress: () => Alert.alert("Enviado!", "Verifique seu e-mail/WhatsApp") }
          ]
        );
        break;
      case 'email':
        Alert.alert(
          "Fale Conosco",
          "Envie um e-mail para nossa equipe:\n\n📧 contato@avity.com.br\n\nRespondemos em até 24h úteis.",
          [{ text: "OK" }]
        );
        break;
      case 'termos':
        Alert.alert(
          "Termos de Uso",
          "Ao utilizar o Avity, você concorda com nossos termos e condições.\n\nConsulte nossa política de privacidade em avity.com.br/termos",
          [{ text: "OK" }]
        );
        break;
      default:
        break;
    }
  };

  const ajudaOptions = [
    { id: 'suporte', titulo: "Central de Suporte", descricao: "Fale com nossa equipe 24/7", icone: "📞" },
    { id: 'faq', titulo: "Perguntas Frequentes", descricao: "Dúvidas comuns sobre a Avity", icone: "❓" },
    { id: 'senha', titulo: "Esqueci minha senha", descricao: "Recupere o acesso à sua conta", icone: "🔒" },
    { id: 'email', titulo: "Fale Conosco", descricao: "Envie um e-mail para nossa equipe", icone: "✉️" },
    { id: 'termos', titulo: "Termos de Uso", descricao: "Leia nossos termos e condições", icone: "📄" },
  ];

  if (fase === "codigo") {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
            <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              
              <View style={styles.logoSection}>
                <View style={styles.logoWrapper}>
                  <Text style={styles.logoLetter}>a</Text>
                  <View style={styles.logoAccent} />
                </View>
                <Text style={styles.logoText}>vity</Text>
              </View>
              <Text style={styles.slogan}>SAÚDE INTELIGENTE</Text>

              <View style={styles.codeCard}>
                <Text style={styles.title}>Código de verificação</Text>
                <Text style={styles.subtitle}>
                  Enviamos um código para{"\n"}
                  <Text style={styles.highlight}>{paisSelecionado.bandeira} {formatarTelefone(telefone)}</Text>
                </Text>

                <TextInput
                  style={styles.codeInput}
                  value={codigo}
                  onChangeText={setCodigo}
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholder="000000"
                  placeholderTextColor="#CCC"
                  textAlign="center"
                  autoFocus
                />

                <TouchableOpacity style={styles.button} onPress={handleVerificarCodigo} disabled={loading}>
                  {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Verificar</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={handleReenviarCodigo} disabled={tempoReenvio > 0}>
                  <Text style={[styles.resendText, tempoReenvio > 0 && styles.resendDisabled]}>
                    {tempoReenvio > 0 ? `Reenviar em ${tempoReenvio}s` : "Reenviar código"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setFase("telefone")}>
                  <Text style={styles.backText}>← Usar outro número</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            
            {/* Logo */}
            <View style={styles.logoSection}>
              <View style={styles.logoWrapper}>
                <Text style={styles.logoLetter}>a</Text>
                <View style={styles.logoAccent} />
              </View>
              <Text style={styles.logoText}>vity</Text>
            </View>
            <Text style={styles.slogan}>SAÚDE INTELIGENTE</Text>

            {/* Card principal */}
            <View style={styles.card}>
              <Text style={styles.welcomeTitle}>Olá, bem-vindo(a)</Text>
              <Text style={styles.welcomeSubtitle}>Digite seu telefone para continuar</Text>

              {/* Campo de telefone com seletor de país */}
              <View style={styles.phoneSection}>
                <TouchableOpacity 
                  style={styles.countrySelector} 
                  onPress={() => setMostrarPaises(!mostrarPaises)}
                >
                  <Text style={styles.countryFlag}>{paisSelecionado.bandeira}</Text>
                  <Text style={styles.countryCode}>{paisSelecionado.codigo}</Text>
                  <Text style={styles.dropdownArrow}>⌵</Text>
                </TouchableOpacity>

                <TextInput
                  style={styles.phoneInput}
                  value={telefone}
                  onChangeText={(text) => setTelefone(formatarTelefone(text))}
                  keyboardType="phone-pad"
                  placeholder="(11) 96123-4567"
                  placeholderTextColor="#AAA"
                />
              </View>

              {/* Dropdown de países */}
              {mostrarPaises && (
                <View style={styles.countryList}>
                  <ScrollView nestedScrollEnabled style={styles.countryScroll}>
                    {paises.map((pais) => (
                      <TouchableOpacity
                        key={pais.codigo}
                        style={styles.countryItem}
                        onPress={() => {
                          setPaisSelecionado(pais);
                          setMostrarPaises(false);
                        }}
                      >
                        <Text style={styles.countryFlag}>{pais.bandeira}</Text>
                        <Text style={styles.countryName}>{pais.nome}</Text>
                        <Text style={styles.countryCodeText}>{pais.codigo}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <TouchableOpacity style={styles.button} onPress={handleEnviarCodigo} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Continuar</Text>}
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity style={styles.secondaryButton} onPress={() => setModalGoogle(true)}>
                <Text style={styles.secondaryButtonText}>Continuar com Google</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton} onPress={() => setModalCPF(true)}>
                <Text style={styles.secondaryButtonText}>Continuar com CPF</Text>
              </TouchableOpacity>

              {/* Botão de ajuda estruturado */}
              <TouchableOpacity style={styles.helpButtonContainer} onPress={() => setModalAjuda(true)}>
                <Text style={styles.helpButtonText}>Precisa de ajuda?</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* MODAL GOOGLE */}
      <Modal visible={modalGoogle} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Google</Text>
            <Text style={styles.modalText}>Conecte-se com sua conta Google para acessar a Avity.</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModalGoogle(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleLoginGoogle}>
                <Text style={styles.modalConfirmText}>Continuar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL CPF */}
      <Modal visible={modalCPF} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Acessar com CPF</Text>
            <Text style={styles.modalText}>Digite seu CPF e senha cadastrados</Text>
            
            <TextInput
              style={styles.cpfInput}
              value={cpf}
              onChangeText={(text) => setCpf(formatarCPF(text))}
              keyboardType="numeric"
              maxLength={14}
              placeholder="123.456.789-00"
              placeholderTextColor="#AAA"
            />
            
            <View style={styles.senhaContainer}>
              <TextInput
                style={styles.senhaInput}
                value={cpfSenha}
                onChangeText={setCpfSenha}
                secureTextEntry={!mostrarSenha}
                placeholder="Digite sua senha"
                placeholderTextColor="#AAA"
              />
              <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)} style={styles.eyeButton}>
                <Text style={styles.eyeText}>{mostrarSenha ? "👁️" : "👁️‍🗨️"}</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.forgotButton} onPress={() => handleAjudaOption('senha')}>
              <Text style={styles.forgotText}>Esqueceu sua senha?</Text>
            </TouchableOpacity>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => {
                setModalCPF(false);
                setCpf("");
                setCpfSenha("");
              }}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleLoginCPF} disabled={cpfLoading}>
                {cpfLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.modalConfirmText}>Entrar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL AJUDA - ESTRUTURA COMPLETA */}
      <Modal visible={modalAjuda} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.helpModalContainer}>
            <View style={styles.helpHeader}>
              <View>
                <Text style={styles.helpTitle}>Central de Ajuda</Text>
                <Text style={styles.helpSubtitle}>Como podemos ajudar você?</Text>
              </View>
              <TouchableOpacity onPress={() => setModalAjuda(false)} style={styles.helpCloseButton}>
                <Text style={styles.helpClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.helpList} showsVerticalScrollIndicator={false}>
              {ajudaOptions.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.helpItem}
                  onPress={() => handleAjudaOption(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.helpItemLeft}>
                    <Text style={styles.helpItemIcon}>{item.icone}</Text>
                    <View style={styles.helpItemContent}>
                      <Text style={styles.helpItemTitle}>{item.titulo}</Text>
                      <Text style={styles.helpItemDesc}>{item.descricao}</Text>
                    </View>
                  </View>
                  <Text style={styles.helpItemArrow}>→</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={styles.helpFooter}>
              <Text style={styles.helpFooterText}>Avity Saúde Inteligente © 2026</Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 50 },
  
  // Logo
  logoSection: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 8 },
  logoWrapper: { position: "relative" },
  logoLetter: { fontSize: 56, fontWeight: "800", color: "#005C4A", letterSpacing: -3 },
  logoAccent: { position: "absolute", bottom: 8, right: -4, width: 8, height: 8, backgroundColor: "#00A896", borderRadius: 4 },
  logoText: { fontSize: 32, fontWeight: "500", color: "#1A1A1A", letterSpacing: -0.5, marginLeft: 4 },
  slogan: { fontSize: 12, fontWeight: "600", color: "#00A896", textAlign: "center", marginBottom: 40, letterSpacing: 1.5 },
  
  // Cards
  card: { backgroundColor: "#FFF", borderRadius: 28, padding: 28, shadowColor: "#005C4A", shadowOpacity: 0.05, shadowRadius: 20, elevation: 5 },
  codeCard: { backgroundColor: "#FFF", borderRadius: 28, padding: 28, shadowColor: "#005C4A", shadowOpacity: 0.05, shadowRadius: 20, elevation: 5 },
  
  welcomeTitle: { fontSize: 28, fontWeight: "700", color: "#1A1A1A", marginBottom: 8, textAlign: "center" },
  welcomeSubtitle: { fontSize: 15, color: "#888", textAlign: "center", marginBottom: 32 },
  title: { fontSize: 26, fontWeight: "700", color: "#1A1A1A", marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 14, color: "#888", textAlign: "center", marginBottom: 32, lineHeight: 22 },
  
  // Telefone com país
  phoneSection: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 },
  countrySelector: { flexDirection: "row", alignItems: "center", backgroundColor: "#F5F7FA", paddingHorizontal: 16, paddingVertical: 14, borderRadius: 16, gap: 6, borderWidth: 1, borderColor: "#E8ECF0" },
  countryFlag: { fontSize: 22 },
  countryCode: { fontSize: 15, fontWeight: "500", color: "#1A1A1A" },
  dropdownArrow: { fontSize: 14, color: "#999" },
  phoneInput: { flex: 1, backgroundColor: "#F5F7FA", borderRadius: 16, paddingHorizontal: 16, fontSize: 16, color: "#1A1A1A", borderWidth: 1, borderColor: "#E8ECF0" },
  
  // Dropdown países
  countryList: { backgroundColor: "#FFF", borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: "#E8ECF0", maxHeight: 200, position: "relative", zIndex: 10 },
  countryScroll: { maxHeight: 200 },
  countryItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  countryName: { flex: 1, fontSize: 15, color: "#1A1A1A", marginLeft: 12 },
  countryCodeText: { fontSize: 14, color: "#888" },
  
  // Código
  codeInput: { fontSize: 34, fontWeight: "600", letterSpacing: 10, height: 70, marginBottom: 32, textAlign: "center", backgroundColor: "#F5F7FA", borderRadius: 16, color: "#005C4A" },
  
  // Botões
  button: { backgroundColor: "#005C4A", borderRadius: 16, paddingVertical: 16, alignItems: "center", marginBottom: 16 },
  buttonText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
  secondaryButton: { borderWidth: 1.5, borderColor: "#E8ECF0", borderRadius: 16, paddingVertical: 14, alignItems: "center", marginBottom: 12 },
  secondaryButtonText: { color: "#1A1A1A", fontSize: 15, fontWeight: "500" },
  
  divider: { flexDirection: "row", alignItems: "center", marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#E8ECF0" },
  dividerText: { marginHorizontal: 16, color: "#AAA", fontSize: 13 },
  
  // Botão de ajuda
  helpButtonContainer: { marginTop: 16, alignItems: "center", paddingVertical: 8 },
  helpButtonText: { color: "#00A896", fontSize: 14, fontWeight: "600" },
  
  resendText: { textAlign: "center", color: "#00A896", fontSize: 14, marginTop: 16 },
  resendDisabled: { color: "#CCC" },
  backText: { textAlign: "center", color: "#888", fontSize: 14, marginTop: 16 },
  highlight: { fontWeight: "600", color: "#005C4A" },
  
  // Modais
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContainer: { backgroundColor: "#FFF", borderRadius: 28, padding: 28, width: "88%", alignItems: "center" },
  modalTitle: { fontSize: 22, fontWeight: "700", color: "#1A1A1A", marginBottom: 8 },
  modalText: { fontSize: 14, color: "#888", textAlign: "center", marginBottom: 24, lineHeight: 20 },
  
  cpfInput: { backgroundColor: "#F5F7FA", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, width: "100%", marginBottom: 16, textAlign: "center", borderWidth: 1, borderColor: "#E8ECF0" },
  senhaContainer: { flexDirection: "row", alignItems: "center", position: "relative", width: "100%", marginBottom: 12 },
  senhaInput: { flex: 1, backgroundColor: "#F5F7FA", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, paddingRight: 50, borderWidth: 1, borderColor: "#E8ECF0" },
  eyeButton: { position: "absolute", right: 16, padding: 8 },
  eyeText: { fontSize: 18 },
  forgotButton: { alignSelf: "flex-end", marginBottom: 24 },
  forgotText: { color: "#00A896", fontSize: 13, fontWeight: "500" },
  
  modalButtons: { flexDirection: "row", gap: 12, width: "100%" },
  modalCancel: { flex: 1, paddingVertical: 14, borderRadius: 16, borderWidth: 1.5, borderColor: "#E8ECF0", alignItems: "center" },
  modalCancelText: { color: "#666", fontSize: 15, fontWeight: "500" },
  modalConfirm: { flex: 1, paddingVertical: 14, borderRadius: 16, backgroundColor: "#005C4A", alignItems: "center" },
  modalConfirmText: { color: "#FFF", fontSize: 15, fontWeight: "600" },
  
  // Ajuda - Estrutura completa
  helpModalContainer: { backgroundColor: "#FFF", borderRadius: 32, width: "92%", maxHeight: "85%", overflow: "hidden" },
  helpHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 24, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  helpTitle: { fontSize: 22, fontWeight: "700", color: "#1A1A1A" },
  helpSubtitle: { fontSize: 13, color: "#888", marginTop: 4 },
  helpCloseButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F0F0F0", alignItems: "center", justifyContent: "center" },
  helpClose: { fontSize: 18, color: "#666" },
  helpList: { padding: 16 },
  helpItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  helpItemLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  helpItemIcon: { fontSize: 28, marginRight: 16 },
  helpItemContent: { flex: 1 },
  helpItemTitle: { fontSize: 16, fontWeight: "600", color: "#1A1A1A", marginBottom: 4 },
  helpItemDesc: { fontSize: 13, color: "#888" },
  helpItemArrow: { fontSize: 18, color: "#CCC", marginLeft: 12 },
  helpFooter: { padding: 20, alignItems: "center", borderTopWidth: 1, borderTopColor: "#F0F0F0" },
  helpFooterText: { fontSize: 12, color: "#BBB" },
});