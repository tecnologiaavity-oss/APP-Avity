import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, TextInput } from "react-native";
import * as Location from "expo-location";
import { theme } from "../theme";

export default function LocalizacaoAtual({ onLocationChange }) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editAddress, setEditAddress] = useState("");

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      const locationData = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        address: address[0] ? `${address[0].street}, ${address[0].district}` : "Localização atual",
      };
      setLocation(locationData);
      setEditAddress(locationData.address);
      if (onLocationChange) onLocationChange(locationData);
    } catch (error) {
      console.error("Erro de localização:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveAddress = () => {
    setLocation({ ...location, address: editAddress });
    setModalVisible(false);
    if (onLocationChange) onLocationChange({ ...location, address: editAddress });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={styles.text}>Obtendo localização...</Text>
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity style={styles.container} onPress={() => setModalVisible(true)}>
        <Text style={styles.icon}>📍</Text>
        <View style={styles.info}>
          <Text style={styles.label}>Localização atual</Text>
          <Text style={styles.address}>{location?.address}</Text>
        </View>
        <Text style={styles.editIcon}>✏️</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar endereço</Text>
            <TextInput style={styles.input} value={editAddress} onChangeText={setEditAddress} placeholder="Digite seu endereço" />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveAddress}>
                <Text style={{ color: "#fff" }}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 12, marginHorizontal: 16, marginVertical: 8, borderRadius: 12, ...theme.shadow.small },
  icon: { fontSize: 24, marginRight: 12 },
  info: { flex: 1 },
  label: { fontSize: 12, color: "#666" },
  address: { fontSize: 14, fontWeight: "500" },
  editIcon: { fontSize: 16, color: "#999" },
  text: { marginLeft: 8, fontSize: 14, color: "#666" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#fff", borderRadius: 16, padding: 20, width: "80%" },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, marginBottom: 16 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  cancelButton: { flex: 1, padding: 12, alignItems: "center", marginRight: 8, backgroundColor: "#f0f0f0", borderRadius: 8 },
  saveButton: { flex: 1, padding: 12, alignItems: "center", backgroundColor: theme.colors.primary, borderRadius: 8 },
});