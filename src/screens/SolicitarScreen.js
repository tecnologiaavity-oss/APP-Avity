import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ESPECIALIDADES, CATEGORIAS, calcularPreco } from '../data/especialidades';
import CategoriaServico from '../components/CategoriaServico';
import SelecionarPaciente from '../components/SelecionarPaciente';
import { useAuth } from '../context/AuthContext';
import { useSolicitacao } from '../context/SolicitacaoContext';
import { processarPagamento, gerarSugestaoPreco } from '../services/pagamento';

const SolicitarScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { criarSolicitacao } = useSolicitacao();
  const [tipoSelecionado, setTipoSelecionado] = useState('medicos');
  const [especialidadeSelecionada, setEspecialidadeSelecionada] = useState(null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('ECO');
  const [pacienteInfo, setPacienteInfo] = useState(user);
  const [loading, setLoading] = useState(false);

  const especialidadesList = ESPECIALIDADES[tipoSelecionado];

  const precoCalculado = especialidadeSelecionada 
    ? gerarSugestaoPreco(categoriaSelecionada, especialidadeSelecionada)
    : 0;

  const handleSolicitar = async () => {
    if (!especialidadeSelecionada) {
      Alert.alert('Aten‡Æo', 'Selecione uma especialidade');
      return;
    }

    if (precoCalculado < 30) {
      Alert.alert('Valor inv lido', 'O valor m¡nimo para consulta ‚ R$ 30,00');
      return;
    }

    setLoading(true);
    
    try {
      const pagamento = await processarPagamento(precoCalculado, 'credito', {});
      
      if (!pagamento.success) {
        Alert.alert('Erro no pagamento', pagamento.error);
        return;
      }

      const solicitacao = await criarSolicitacao({
        especialidade: especialidadeSelecionada,
        categoria: categoriaSelecionada,
        paciente: pacienteInfo,
        preco: precoCalculado,
        pagamentoId: pagamento.transacaoId,
        status: 'aguardando_clinica'
      });

      if (solicitacao.success) {
        Alert.alert('Sucesso!', 'Solicita‡Æo enviada. Aguarde a confirma‡Æo da cl¡nica.');
        navigation.navigate('Home');
      }
    } catch (error) {
      Alert.alert('Erro', 'NÆo foi poss¡vel completar a solicita‡Æo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <CategoriaServico 
        selected={categoriaSelecionada} 
        onSelect={setCategoriaSelecionada} 
      />

      <SelecionarPaciente 
        user={user} 
        onChange={setPacienteInfo} 
      />

      <View style={styles.tipoContainer}>
        <Text style={styles.titulo}>Tipo de Atendimento</Text>
        <View style={styles.tipoButtons}>
          {Object.keys(ESPECIALIDADES).map(tipo => (
            <TouchableOpacity
              key={tipo}
              style={[styles.tipoButton, tipoSelecionado === tipo && styles.tipoButtonActive]}
              onPress={() => setTipoSelecionado(tipo)}
            >
              <Text style={[styles.tipoTexto, tipoSelecionado === tipo && styles.tipoTextoActive]}>
                {tipo === 'medicos' ? '????? M‚dicos' : tipo === 'dentistas' ? '?? Dentistas' : '?? Exames'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={styles.titulo}>Especialidades</Text>
      <View style={styles.grid}>
        {especialidadesList.map(esp => (
          <TouchableOpacity
            key={esp.id}
            style={[styles.card, especialidadeSelecionada?.id === esp.id && styles.cardSelected]}
            onPress={() => setEspecialidadeSelecionada(esp)}
          >
            <Text style={styles.cardNome}>{esp.nome}</Text>
            <Text style={styles.cardPreco}>a partir de R$ {esp.precoBase}</Text>
            <Text style={styles.cardDescricao}>{esp.descricao}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {especialidadeSelecionada && (
        <View style={styles.resumo}>
          <Text style={styles.resumoTitulo}>Resumo da Solicita‡Æo</Text>
          <Text style={styles.resumoTexto}>
            {especialidadeSelecionada.nome} - {CATEGORIAS[categoriaSelecionada].nome}
          </Text>
          <Text style={styles.resumoPreco}>Valor: R$ {precoCalculado.toFixed(2)}</Text>
          <Text style={styles.resumoInfo}>
            {CATEGORIAS[categoriaSelecionada].descricao}
          </Text>
          
          <TouchableOpacity 
            style={styles.botaoSolicitar} 
            onPress={handleSolicitar}
            disabled={loading}
          >
            <Text style={styles.botaoTexto}>
              {loading ? 'Processando...' : `Solicitar por R$ ${precoCalculado.toFixed(2)}`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 15 },
  titulo: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  tipoContainer: { marginVertical: 10 },
  tipoButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  tipoButton: { flex: 1, padding: 12, marginHorizontal: 5, backgroundColor: '#e0e0e0', borderRadius: 8, alignItems: 'center' },
  tipoButtonActive: { backgroundColor: '#007AFF' },
  tipoTexto: { fontSize: 14, fontWeight: '500' },
  tipoTextoActive: { color: '#fff' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 10, elevation: 2 },
  cardSelected: { backgroundColor: '#E3F2FD', borderWidth: 1, borderColor: '#007AFF' },
  cardNome: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  cardPreco: { fontSize: 14, color: '#666', marginBottom: 4 },
  cardDescricao: { fontSize: 12, color: '#999' },
  resumo: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginTop: 20, marginBottom: 30 },
  resumoTitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  resumoTexto: { fontSize: 16, marginBottom: 5 },
  resumoPreco: { fontSize: 24, fontWeight: 'bold', color: '#007AFF', marginVertical: 10 },
  resumoInfo: { fontSize: 14, color: '#666', marginBottom: 15 },
  botaoSolicitar: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, alignItems: 'center' },
  botaoTexto: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default SolicitarScreen;