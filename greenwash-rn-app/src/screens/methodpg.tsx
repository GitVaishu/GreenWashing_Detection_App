import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App"; // Adjust path if needed

// Define this screen's navigation props
type Props = NativeStackScreenProps<RootStackParamList, "Method">;

const MethodScreen = ({ navigation }: Props) => {
  const handleNotImplemented = () => {
    Alert.alert(
      "Feature Coming Soon",
      "Image-based detection is not yet implemented."
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#00552E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Choose Detection Method</Text>
        </View>

        {/* --- This wrapper centers the buttons --- */}
        <View style={styles.buttonWrapper}>
          {/* --- Button 1: Detect through Text --- */}
          <TouchableOpacity
            style={styles.methodBox}
            onPress={() => navigation.navigate("Detector")}
          >
            <View style={styles.iconCircle}>
              <Ionicons
                name="document-text-outline"
                size={28}
                color="#1e8449"
              />
            </View>
            <View style={styles.textBox}>
              <Text style={styles.methodTitle}>Detect through Text</Text>
              <Text style={styles.methodSubtitle}>
                Analyze text content for greenwashing
              </Text>
            </View>
          </TouchableOpacity>

          {/* --- Button 2: Detect through PDF --- */}
          <TouchableOpacity
            style={styles.methodBox}
            onPress={() => navigation.navigate("Detector")}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="document-text" size={28} color="#1e8449" />
            </View>
            <View style={styles.textBox}>
              <Text style={styles.methodTitle}>Detect through PDF</Text>
              <Text style={styles.methodSubtitle}>
                Upload and scan PDF documents
              </Text>
            </View>
          </TouchableOpacity>

          {/* --- Button 3: Detect through Image --- */}
          <TouchableOpacity
            style={styles.methodBox}
            onPress={handleNotImplemented}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="image-outline" size={28} color="#1e8449" />
            </View>
            <View style={styles.textBox}>
              <Text style={styles.methodTitle}>Detect through Image</Text>
              <Text style={styles.methodSubtitle}>
                Upload images to detect greenwashing
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        {/* --- END OF WRAPPER --- */}

        {/* --- IMAGE AT THE BOTTOM --- */}
        <Image
          source={require("C:\\Users\\Anagha\\OneDrive\\Desktop\\MDM project\\g2\\GreenWashing_Detection_App\\greenwash-rn-app\\assets\\images\\i1.png")} // <<< UPDATE THIS PATH!
          style={styles.bottomImage}
        />
        {/* --- END IMAGE COMPONENT --- */}
      </View>
    </SafeAreaView>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3FAF7",
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    marginTop: 50, // Pushes the header down
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#00552E",
    marginLeft: 15,
  },
  buttonWrapper: {
    //flex: 1, // Takes up remaining space
    justifyContent: "center", // Centers buttons vertically
  },
  methodBox: {
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
  methodTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  methodSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  bottomImage: {
    // Style for your new image
    width: "100%",
    height: 150,
    resizeMode: "cover",
    alignSelf: "center",
    marginTop: 0,
    marginBottom: 80,
    opacity: 2.0,
  },
});

export default MethodScreen;
