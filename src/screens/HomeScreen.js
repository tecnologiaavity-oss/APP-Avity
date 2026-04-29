import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const { user, login } = useAuth();

  React.useEffect(() => {
    if (!user) {
      login('teste@email.com', '123456');
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>?? Avity</Text>
      <Text style={styles.subtitle}>Sua sa£de na palma da m∆o</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Solicitar')}
      >
        <Text style={styles.buttonText}>Solicitar Atendimento</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.buttonSecundario]}
        onPress={() => navigation.navigate('Perfil')}
      >
        <Text style={styles.buttonText}>Meu Perfil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 48, fontWeight: 'bold', marginBottom: 10, color: '#007AFF' },
  subtitle: { fontSize: 18, color: '#666', marginBottom: 50 },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, marginVertical: 10, width: '80%', alignItems: 'center' },
  buttonSecundario: { backgroundColor: '#34C759' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});