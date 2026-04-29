import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function PerfilScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meu Perfil</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>Nome:</Text>
        <Text style={styles.value}>{user?.nome || 'NÆo informado'}</Text>
        
        <Text style={styles.label}>E-mail:</Text>
        <Text style={styles.value}>{user?.email || 'NÆo informado'}</Text>
        
        <Text style={styles.label}>CPF:</Text>
        <Text style={styles.value}>{user?.cpf || 'NÆo informado'}</Text>
      </View>

      <TouchableOpacity style={styles.buttonLogout} onPress={logout}>
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 20, elevation: 2, marginBottom: 20 },
  label: { fontSize: 14, color: '#666', marginTop: 10 },
  value: { fontSize: 16, fontWeight: '500', marginTop: 5 },
  buttonLogout: { backgroundColor: '#FF3B30', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});