// screens/EditProfileScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../theme";
import { useAuth } from "../context/AuthContext";

export default function EditProfileScreen({ navigation }) {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editando, setEditando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  
  // Dados do formulário
  const [formData, setFormData] = useState({
    nome: "",
    sobrenome: "",
    email: "",
    telefone: "",
    cpf: "",
    dataNascimento: "",
    genero: "",
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: "",
  });

  // Preferências
  const [preferencias, setPreferencias] = useState({
    notificacoesEmail: true,
    notificacoesPush: true,
    ofertasPromocoes: false,
    compartilharDados: false,
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        nome: user.nome || "",
        sobrenome: user.sobrenome || "",
        email: user.email || "",
        telefone: user.telefone || "",
        cpf: user.cpf || "",
        dataNascimento: user.dataNascimento || "",
        genero: user.genero || "",
      }));
    }
  }, [user]);

  const handleInputChange = (campo, valor) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
  };

  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validarTelefone = (telefone) => {
    const regex = /^\(?[1-9]{2}\)? ?[9]?[0-9]{4}-?[0-9]{4}$/;
    return regex.test(telefone);
  };

  const validarCPF = (cpf) => {
    const regex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    return regex.test(cpf);
  };

  const formatarTelefone = (texto) => {
    let limpo = texto.replace(/\D/g, "");
    if (limpo.length <= 2) return `(${limpo}`;
    if (limpo.length <= 7) return `(${limpo.slice(0, 2)}) ${limpo.slice(2)}`;
    if (limpo.length <= 11) return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 7)}-${limpo.slice(7, 11)}`;
    return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 7)}-${limpo.slice(7, 11)}`;
  };

  const formatarCPF = (texto) => {
    let limpo = texto.replace(/\D/g, "");
    if (limpo.length <= 3) return limpo;
    if (limpo.length <= 6) return `${limpo.slice(0, 3)}.${limpo.slice(3)}`;
    if (limpo.length <= 9) return `${limpo.slice(0, 3)}.${limpo.slice(3, 6)}.${limpo.slice(6)}`;
    return `${limpo.slice(0, 3)}.${limpo.slice(3, 6)}.${limpo.slice(6, 9)}-${limpo.slice(9, 11)}`;
  };

  const formatarData = (texto) => {
    let limpo = texto.replace(/\D/g, "");
    if (limpo.length <= 2) return limpo;
    if (limpo.length <= 4) return `${limpo.slice(0, 2)}/${limpo.slice(2)}`;
    return `${limpo.slice(0, 2)}/${limpo.slice(2, 4)}/${limpo.slice(4, 8)}`;
  };

  const salvarDadosPessoais = async () => {
    // Validações
    if (!formData.nome.trim()) {
      Alert.alert("Erro", "Por favor, informe seu nome");
      return;
    }

    if (!formData.sobrenome.trim()) {
      Alert.alert("Erro", "Por favor, informe seu sobrenome");
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert("Erro", "Por favor, informe seu email");
      return;
    }

    if (!validarEmail(formData.email)) {
      Alert.alert("Erro", "Por favor, informe um email válido");
      return;
    }

    if (formData.telefone && !validarTelefone(formData.telefone)) {
      Alert.alert("Erro", "Por favor, informe um telefone válido (ex: (11) 99999-9999)");
      return;
    }

    if (formData.cpf && !validarCPF(formData.cpf)) {
      Alert.alert("Erro", "Por favor, informe um CPF válido (ex: 123.456.789-00)");
      return;
    }

    setLoading(true);
    try {
      // Aqui você faria a chamada API para atualizar os dados
      await updateUser({
        nome: formData.nome,
        sobrenome: formData.sobrenome,
        email: formData.email,
        telefone: formData.telefone,
        cpf: formData.cpf,
        dataNascimento: formData.dataNascimento,
        genero: formData.genero,
      });
      
      Alert.alert("Sucesso", "Dados atualizados com sucesso!");
      setEditando(false);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar os dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const alterarSenha = async () => {
    if (!formData.senhaAtual) {
      Alert.alert("Erro", "Por favor, informe sua senha atual");
      return;
    }

    if (!formData.novaSenha) {
      Alert.alert("Erro", "Por favor, informe a nova senha");
      return;
    }

    if (formData.novaSenha.length < 6) {
      Alert.alert("Erro", "A nova senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (formData.novaSenha !== formData.confirmarSenha) {
      Alert.alert("Erro", "As senhas não coincidem");
      return;
    }

    setLoading(true);
    try {
      // Aqui você faria a chamada API para alterar senha
      await updateUser({ senha: formData.novaSenha });
      
      Alert.alert("Sucesso", "Senha alterada com sucesso!");
      setFormData(prev => ({
        ...prev,
        senhaAtual: "",
        novaSenha: "",
        confirmarSenha: "",
      }));
      setMostrarSenha(false);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível alterar a senha. Verifique sua senha atual.");
    } finally {
      setLoading(false);
    }
  };

  const salvarPreferencias = async () => {
    setLoading(true);
    try {
      // Aqui você salvaria as preferências no backend
      await updateUser({ preferencias });
      Alert.alert("Sucesso", "Preferências salvas com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar as preferências");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        {!editando && !mostrarSenha && (
          <TouchableOpacity onPress={() => setEditando(true)} style={styles.editButton}>
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Seção de Dados Pessoais */}
        {(editando || !mostrarSenha) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Dados Pessoais</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome *</Text>
              <TextInput
                style={[styles.input, !editando && styles.inputDisabled]}
                value={formData.nome}
                onChangeText={(text) => handleInputChange("nome", text)}
                editable={editando}
                placeholder="Seu nome"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Sobrenome *</Text>
              <TextInput
                style={[styles.input, !editando && styles.inputDisabled]}
                value={formData.sobrenome}
                onChangeText={(text) => handleInputChange("sobrenome", text)}
                editable={editando}
                placeholder="Seu sobrenome"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-mail *</Text>
              <TextInput
                style={[styles.input, !editando && styles.inputDisabled]}
                value={formData.email}
                onChangeText={(text) => handleInputChange("email", text)}
                editable={editando}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="seu@email.com"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telefone</Text>
              <TextInput
                style={[styles.input, !editando && styles.inputDisabled]}
                value={formData.telefone}
                onChangeText={(text) => handleInputChange("telefone", formatarTelefone(text))}
                editable={editando}
                keyboardType="phone-pad"
                placeholder="(11) 99999-9999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>CPF</Text>
              <TextInput
                style={[styles.input, !editando && styles.inputDisabled]}
                value={formData.cpf}
                onChangeText={(text) => handleInputChange("cpf", formatarCPF(text))}
                editable={editando}
                keyboardType="numeric"
                placeholder="123.456.789-00"
              />
            </View>

            <View style={styles.rowGroup}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Data de Nascimento</Text>
                <TextInput
                  style={[styles.input, !editando && styles.inputDisabled]}
                  value={formData.dataNascimento}
                  onChangeText={(text) => handleInputChange("dataNascimento", formatarData(text))}
                  editable={editando}
                  keyboardType="numeric"
                  placeholder="DD/MM/AAAA"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Gênero</Text>
                <View style={styles.generoContainer}>
                  {["Masculino", "Feminino", "Outro", "Prefiro não dizer"].map((opcao) => (
                    <TouchableOpacity
                      key={opcao}
                      style={[
                        styles.generoOption,
                        formData.genero === opcao && styles.generoOptionActive,
                        !editando && styles.generoOptionDisabled,
                      ]}
                      onPress={() => editando && handleInputChange("genero", opcao)}
                      disabled={!editando}
                    >
                      <Text
                        style={[
                          styles.generoText,
                          formData.genero === opcao && styles.generoTextActive,
                        ]}
                      >
                        {opcao}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {editando && (
              <TouchableOpacity
                style={styles.saveButton}
                onPress={salvarDadosPessoais}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Salvar Dados</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Seção de Alterar Senha */}
        {!mostrarSenha ? (
          <TouchableOpacity
            style={styles.changePasswordButton}
            onPress={() => setMostrarSenha(true)}
          >
            <Text style={styles.changePasswordText}>🔒 Alterar Senha</Text>
            <Text style={styles.arrowRight}>→</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.section}>
            <View style={styles.passwordHeader}>
              <Text style={styles.sectionTitle}>🔒 Alterar Senha</Text>
              <TouchableOpacity onPress={() => setMostrarSenha(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha Atual *</Text>
              <TextInput
                style={styles.input}
                value={formData.senhaAtual}
                onChangeText={(text) => handleInputChange("senhaAtual", text)}
                secureTextEntry
                placeholder="Digite sua senha atual"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nova Senha *</Text>
              <TextInput
                style={styles.input}
                value={formData.novaSenha}
                onChangeText={(text) => handleInputChange("novaSenha", text)}
                secureTextEntry
                placeholder="Mínimo 6 caracteres"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar Nova Senha *</Text>
              <TextInput
                style={styles.input}
                value={formData.confirmarSenha}
                onChangeText={(text) => handleInputChange("confirmarSenha", text)}
                secureTextEntry
                placeholder="Digite a nova senha novamente"
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={alterarSenha}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveButtonText}>Alterar Senha</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Seção de Preferências */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Preferências</Text>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceText}>
              <Text style={styles.preferenceTitle}>Notificações por E-mail</Text>
              <Text style={styles.preferenceDescription}>
                Receba atualizações sobre consultas e exames
              </Text>
            </View>
            <Switch
              value={preferencias.notificacoesEmail}
              onValueChange={(value) =>
                setPreferencias({ ...preferencias, notificacoesEmail: value })
              }
              trackColor={{ false: "#D1D5DB", true: theme.colors.primary }}
            />
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceText}>
              <Text style={styles.preferenceTitle}>Notificações Push</Text>
              <Text style={styles.preferenceDescription}>
                Alertas sobre promoções e novidades
              </Text>
            </View>
            <Switch
              value={preferencias.notificacoesPush}
              onValueChange={(value) =>
                setPreferencias({ ...preferencias, notificacoesPush: value })
              }
              trackColor={{ false: "#D1D5DB", true: theme.colors.primary }}
            />
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceText}>
              <Text style={styles.preferenceTitle}>Ofertas e Promoções</Text>
              <Text style={styles.preferenceDescription}>
                Receba ofertas exclusivas e descontos
              </Text>
            </View>
            <Switch
              value={preferencias.ofertasPromocoes}
              onValueChange={(value) =>
                setPreferencias({ ...preferencias, ofertasPromocoes: value })
              }
              trackColor={{ false: "#D1D5DB", true: theme.colors.primary }}
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={salvarPreferencias} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveButtonText}>Salvar Preferências</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  backText: {
    fontSize: 28,
    color: theme.colors.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
  },
  editButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  section: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#FFF",
    color: "#111827",
  },
  inputDisabled: {
    backgroundColor: "#F9FAFB",
    color: "#6B7280",
  },
  rowGroup: {
    flexDirection: "row",
    marginBottom: 16,
  },
  generoContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  generoOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
    marginBottom: 8,
  },
  generoOptionActive: {
    backgroundColor: theme.colors.primary,
  },
  generoOptionDisabled: {
    opacity: 0.6,
  },
  generoText: {
    fontSize: 12,
    color: "#374151",
  },
  generoTextActive: {
    color: "#FFF",
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  changePasswordButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
  },
  changePasswordText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  arrowRight: {
    fontSize: 20,
    color: "#9CA3AF",
  },
  passwordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  cancelText: {
    color: "#EF4444",
    fontWeight: "600",
  },
  preferenceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  preferenceText: {
    flex: 1,
    marginRight: 16,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 12,
    color: "#6B7280",
  },
});