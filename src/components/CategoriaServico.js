import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CATEGORIAS } from '../data/especialidades';

const CategoriaServico = ({ selected, onSelect }) => {
  const categorias = Object.entries(CATEGORIAS);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Tipo de Atendimento</Text>
      <View style={styles.grid}>
        {categorias.map(([key, cat]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.categoriaCard,
              selected === key && styles.categoriaSelected,
              cat.urgente && styles.categoriaUrgente
            ]}
            onPress={() => onSelect(key)}
          >
            <Text style={[
              styles.categoriaNome,
              selected === key && styles.textSelected,
              cat.urgente && styles.textUrgente
            ]}>
              {cat.nome}
            </Text>
            <Text style={styles.categoriaPreco}>
              a partir de R$ {cat.precoMinimo}
            </Text>
            <Text style={styles.categoriaDescricao}>
              {cat.descricao}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 10 },
  titulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  categoriaCard: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoriaSelected: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  categoriaUrgente: { backgroundColor: '#FFE5E5', borderColor: '#FF0000' },
  categoriaNome: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  textSelected: { color: '#fff' },
  textUrgente: { color: '#FF0000' },
  categoriaPreco: { fontSize: 14, color: '#666', marginBottom: 4 },
  categoriaDescricao: { fontSize: 12, color: '#999' },
});

export default CategoriaServico;