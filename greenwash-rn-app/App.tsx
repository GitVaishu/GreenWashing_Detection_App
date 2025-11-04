import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker'; // For PDF file selection
import * as FileSystem from 'expo-file-system'; // For reading file data
import { Ionicons } from '@expo/vector-icons'; // For icons
// NOTE: Base-64 is required for polyfilling fetch in some React Native environments
import { decode } from 'base-64'; 
// Polyfill for base64 if needed for older RN versions
if (!global.btoa) { global.btoa = decode; }
if (!global.atob) { global.atob = decode; }


// --- CONFIGURATION ---
// IMPORTANT: Use the IP address of the machine running the FastAPI server.
// For Android Emulator: 10.0.2.2
// For physical Android device on the same WiFi: Find your PC's local IP (e.g., 192.168.1.10)
const BACKEND_URL = 'http://10.0.2.2:8000'; 

// --- DATA MODELS ---

interface Score {
  label: string;
  score: number;
}

interface GreenwashResponse {
  prediction: string;
  confidence: number;
  scores: Score[];
  detailed_analysis: {
    'Greenwashing': Score[];
    'Genuine Sustainability': Score[];
    'Marketing Hype': Score[];
  };
}


const App = () => {
  const [claimText, setClaimText] = useState('');
  const [response, setResponse] = useState<GreenwashResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const getBackgroundColor = (prediction: string) => {
    switch (prediction) {
      case 'Greenwashing':
        return '#f8d7da'; // Light Red/Danger
      case 'Genuine Sustainability':
        return '#d4edda'; // Light Green/Success
      case 'Marketing Hype':
        return '#fff3cd'; // Light Yellow/Warning
      default:
        return '#f8f9fa';
    }
  };

  const getColor = (prediction: string) => {
    switch (prediction) {
      case 'Greenwashing':
        return '#721c24'; // Dark Red
      case 'Genuine Sustainability':
        return '#155724'; // Dark Green
      case 'Marketing Hype':
        return '#856404'; // Dark Yellow
      default:
        return '#343a40';
    }
  };

  const handleAnalyzeText = useCallback(async (isFile = false, fileUri = '', fileName = '') => {
    setLoading(true);
    setErrorMessage('');
    setResponse(null);
    
    let url = `${BACKEND_URL}/api/classify-text`;
    let body: any = { text: claimText };
    let headers: HeadersInit = { 'Content-Type': 'application/json' };

    if (isFile) {
      url = `${BACKEND_URL}/api/classify-file`;
      // Headers must be empty for multipart/form-data to let fetch set boundaries
      headers = {}; 
      
      try {
        // NOTE: Reading as Base64 is not strictly necessary for file upload, 
        // but keeping it simple for demonstration. The actual file upload needs 
        // to be handled as multipart/form-data, which is complex in RN's fetch.
        // We will stick to the standard multipart structure which Expo/RN should handle.

        const formData = new FormData();
        
        // Append the file using a Blob-like structure required for RN fetch
        formData.append('file', {
          uri: fileUri,
          name: fileName,
          type: 'application/pdf',
        } as any);

        body = formData;
        
      } catch (e) {
        setLoading(false);
        setErrorMessage('Failed to prepare file data.');
        console.error(e);
        return;
      }
    } else if (claimText.trim() === '') {
      setLoading(false);
      setErrorMessage('Please enter a claim or select a file.');
      return;
    }


    try {
      const fetchOptions: RequestInit = {
        method: 'POST',
        headers: body instanceof FormData ? {} : headers, // Ensure headers are correct for JSON or FormData
        body: body instanceof FormData ? body : JSON.stringify(body),
        // mode: 'cors' is usually not needed or problematic in native fetch/Expo environments
      };

      const apiResponse = await fetch(url, fetchOptions);
      
      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        throw new Error(`API Error: ${apiResponse.status} - ${errorText.substring(0, 100)}`);
      }

      const jsonResponse: GreenwashResponse = await apiResponse.json();
      setResponse(jsonResponse);

    } catch (e: any) {
      console.error("Fetch failed:", e);
      // NOTE: For physical device testing, user needs to update BACKEND_URL to their PC's local IP
      setErrorMessage(`Connection Error: Check your backend server and the BACKEND_URL in App.tsx.`);
    } finally {
      setLoading(false);
    }
  }, [claimText]);

  const handleFilePick = async () => {
    try {
      // NOTE: Using DocumentPicker from Expo, which handles file selection on mobile
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        if (file.mimeType && !file.mimeType.includes('pdf')) {
          setErrorMessage('Please select a PDF file.');
          return;
        }
        Alert.alert(
          "Analyzing PDF",
          `Sending file: ${file.name}. This may take a moment.`,
          [{ text: "OK" }]
        );
        
        // Reset claimText to indicate file analysis is happening
        setClaimText(`[File: ${file.name} selected for analysis...]`); 
        
        // Pass the file details to the main handler for API call
        await handleAnalyzeText(true, file.uri, file.name);

      }
    } catch (err) {
      console.error("Document Picker Error:", err);
      setErrorMessage("File picker failed. Try again.");
    }
  };

  const renderResultBox = () => {
    if (!response) return null;

    const mainPrediction = response.prediction;
    const mainConfidence = response.confidence;
    const bgColor = getBackgroundColor(mainPrediction);
    const textColor = getColor(mainPrediction);
    const icon = mainPrediction === 'Greenwashing' ? 'warning' : mainPrediction === 'Genuine Sustainability' ? 'checkmark-circle' : 'megaphone';

    return (
      <View style={[styles.resultBox, { backgroundColor: bgColor, borderColor: textColor }]}>
        <Text style={[styles.resultTitle, { color: textColor }]}>
          <Ionicons name={icon as any} size={24} color={textColor} /> Classification Result
        </Text>
        
        <View style={styles.scoreRow}>
          <Text style={[styles.scoreLabel, { color: textColor }]}>Prediction:</Text>
          <Text style={[styles.scoreValue, { color: textColor }]}>{mainPrediction}</Text>
        </View>

        <View style={styles.scoreRow}>
          <Text style={[styles.scoreLabel, { color: textColor }]}>Confidence:</Text>
          <Text style={[styles.scoreValue, { color: textColor }]}>{(mainConfidence * 100).toFixed(2)}%</Text>
        </View>

        {/* Detailed Scores */}
        <View style={styles.detailedSection}>
          <Text style={styles.detailedTitle}>Detailed Analysis</Text>
          {Object.entries(response.detailed_analysis).map(([category, scores]) => (
            <View key={category} style={styles.categoryContainer}>
              <Text style={styles.categoryTitle}>{category}</Text>
              {scores.slice(0, 3).map((score, index) => (
                <Text key={index} style={styles.indicatorText}>
                  • {score.label}: {(score.score * 100).toFixed(1)}%
                </Text>
              ))}
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>🌱 Greenwash Detector</Text>
        <Text style={styles.tagline}>AI-powered sustainability claim analysis</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analyze Claim</Text>
          <TextInput
            style={styles.input}
            onChangeText={setClaimText}
            value={claimText}
            placeholder="Enter a sustainability claim..."
            multiline={true}
            numberOfLines={4}
          />

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]} 
              onPress={() => handleAnalyzeText(false)}
              disabled={loading || claimText.trim() === ''}
            >
              <Text style={styles.buttonText}>Analyze Text Claim</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]} 
              onPress={handleFilePick}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                <Ionicons name="document-text" size={16} color="#fff" /> Analyze PDF
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Analyzing claim with DistilBERT...</Text>
          </View>
        )}

        {renderResultBox()}
        
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e8449',
    textAlign: 'center',
    marginBottom: 5,
  },
  tagline: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  primaryButton: {
    backgroundColor: '#1e8449',
  },
  secondaryButton: {
    backgroundColor: '#3498db',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#e74c3c',
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  resultBox: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottomWidth: 1,
    paddingBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailedSection: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  detailedTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#444',
  },
  categoryContainer: {
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 5,
    color: '#333',
  },
  indicatorText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
});

export default App;
