import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { SolicitacaoProvider } from './src/context/SolicitacaoContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <SolicitacaoProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </SolicitacaoProvider>
    </AuthProvider>
  );
}