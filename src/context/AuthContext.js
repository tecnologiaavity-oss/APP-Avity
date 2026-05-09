import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStoredUser(); }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('@Avity:user');
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch (error) { console.error('Erro:', error); }
    finally { setLoading(false); }
  };

  // Função para enviar código via SMS
  const sendCode = async (phoneNumber) => {
    console.log(`📱 Código enviado para ${phoneNumber}: 123456`);
    
    // Armazenar número para verificação
    await AsyncStorage.setItem('@Avity:verificationPhone', phoneNumber);
    
    // Em produção com Firebase:
    // const confirmation = await signInWithPhoneNumber(auth, `+55${phoneNumber}`);
    // setVerificationId(confirmation.verificationId);
    
    return true;
  };

  // Função para verificar o código
  const verifyCode = async (phoneNumber, code) => {
    // SIMULAÇÃO: código válido = 123456
    if (code === "123456") {
      const mockUser = {
        uid: Date.now().toString(),
        nome: "Usuário",
        telefone: phoneNumber,
        email: `${phoneNumber}@avity.com`,
      };
      
      await AsyncStorage.setItem('@Avity:user', JSON.stringify(mockUser));
      setUser(mockUser);
      return true;
    }
    
    throw new Error("Código inválido");
  };

  // Login com email/senha (manter para compatibilidade)
  const login = async (email, password) => {
    const mockUser = { id: Date.now().toString(), nome: email.split('@')[0], email: email };
    await AsyncStorage.setItem('@Avity:user', JSON.stringify(mockUser));
    setUser(mockUser);
    return { success: true };
  };

  // Logout
  const logout = async () => {
    await AsyncStorage.removeItem('@Avity:user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, sendCode, verifyCode, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};