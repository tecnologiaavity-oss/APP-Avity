import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../context/AuthContext";

import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import SelecaoScreen from "../screens/SelecaoScreen";
import EscolherPagamentoScreen from "../screens/EscolherPagamentoScreen";
import PagamentoPixScreen from "../screens/PagamentoPixScreen";
import PagamentoCartaoScreen from "../screens/PagamentoCartaoScreen";
import PagamentoPixLifeScreen from "../screens/PagamentoPixLifeScreen";
import PagamentoCartaoLifeScreen from "../screens/PagamentoCartaoLifeScreen";
import NegociaScreen from "../screens/NegociaScreen";
import ProcurandoClinicaScreen from "../screens/ProcurandoClinicaScreen";
import DetalhesConsultaScreen from "../screens/DetalhesConsultaScreen";
import CarteiraScreen from "../screens/CarteiraScreen";
import MenuPlaceholderScreen from "../screens/MenuPlaceholderScreen";
import AtividadesScreen from "../screens/AtividadesScreen";
import EditarInformacoesScreen from "../screens/EditarInformacoesScreen";
import AcademiasScreen from "../screens/AcademiasScreen";
import PlanosAvityScreen from "../screens/PlanosAvityScreen";
import EscolherAcademiaScreen from "../screens/EscolherAcademiaScreen";
import ConfirmacaoScreen from "../screens/ConfirmacaoScreen";
import UserPanelScreen from "../screens/UserPanelScreen";

const Stack = createStackNavigator();

function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Telas principais */}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Selecao" component={SelecaoScreen} />
      <Stack.Screen name="EscolherPagamento" component={EscolherPagamentoScreen} />
      
      {/* Telas de pagamento - Clínicas */}
      <Stack.Screen name="PagamentoPix" component={PagamentoPixScreen} />
      <Stack.Screen name="PagamentoCartao" component={PagamentoCartaoScreen} />
      
      {/* Telas de pagamento - Avity Life */}
      <Stack.Screen name="PagamentoPixLife" component={PagamentoPixLifeScreen} />
      <Stack.Screen name="PagamentoCartaoLife" component={PagamentoCartaoLifeScreen} />
      
      {/* Telas de negociação e clínicas */}
      <Stack.Screen name="NegociaScreen" component={NegociaScreen} />
      <Stack.Screen name="ProcurandoClinica" component={ProcurandoClinicaScreen} />
      <Stack.Screen name="DetalhesConsulta" component={DetalhesConsultaScreen} />
      
      {/* Telas de usuário */}
      <Stack.Screen name="Carteira" component={CarteiraScreen} />
      <Stack.Screen name="MenuPlaceholder" component={MenuPlaceholderScreen} />
      <Stack.Screen name="Atividades" component={AtividadesScreen} />
      <Stack.Screen name="EditarInformacoes" component={EditarInformacoesScreen} />
      
      {/* Telas Avity Life */}
      <Stack.Screen name="Academias" component={AcademiasScreen} />
      <Stack.Screen name="PlanosAvity" component={PlanosAvityScreen} />
      <Stack.Screen name="EscolherAcademia" component={EscolherAcademiaScreen} />
      <Stack.Screen name="Confirmacao" component={ConfirmacaoScreen} />
      <Stack.Screen name="UserPanel" component={UserPanelScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return !user ? <LoginScreen /> : <AppStack />;
}