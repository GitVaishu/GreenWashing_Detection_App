import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Button,
  SafeAreaView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// 1. IMPORT THE TYPES
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
// Use the correct relative path
import type { RootStackParamList } from "../../App";

// 2. DEFINE THE DATA TYPES
type SdgData = {
  sdg9: {
    title: string;
    description: string;
  };
  sdg12: {
    title: string;
    description: string;
  };
};
type SdgDataKeys = keyof SdgData;

// 3. DEFINE THE SCREEN PROP TYPE
type Props = NativeStackScreenProps<RootStackParamList, "Landing">;

// 4. DATA FOR YOUR SDGS
const sdgData: SdgData = {
  sdg9: {
    title: "SDG 9: Industry, Innovation and Infrastructure",
    description:
      "Build resilient infrastructure, promote inclusive and sustainable industrialization and foster innovation.",
  },
  sdg12: {
    title: "SDG 12: Responsible Consumption and Production",
    description: "Ensure sustainable consumption and production patterns.",
  },
};

// 5. USE THE PROP TYPE
const LandingScreen = ({ navigation }: Props) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedSdg, setSelectedSdg] = useState({
    title: "",
    description: "",
  });

  // 6. USE THE KEY TYPE
  const handleSdgPress = (sdgKey: SdgDataKeys) => {
    setSelectedSdg(sdgData[sdgKey]);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Green Cart</Text>

        <View style={styles.iconCircle}>
          <Ionicons name="leaf" size={60} color="#fff" />
        </View>

        <Text style={styles.subtitle}>
          Supporting UN Sustainable Development Goals
        </Text>

        <View style={styles.sdgContainer}>
          <TouchableOpacity
            style={[styles.sdgBox, { backgroundColor: "#E85D04" }]}
            onPress={() => handleSdgPress("sdg9")}
          >
            <Text style={styles.sdgTitle}>SDG 9</Text>
            <Text style={styles.sdgSubtitle}>
              Industry, Innovation and Infrastructure
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sdgBox, { backgroundColor: "#D68C00" }]}
            onPress={() => handleSdgPress("sdg12")}
          >
            <Text style={styles.sdgTitle}>SDG 12</Text>
            <Text style={styles.sdgSubtitle}>
              Responsible Consumption and Production
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={() => navigation.navigate("Detector")}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>{selectedSdg.title}</Text>
              <Text style={styles.modalDescription}>
                {selectedSdg.description}
              </Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

// Styles (same as before)
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3FAF7",
  },
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 48,
    fontWeight: "normal",
    color: "#00552E",
    fontFamily: "serif",
    marginTop: 20,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#28A745",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  sdgContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  sdgBox: {
    width: 140,
    height: 140,
    borderRadius: 15,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  sdgTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  sdgSubtitle: {
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
    marginTop: 8,
    fontWeight: "500",
  },
  getStartedButton: {
    backgroundColor: "#006A4E",
    paddingVertical: 18,
    width: "100%",
    borderRadius: 30,
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 25,
  },
  modalButton: {
    backgroundColor: "#006A4E",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 40,
    elevation: 2,
  },
});

export default LandingScreen;
