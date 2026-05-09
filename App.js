import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./src/context/AuthContext";
import { PaymentProvider } from "./src/context/PaymentContext";
import { ActivityProvider } from "./src/context/ActivityContext";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <AuthProvider>
      <PaymentProvider>
        <ActivityProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </ActivityProvider>
      </PaymentProvider>
    </AuthProvider>
  );
}