import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import SolicitarScreen from '../screens/SolicitarScreen';
import PerfilScreen from '../screens/PerfilScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Avity' }} />
      <Stack.Screen name="Solicitar" component={SolicitarScreen} options={{ title: 'Solicitar Atendimento' }} />
      <Stack.Screen name="Perfil" component={PerfilScreen} options={{ title: 'Meu Perfil' }} />
    </Stack.Navigator>
  );
}