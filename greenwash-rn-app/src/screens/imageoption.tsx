import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App"; // Adjust path if needed
import * as ImagePicker from "expo-image-picker";

// Define this screen's navigation props
type Props = NativeStackScreenProps<RootStackParamList, "ImageOption">;

const ImageOptionScreen = ({ navigation }: Props) => {
  // --- Upload Image (from Gallery) ---
  const pickImage = async () => {
    // Ask for permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please grant permission to access your photo library."
      );
      return;
    }

    // Launch gallery
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      // Navigate to Detector screen with the new image URI
      navigation.navigate("Detector", {
        mode: "image",
        imageUri: result.assets[0].uri,
      });
    }
  };

  // --- Take Image (from Camera) ---
  const takeImage = async () => {
    // Ask for permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please grant permission to access your camera."
      );
      return;
    }

    // Launch camera
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      // Navigate to Detector screen with the new image URI
      navigation.navigate("Detector", {
        mode: "image",
        imageUri: result.assets[0].uri,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Choose an option</Text>

        {/* --- Button 1: Upload Image --- */}
        <TouchableOpacity style={styles.optionBox} onPress={pickImage}>
          <View style={styles.iconCircle}>
            <Ionicons name="cloud-upload-outline" size={28} color="#1e8449" />
          </View>
          <View style={styles.textBox}>
            <Text style={styles.optionTitle}>Upload Image</Text>
            <Text style={styles.optionSubtitle}>Choose from your gallery</Text>
          </View>
        </TouchableOpacity>

        {/* --- Button 2: Take Image --- */}
        <TouchableOpacity style={styles.optionBox} onPress={takeImage}>
          <View style={styles.iconCircle}>
            <Ionicons name="camera-outline" size={28} color="#1e8449" />
          </View>
          <View style={styles.textBox}>
            <Text style={styles.optionTitle}>Take Image</Text>
            <Text style={styles.optionSubtitle}>Capture photo with camera</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Styles for this new screen
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3FAF7",
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center", // Center the buttons
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#00552E",
    textAlign: "center",
    marginBottom: 40,
  },
  optionBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 3,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E6F6EC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  textBox: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  optionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
});

export default ImageOptionScreen;
