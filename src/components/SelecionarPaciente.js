import React, { useState } from 'react';
import { View, Text, TextInput, Switch, TouchableOpacity, StyleSheet } from 'react-native';

const SelecionarPaciente = ({ onChange, user }) => {
  const [paraOutro, setParaOutro] = useState(false);
  const [paciente, setPaciente] = useState({
    nome: user?.nome || '',
    cpf: user?.cpf || '',
    dataNascimento: '',
  });

  const toggleParaOutro = (value) => {
    setParaOutro(value);
    if (!value) {
      setPaciente({ nome: user?.nome || '', cpf: user?.cpf || '', dataNascimento: '' });
      onChange(user);
    }
  };

  const handleChange = (campo, valor) => {
    const updated = { ...paciente, [campo]: valor };
    setPaciente(updated);
    if (paraOutro) onChange(updated);
  };

  return (
    <View style={styles.container}>
      <View style={styles.switchContainer}>
        <Text style={styles.label}>Atendimento para:</Text>
        <View style={styles.switchRow}>
          <Text>Mim mesmo</Text>
          <Switch value={paraOutro} onValueChange={toggleParaOutro} />
          <Text>Outra pessoa</Text>
        </View>
      </View>

      {paraOutro && (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Nome completo"
            value={paciente.nome}
            onChangeText={(text) => handleChange('nome', text)}
          />
          <TextInput
            style={styles.input}
            placeholder="CPF (apenas n£meros)"
            value={paciente.cpf}
            onChangeText={(text) => handleChange('cpf', text)}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Data de Nascimento (DD/MM/AAAA)"
            value={paciente.dataNascimento}
            onChangeText={(text) => handleChange('dataNascimento', text)}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 15, padding: 15, backgroundColor: '#fff', borderRadius: 8 },
  switchContainer: { marginBottom: 15 },
  label: { fontSize: 16, fontWeight: '500', marginBottom: 8 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  form: { marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 10, fontSize: 16 },
});

export default SelecionarPaciente;