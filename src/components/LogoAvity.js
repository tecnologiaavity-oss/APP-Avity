import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";

export default function LoginScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>avity</Text>
        <Text style={styles.slogan}>Saúde Inteligente</Text>
        <Text style={styles.test}>Se você está vendo isso, o arquivo foi atualizado!</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  logo: { fontSize: 48, fontWeight: "700", color: "#005C4A" },
  slogan: { fontSize: 14, color: "#666", marginTop: 8 },
  test: { fontSize: 14, color: "red", marginTop: 20 },
});