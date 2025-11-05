import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import { encode, decode } from "base-64";

// Navigation types
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App"; // Adjust path if needed

// --- Fix for 'global' errors ---
if (!(global as any).btoa) {
  (global as any).btoa = encode;
}
if (!(global as any).atob) {
  (global as any).atob = decode;
}

// --- CONFIGURATION ---
const BACKEND_URL = "http://192.168.31.137:8000"; // <<< MAKE SURE THIS IS YOUR IP

// --- DATA MODELS ---
interface Score {
  label: string;
  score: number;
}
interface DetailedAnalysis {
  Greenwashing: Score[];
  "Genuine Sustainability": Score[];
  "Marketing Hype": Score[];
}
interface GreenwashResponse {
  prediction: string;
  confidence: number;
  scores: Score[];
  detailed_analysis: DetailedAnalysis;
}

// --- DEFINE PROPS ---
type Props = NativeStackScreenProps<RootStackParamList, "Detector">;

// --- COMPONENT ---
const DetectorScreen = ({ route, navigation }: Props) => {
  // Get the 'mode' from the navigation parameter
  const { mode } = route.params;

  const [claimText, setClaimText] = useState("");
  const [response, setResponse] = useState<GreenwashResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // --- API LOGIC (Same as your old file) ---
  const handleAnalyzeText = useCallback(async () => {
    if (claimText.trim() === "") {
      setErrorMessage("Please enter a claim.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setResponse(null);

    const url = `${BACKEND_URL}/api/classify-text`;
    const body = JSON.stringify({ text: claimText });

    try {
      const fetchOptions: RequestInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body,
      };

      const apiResponse = await fetch(url, fetchOptions);
      const text = await apiResponse.text();
      if (!apiResponse.ok) {
        throw new Error(
          `API Error: ${apiResponse.status} - ${text.substring(0, 100)}`
        );
      }
      if (!text) {
        throw new Error("Server returned an empty response.");
      }

      const jsonResponse: GreenwashResponse = JSON.parse(text);
      if (!jsonResponse || !jsonResponse.prediction || !jsonResponse.scores) {
        throw new Error("Invalid response structure received from API.");
      }
      setResponse(jsonResponse);
    } catch (e: any) {
      console.error("Fetch failed:", e);
      setErrorMessage(`API Connection/Parsing Error: ${e.message}.`);
    } finally {
      setLoading(false);
    }
  }, [claimText]);

  const handleFilePick = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    setResponse(null);

    try {
      const docResult = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (docResult.canceled) {
        setLoading(false);
        return;
      }

      const file = docResult.assets[0];
      const url = `${BACKEND_URL}/api/classify-file`;
      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: "application/pdf",
      } as any);

      const fetchOptions: RequestInit = {
        method: "POST",
        headers: {}, // Let fetch set content-type
        body: formData,
      };

      const apiResponse = await fetch(url, fetchOptions);
      const text = await apiResponse.text();
      if (!apiResponse.ok) {
        throw new Error(
          `API Error: ${apiResponse.status} - ${text.substring(0, 100)}`
        );
      }

      const jsonResponse: GreenwashResponse = JSON.parse(text);
      setResponse(jsonResponse);
    } catch (err: any) {
      console.error("File pick/upload error:", err);
      setErrorMessage("File pick or analysis failed. Try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // --- RENDER FUNCTIONS ---

  // This is your "buffering thing"!
  if (loading) {
    return (
      <View style={[styles.safeArea, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#006A4E" />
        <Text style={styles.loadingText}>Analyzing... Please wait.</Text>
      </View>
    );
  }

  // Renders the Text Input UI (from your mockup)
  const renderTextUI = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Analyze Claim</Text>
      <TextInput
        style={styles.input}
        onChangeText={setClaimText}
        value={claimText}
        placeholder="Enter your text to detect greenwashing..."
        multiline={true}
        numberOfLines={4}
      />
      <TouchableOpacity style={styles.button} onPress={handleAnalyzeText}>
        <Text style={styles.buttonText}>Analyze Text Claim</Text>
      </TouchableOpacity>
    </View>
  );

  // Renders a simple PDF UI (we can design this next)
  const renderPdfUI = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Analyze PDF</Text>
      <TouchableOpacity style={styles.button} onPress={handleFilePick}>
        <Ionicons name="document-text" size={18} color="#fff" />
        <Text style={styles.buttonText}>Upload PDF Document</Text>
      </TouchableOpacity>
    </View>
  );

  // Renders the Result Box (styled to your mockup)
  const renderResultBox = () => {
    if (!response) return null;

    return (
      <View style={[styles.card, styles.resultCard]}>
        <View style={styles.resultHeader}>
          <Ionicons name="checkmark-circle" size={24} color="#1e8449" />
          <Text style={styles.cardTitle}>Classification Result</Text>
        </View>

        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>Prediction:</Text>
          <Text style={styles.scoreValue}>{response.prediction}</Text>
        </View>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>Confidence:</Text>
          <Text style={styles.scoreValue}>
            {(response.confidence * 100).toFixed(2)}%
          </Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.detailedTitle}>Detailed Analysis</Text>

        {response.detailed_analysis &&
          Object.entries(response.detailed_analysis).map(([category, scores]) =>
            Array.isArray(scores) && scores.length > 0 ? (
              <View key={category} style={styles.categoryContainer}>
                <Text style={styles.categoryTitle}>{category}</Text>
                {scores.slice(0, 3).map((score, index) => (
                  <Text key={index} style={styles.indicatorText}>
                    • {score.label}: {(score.score * 100).toFixed(1)}%
                  </Text>
                ))}
              </View>
            ) : null
          )}
      </View>
    );
  };

  // --- MAIN RETURN ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Show UI based on the 'mode' parameter */}
        {mode === "text" && renderTextUI()}
        {mode === "pdf" && renderPdfUI()}

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        {/* Show results at the bottom */}
        {renderResultBox()}
      </ScrollView>
    </SafeAreaView>
  );
};

// --- NEW STYLES ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3FAF7",
  },
  container: {
    padding: 20,
  },
  // Main card style
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  // Text Input
  input: {
    backgroundColor: "#F9F9F9",
    borderColor: "#EFEFEF",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    minHeight: 120,
    fontSize: 16,
    textAlignVertical: "top",
    marginBottom: 15,
  },
  // Button
  button: {
    flexDirection: "row",
    backgroundColor: "#35A46C", // New button color from mockup
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Loading Screen
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    color: "#006A4E",
  },
  // Error Text
  errorText: {
    color: "#e74c3c",
    textAlign: "center",
    marginBottom: 10,
  },
  // Result Card
  resultCard: {
    backgroundColor: "#F3FAF7",
    borderColor: "#CDEAE0",
    borderWidth: 1,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 16,
    color: "#555",
    fontWeight: "500",
  },
  scoreValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 15,
  },
  detailedTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  categoryContainer: {
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e8449",
    marginBottom: 5,
  },
  indicatorText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 10,
    lineHeight: 20,
  },
});

export default DetectorScreen;
