// screens/NegociaScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from "react-native";
import { theme } from "../theme";

export default function NegociaScreen({ route, navigation }) {
  const { especialidade, onValorNegociado } = route.params || {};
  const [valor, setValor] = useState(50);
  const [aceitarAutomatico, setAceitarAutomatico] = useState(false);
  const [editando, setEditando] = useState(false);
  const [valorInput, setValorInput] = useState("50");

  const valorSugerido = 50;
  const valorMinimo = 20;
  const valorMaximo = 150;

  const aumentarValor = () => {
    if (valor < valorMaximo) {
      const novoValor = Math.min(valor + 5, valorMaximo);
      setValor(novoValor);
      setValorInput(novoValor.toString());
    }
  };

  const diminuirValor = () => {
    if (valor > valorMinimo) {
      const novoValor = Math.max(valor - 5, valorMinimo);
      setValor(novoValor);
      setValorInput(novoValor.toString());
    }
  };

  const handleConfirmar = () => {
    if (onValorNegociado) {
      onValorNegociado(valor);
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Avity Negocia</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>Faça sua oferta</Text>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💰 Valor sugerido</Text>
          <Text style={styles.infoValue}>R$ {valorSugerido}</Text>
          <Text style={styles.infoDesc}>
            Clínicas costumam aceitar valores próximos ao sugerido.
            Você pode oferecer um valor menor, mas isso pode reduzir as chances de aceitação.
          </Text>
        </View>

        {/* Controles de valor */}
        <View style={styles.negociaContainer}>
          <TouchableOpacity onPress={diminuirValor} style={styles.negociaBtn}>
            <Text style={styles.negociaBtnText}>−</Text>
          </TouchableOpacity>
          
          {editando ? (
            <TextInput
              style={styles.valorInput}
              value={valorInput}
              onChangeText={(text) => {
                setValorInput(text);
                const num = parseInt(text);
                if (!isNaN(num) && num >= valorMinimo && num <= valorMaximo) {
                  setValor(num);
                }
              }}
              keyboardType="numeric"
              autoFocus
              onBlur={() => setEditando(false)}
            />
          ) : (
            <TouchableOpacity onPress={() => setEditando(true)}>
              <Text style={styles.valorDisplay}>R$ {valor}</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity onPress={aumentarValor} style={styles.negociaBtn}>
            <Text style={styles.negociaBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Slider visual */}
        <View style={styles.sliderContainer}>
          <View style={styles.sliderTrack}>
            <View 
              style={[
                styles.sliderFill, 
                { width: `${((valor - valorMinimo) / (valorMaximo - valorMinimo)) * 100}%` }
              ]} 
            />
          </View>
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>R$ {valorMinimo}</Text>
            <Text style={styles.sliderLabelCentral}>R$ {valorSugerido}</Text>
            <Text style={styles.sliderLabel}>R$ {valorMaximo}</Text>
          </View>
        </View>

        {/* Switch aceitar automaticamente */}
        <View style={styles.switchContainer}>
          <View style={styles.switchTextContainer}>
            <Text style={styles.switchLabel}>Aceitar automaticamente</Text>
            <Text style={styles.switchDesc}>
              Se ativado, aceitaremos a primeira oferta recebida dentro do seu valor
            </Text>
          </View>
          <Switch
            value={aceitarAutomatico}
            onValueChange={setAceitarAutomatico}
            trackColor={{ false: "#E8ECF0", true: theme.colors.primary }}
            thumbColor="#FFF"
          />
        </View>

        {/* Botão Confirmar */}
        <TouchableOpacity style={styles.confirmarBtn} onPress={handleConfirmar}>
          <Text style={styles.confirmarBtnText}>Confirmar • R$ {valor}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E8ECF0",
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    fontSize: 24,
    color: theme.colors.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.primary,
    marginBottom: 8,
  },
  infoDesc: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  negociaContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    marginBottom: 24,
  },
  negociaBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  negociaBtnText: {
    fontSize: 24,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  valorDisplay: {
    fontSize: 42,
    fontWeight: "700",
    color: "#AF52DE",
  },
  valorInput: {
    fontSize: 42,
    fontWeight: "700",
    color: "#AF52DE",
    textAlign: "center",
    width: 150,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
    paddingVertical: 4,
  },
  sliderContainer: {
    marginBottom: 32,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: "#E8ECF0",
    borderRadius: 2,
    overflow: "hidden",
  },
  sliderFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  sliderLabel: {
    fontSize: 12,
    color: "#888",
  },
  sliderLabelCentral: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
  },
  switchTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  switchDesc: {
    fontSize: 12,
    color: "#888",
  },
  confirmarBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
  },
  confirmarBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});